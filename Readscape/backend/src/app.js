const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { randomBytes } = require('node:crypto');
const { normalizeBook, googleBooks } = require('./books');
function createApp(pool, books = googleBooks) {
  const app = express();
  const sessions = new Map(); // Local development login; teammate can replace with authentication service.
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '32kb' }));
  const fail = (status, message) => Object.assign(new Error(message), { status });
  const publicUser = u => ({ id: u.id, name: u.name, username: u.username, email: u.email });
  app.get('/api/health', async (_req, res) => { await pool.query('SELECT 1'); res.json({ database: 'connected', googleBooksConfigured: !!process.env.GOOGLE_BOOKS_API_KEY }); });
  app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    if (![name, username, email, password].every(x => typeof x === 'string' && x.trim()) || password.length < 8 || password.length > 72 || !/^[a-zA-Z0-9_.-]{3,40}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Enter a name, valid email, username (3–40 letters/numbers), and password (8–72 characters).');
    const hash = await bcrypt.hash(password, 12);
    try {
      const { rows } = await pool.query('INSERT INTO readscape_users (name,username,email,password_hash) VALUES ($1,$2,$3,$4) RETURNING id,name,username,email', [name.trim(), username.trim(), email.trim().toLowerCase(), hash]);
      res.status(201).json({ user: publicUser(rows[0]) });
    } catch (error) { if (error.code === '23505') throw fail(409, 'Username or email is already registered.'); throw error; }
  });
  app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (typeof identifier !== 'string' || typeof password !== 'string') throw fail(400, 'Enter your username or email and password.');
    const { rows } = await pool.query('SELECT * FROM readscape_users WHERE lower(username)=lower($1) OR lower(email)=lower($1)', [identifier.trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) throw fail(401, 'Incorrect username or password.');
    const token = randomBytes(32).toString('hex');
    sessions.set(token, { user: publicUser(user), expires: Date.now() + 86400000 });
    // Prune expired sessions whenever someone logs in.
    for (const [key, value] of sessions) if (value.expires < Date.now()) sessions.delete(key);
    res.json({ token, user: publicUser(user) });
  });
  app.use('/api', (req, _res, next) => {
    const token = req.get('Authorization')?.replace(/^Bearer /, '');
    const session = sessions.get(token);
    if (!session || session.expires < Date.now()) { sessions.delete(token); return next(fail(401, 'Please log in again.')); }
    req.user = session.user; req.token = token; next();
  });
  app.get('/api/books/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q || q.length > 200) throw fail(400, 'Enter a book title or author (up to 200 characters).');
    const data = await books('volumes', { q, maxResults: 20 });
    const found = (data.items || []).map(normalizeBook);
    // Persist search results once in the shared catalog; adding links them to a user.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const book of found) await client.query('INSERT INTO readscape_books (id,title,authors,description,categories,pages,cover) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING', [book.id,book.title,JSON.stringify(book.authors),book.description,JSON.stringify(book.categories),book.pages,book.cover]);
      await client.query('COMMIT');
    } catch(error) { await client.query('ROLLBACK'); throw error; } finally {client.release();}
    res.json({ books: found });
  });
  app.post('/api/auth/logout', (req, res) => { sessions.delete(req.token); res.sendStatus(204); });
  app.get('/api/auth/me', (req, res) => res.json({ user: req.user }));
  const library = async userId => {
    const { rows } = await pool.query('SELECT b.*, ub.status, ub.current_page, ub.added_at FROM readscape_user_books ub JOIN readscape_books b ON b.id=ub.book_id WHERE ub.user_id=$1 ORDER BY ub.added_at DESC', [userId]);
    return rows.map(b => ({ ...b, author: b.authors.join(', '), genre: b.categories.join(', '), currentPage: b.current_page, progress: b.pages ? Math.min(100, Math.round(b.current_page / b.pages * 100)) : 0 }));
  };
  app.get('/api/library', async (req, res) => res.json({ books: await library(req.user.id) }));
  app.get('/api/dashboard', async (req, res) => {
    const items = await library(req.user.id);
    res.json({ user: req.user, books: items, counts: { reading: items.filter(b => b.status === 'reading').length, finished: items.filter(b => b.status === 'finished').length, want: items.filter(b => b.status === 'want').length }, pagesRead: items.reduce((n,b) => n+b.currentPage,0) });
  });
  app.post('/api/library', async (req, res) => {
    const { googleBookId } = req.body;
    if (typeof googleBookId !== 'string' || !/^[\w-]{1,100}$/.test(googleBookId)) throw fail(400, 'Select a valid Google Books result.');
    const book = normalizeBook(await books(`volumes/${encodeURIComponent(googleBookId)}`));
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO readscape_books (id,title,authors,description,categories,pages,cover) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING', [book.id,book.title,JSON.stringify(book.authors),book.description,JSON.stringify(book.categories),book.pages,book.cover]);
      await client.query('INSERT INTO readscape_user_books (user_id,book_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.user.id,book.id]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    res.status(201).json({ book });
  });
  app.patch('/api/library/:id', async (req,res) => {
    const { status, currentPage } = req.body;
    if (!['want','reading','finished'].includes(status) || !Number.isInteger(currentPage) || currentPage < 0) throw fail(400,'Enter a valid status and page number.');
    const { rows } = await pool.query('UPDATE readscape_user_books ub SET status=$1,current_page=$2 FROM readscape_books b WHERE ub.book_id=b.id AND ub.user_id=$3 AND ub.book_id=$4 AND (b.pages=0 OR $2<=b.pages) RETURNING ub.book_id', [status,currentPage,req.user.id,req.params.id]);
    if (!rows.length) throw fail(400,'Book not found or page exceeds the book length.');
    res.json({ updated: true });
  });
  app.use((_req,_res,next) => next(fail(404,'Endpoint not found.')));
  app.use((error,_req,res,_next) => res.status(error.status || 500).json({ error: error.status ? error.message : 'Database request failed. Please try again.' }));
  return app;
}
module.exports = { createApp };
