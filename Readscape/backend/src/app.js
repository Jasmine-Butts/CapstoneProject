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
  const { identifier, password } = req.body || {};

  if (
    typeof identifier !== 'string' ||
    typeof password !== 'string'
  ) {
    throw fail(
      400,
      'Enter your username or email and password.'
    );
  }

  // Find the user in Neon PostgreSQL.
  const { rows } = await pool.query(
    `SELECT *
     FROM readscape_users
     WHERE lower(username) = lower($1)
        OR lower(email) = lower($1)`,
    [identifier.trim()]
  );

  const user = rows[0];

  // Check login credentials first.
  if (
    !user ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    throw fail(401, 'Incorrect username or password.');
  }

  // Prevent suspended accounts from logging in.
  if (user.is_suspended) {
    throw fail(
      403,
      'Your account has been suspended. Please contact an administrator.'
    );
  }

  // Create a login session.
  const token = randomBytes(32).toString('hex');

  sessions.set(token, {
    user: publicUser(user),
    expires: Date.now() + 86400000
  });

  // Remove expired sessions.
  for (const [key, value] of sessions) {
    if (value.expires < Date.now()) {
      sessions.delete(key);
    }
  }

  res.json({
    token,
    user: publicUser(user)
  });
});

  
app.use('/api', async (req, _res, next) => {
  const token = req.get('Authorization')?.replace(/^Bearer /, '');
  const session = sessions.get(token);

  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return next(fail(401, 'Please log in again.'));
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, is_suspended
       FROM readscape_users
       WHERE id = $1`,
      [session.user.id]
    );

    if (!rows.length) {
      sessions.delete(token);
      return next(fail(401, 'User account no longer exists.'));
    }

    if (rows[0].is_suspended) {
      sessions.delete(token);

      return next(
        fail(
          403,
          'Your account has been suspended. Please contact an administrator.'
        )
      );
    }

    req.user = session.user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
});




app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    authorized: true,
    message: "Welcome to Readscape Admin!",
    userId: req.user.id
  });
});


app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int
       FROM readscape_users) AS total_users,

      (SELECT COUNT(*)::int
       FROM readscape_user_books) AS books_tracked,

      (SELECT COUNT(*)::int
       FROM readscape_clubs) AS total_clubs,

      (SELECT COUNT(*)::int
       FROM readscape_club_members) AS club_memberships
  `);

  res.json({
    stats: rows[0]
  });
});


app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

  if (search.length > 100) {
    throw fail(400, "Search must be 100 characters or fewer.");
  }

  const { rows } = await pool.query(
    `SELECT
       id,
       name,
       username,
       email,
       role,
       is_suspended,
       created_at,
       (
         SELECT COUNT(*)::int
         FROM readscape_user_books ub
         WHERE ub.user_id = u.id
       ) AS books_tracked,
       (
         SELECT COUNT(*)::int
         FROM readscape_club_members cm
         WHERE cm.user_id = u.id
       ) AS clubs_joined
     FROM readscape_users u
     WHERE
       $1 = ''
       OR name ILIKE '%' || $1 || '%'
       OR username ILIKE '%' || $1 || '%'
       OR email ILIKE '%' || $1 || '%'
     ORDER BY created_at DESC, id DESC
     LIMIT 50`,
    [search]
  );

  res.json({ users: rows });
});


app.get("/api/admin/moderators", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       id,
       name,
       username,
       email,
       role,
       is_suspended,
       created_at,
       (
         SELECT COUNT(*)::int
         FROM readscape_club_members cm
         WHERE cm.user_id = u.id
       ) AS clubs_joined
     FROM readscape_users u
     WHERE role = 'moderator'
     ORDER BY created_at DESC, id DESC`
  );

  res.json({
    moderators: rows
  });
});


app.get("/api/admin/activity", requireAdmin, async (req, res) => {
  const action =
    typeof req.query.action === "string"
      ? req.query.action.trim()
      : "all";

  const allowedActions = [
    "all",
    "user_role_changed",
    "user_suspended",
    "user_reactivated",
    "club_deleted",
    "report_reviewed",
    "report_dismissed"
  ];

  if (!allowedActions.includes(action)) {
    throw fail(400, "Invalid activity filter.");
  }

  const { rows } = await pool.query(
    `SELECT
       a.id,
       a.actor_id,
       u.username AS actor_username,
       a.action,
       a.target_type,
       a.target_id,
       a.details,
       a.created_at
     FROM readscape_admin_activity a
     LEFT JOIN readscape_users u
       ON u.id = a.actor_id
     WHERE ($1 = 'all' OR a.action = $1)
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT 100`,
    [action]
  );

  res.json({ activities: rows });
});




app.post("/api/reports", async (req, res) => {
  const {
    reportedUserId,
    clubId,
    reason,
    description = ""
  } = req.body || {};

  // A report must target either a user or a club.
  const hasUser = reportedUserId != null;
  const hasClub = clubId != null;

  if (hasUser === hasClub) {
    throw fail(
      400,
      "A report must target either a user or a club."
    );
  }

  const targetId = hasUser ? reportedUserId : clubId;

  if (
    !/^[1-9]\d*$/.test(String(targetId))
  ) {
    throw fail(400, "Invalid report target.");
  }

  if (
    typeof reason !== "string" ||
    !reason.trim() ||
    reason.trim().length > 100
  ) {
    throw fail(
      400,
      "Please provide a report reason (1–100 characters)."
    );
  }

  if (
    typeof description !== "string" ||
    description.length > 2000
  ) {
    throw fail(
      400,
      "Report description must be 2000 characters or fewer."
    );
  }

  // Prevent users from reporting themselves.
  if (
    hasUser &&
    String(reportedUserId) === String(req.user.id)
  ) {
    throw fail(400, "You cannot report yourself.");
  }

  // Verify that the reported account or club exists.
  const table = hasUser
    ? "readscape_users"
    : "readscape_clubs";

  const { rows: targets } = await pool.query(
    `SELECT id FROM ${table} WHERE id = $1`,
    [targetId]
  );

  if (!targets.length) {
    throw fail(404, "The reported user or club was not found.");
  }

  // Save the report in Neon PostgreSQL.
  const { rows } = await pool.query(
    `INSERT INTO readscape_reports
      (
        reporter_id,
        reported_user_id,
        club_id,
        reason,
        description
      )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, reason, status, created_at`,
    [
      req.user.id,
      hasUser ? targetId : null,
      hasClub ? targetId : null,
      reason.trim(),
      description.trim()
    ]
  );

  res.status(201).json({
    submitted: true,
    report: rows[0],
    message: "Your report has been submitted successfully."
  });
});


app.get("/api/moderation/reports", requireModerator, async (req, res) => {
  const status = req.query.status || "pending";

  if (!["pending", "reviewed", "dismissed", "all"].includes(status)) {
    throw fail(400, "Invalid report status.");
  }

  const { rows } = await pool.query(
    `SELECT
       r.id,
       r.reason,
       r.description,
       r.status,
       r.created_at,
       r.reviewed_at,
       reporter.username AS reporter_username,
       reported.username AS reported_username,
       c.name AS club_name,
       reviewer.username AS reviewed_by_username
     FROM readscape_reports r
     JOIN readscape_users reporter
       ON reporter.id = r.reporter_id
     LEFT JOIN readscape_users reported
       ON reported.id = r.reported_user_id
     LEFT JOIN readscape_clubs c
       ON c.id = r.club_id
     LEFT JOIN readscape_users reviewer
       ON reviewer.id = r.reviewed_by
     WHERE ($1 = 'all' OR r.status = $1)
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT 100`,
    [status]
  );

  res.json({ reports: rows });
});




app.patch(
  "/api/moderation/reports/:id",
  requireModerator,
  async (req, res) => {
    const reportId = req.params.id;
    const { status } = req.body || {};

    if (!/^[1-9]\d*$/.test(reportId)) {
      throw fail(400, "Invalid report ID.");
    }

    if (!["reviewed", "dismissed"].includes(status)) {
      throw fail(400, "Choose reviewed or dismissed.");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `UPDATE readscape_reports
         SET status = $1,
             reviewed_by = $2,
             reviewed_at = NOW()
         WHERE id = $3
           AND status = 'pending'
         RETURNING
           id,
           status,
           reviewed_by,
           reviewed_at`,
        [status, req.user.id, reportId]
      );

      if (!rows.length) {
        throw fail(
          404,
          "Pending report not found. It may already have been reviewed."
        );
      }

      await client.query(
        `INSERT INTO readscape_admin_activity
           (actor_id, action, target_type, target_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.id,
          status === "reviewed"
            ? "report_reviewed"
            : "report_dismissed",
          "report",
          String(reportId),
          JSON.stringify({
            previous_status: "pending",
            new_status: status
          })
        ]
      );

      await client.query("COMMIT");

      res.json({
        updated: true,
        report: rows[0],
        message:
          status === "reviewed"
            ? "Report marked as reviewed."
            : "Report dismissed successfully."
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
);




app.get("/api/admin/clubs", requireAdmin, async (req, res) => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

  if (search.length > 100) {
    throw fail(400, "Search must be 100 characters or fewer.");
  }

  const { rows } = await pool.query(
    `SELECT
       c.id,
       c.name,
       c.description,
       c.category,
       c.visibility,
       c.created_at,
       c.current_book,
       u.id AS owner_id,
       u.name AS owner_name,
       u.username AS owner_username,
       (
         SELECT COUNT(*)::int
         FROM readscape_club_members cm
         WHERE cm.club_id = c.id
       ) AS members
     FROM readscape_clubs c
     JOIN readscape_users u
       ON u.id = c.created_by
     WHERE
       $1 = ''
       OR c.name ILIKE '%' || $1 || '%'
       OR u.username ILIKE '%' || $1 || '%'
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT 50`,
    [search]
  );

  res.json({ clubs: rows });
});



app.delete("/api/admin/clubs/:id", requireAdmin, async (req, res) => {
  const clubId = req.params.id;

  if (!/^[1-9]\d*$/.test(clubId)) {
    throw fail(400, "Invalid club ID.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Delete the club and retrieve its details.
    const { rows } = await client.query(
      `DELETE FROM readscape_clubs
       WHERE id = $1
       RETURNING id, name, created_by`,
      [clubId]
    );

    if (!rows.length) {
      throw fail(404, "Club not found.");
    }

    const deletedClub = rows[0];

    // Save the activity log before committing the deletion.
    await client.query(
      `INSERT INTO readscape_admin_activity
         (actor_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "club_deleted",
        "club",
        String(deletedClub.id),
        JSON.stringify({
          club_name: deletedClub.name,
          created_by: deletedClub.created_by
        })
      ]
    );

    await client.query("COMMIT");

    res.json({
      deleted: true,
      club: {
        id: deletedClub.id,
        name: deletedClub.name
      },
      message: "Club deleted successfully."
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});



app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body || {};

  if (!/^[1-9]\d*$/.test(userId)) {
    throw fail(400, "Invalid user ID.");
  }

  if (!["user", "moderator", "admin"].includes(role)) {
  throw fail(400, "Invalid role.");
}

  if (String(userId) === String(req.user.id)) {
    throw fail(403, "You cannot change your own administrator role.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Serialize role changes to protect the last administrator.
    await client.query(
      "LOCK TABLE readscape_users IN SHARE ROW EXCLUSIVE MODE"
    );

    const { rows: users } = await client.query(
  `SELECT id, name, username, role, is_suspended
   FROM readscape_users
   WHERE id = $1`,
  [userId]
);

    if (!users.length) {
      throw fail(404, "User not found.");
    }

    if (
  users[0].is_suspended &&
  (role === "moderator" || role === "admin")
) {
  throw fail(
    403,
    "Reactivate this account before assigning an elevated role."
  );
}

    // Verify the acting user is still an administrator.
    const { rows: admins } = await client.query(
      `SELECT id FROM readscape_users
       WHERE id = $1 AND role = 'admin'`,
      [req.user.id]
    );

    if (!admins.length) {
      throw fail(403, "Administrator access required.");
    }

    // Never remove the last administrator.
    if (users[0].role === "admin" && role !== "admin") {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS total
         FROM readscape_users
         WHERE role = 'admin'`
      );

      if (rows[0].total <= 1) {
        throw fail(409, "Cannot remove the last administrator.");
      }
    }

   
const { rows: updated } = await client.query(
  `UPDATE readscape_users
   SET role = $1
   WHERE id = $2
   RETURNING id, name, username, role`,
  [role, userId]
);

// Record the role change in the activity log.
if (users[0].role !== role) {
  await client.query(
    `INSERT INTO readscape_admin_activity
      (actor_id, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      req.user.id,
      "user_role_changed",
      "user",
      String(userId),
      JSON.stringify({
        username: users[0].username,
        previous_role: users[0].role,
        new_role: role
      })
    ]
  );
}

await client.query("COMMIT");


    res.json({
      updated: true,
      user: updated[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});


app.patch(
  "/api/admin/users/:id/suspension",
  requireAdmin,
  async (req, res) => {
    const userId = req.params.id;
    const { suspended } = req.body || {};

    if (!/^[1-9]\d*$/.test(userId)) {
      throw fail(400, "Invalid user ID.");
    }

    if (typeof suspended !== "boolean") {
      throw fail(400, "Suspended must be true or false.");
    }

    if (String(userId) === String(req.user.id)) {
      throw fail(403, "You cannot suspend your own account.");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Lock the user row while updating suspension status.
      const { rows: users } = await client.query(
        `SELECT id, username, role, is_suspended
         FROM readscape_users
         WHERE id = $1
         FOR UPDATE`,
        [userId]
      );

      if (!users.length) {
        throw fail(404, "User not found.");
      }

      // Administrator accounts cannot be suspended here.
      if (users[0].role === "admin") {
        throw fail(
          403,
          "Administrator accounts cannot be suspended here."
        );
      }

      
const { rows: updated } = await client.query(
  `UPDATE readscape_users
   SET is_suspended = $1
   WHERE id = $2
   RETURNING id, username, role, is_suspended`,
  [suspended, userId]
);

// Record the action only if the status actually changed.
if (users[0].is_suspended !== suspended) {
  await client.query(
    `INSERT INTO readscape_admin_activity
      (actor_id, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      req.user.id,
      suspended
        ? "user_suspended"
        : "user_reactivated",
      "user",
      String(userId),
      JSON.stringify({
        username: users[0].username,
        previous_status: users[0].is_suspended
          ? "suspended"
          : "active",
        new_status: suspended
          ? "suspended"
          : "active"
      })
    ]
  );
}

await client.query("COMMIT");


      res.json({
        updated: true,
        user: updated[0],
        message: suspended
          ? "Account suspended successfully."
          : "Account reactivated successfully."
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
);



async function requireAdmin(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT role
       FROM readscape_users
       WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return next(fail(401, "User account not found."));
    }

    if (rows[0].role !== "admin") {
      return next(fail(
        403,
        "Administrator access required."
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
}


async function requireModerator(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT role, is_suspended
       FROM readscape_users
       WHERE id = $1`,
      [req.user.id]
    );

    if (!rows.length) {
      return next(fail(401, "User account not found."));
    }

    if (rows[0].is_suspended) {
      return next(fail(403, "Account suspended."));
    }

    if (!["moderator", "admin"].includes(rows[0].role)) {
      return next(
        fail(403, "Moderator access required.")
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}


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
  
  // Get the logged-in user's latest profile from PostgreSQL
  app.get('/api/auth/me', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, name, username, email, bio, location, created_at
       FROM readscape_users
       WHERE id = $1`,
      [req.user.id]
    );

    if (!rows.length) {
      throw fail(404, 'User not found.');
    }

    res.json({ user: rows[0] });
  });

  
  
  const library = async userId => {
    const { rows } = await pool.query(
      `SELECT
         b.*,
         ub.status,
         ub.current_page,
         ub.added_at,
         ub.finished_at,
         ub.custom_title,
         ub.custom_author,
         ub.custom_genre,
         ub.custom_pages,
         ub.custom_cover
       FROM readscape_user_books ub
       JOIN readscape_books b
         ON b.id = ub.book_id
       WHERE ub.user_id = $1
       ORDER BY ub.added_at DESC`,
      [userId]
    );

    return rows.map(b => {
      const pages = b.custom_pages ?? b.pages;
      const currentPage = b.current_page ?? 0;

      return {
        ...b,
        title: b.custom_title ?? b.title,
        author: b.custom_author ?? b.authors.join(', '),
        genre: b.custom_genre ?? b.categories.join(', '),
        pages,
        cover: b.custom_cover ?? b.cover,
        currentPage,
        progress: pages > 0
          ? Math.min(100, Math.round(currentPage / pages * 100))
          : 0,
        finishedAt: b.finished_at || null
      };
    });
  };

  app.get('/api/library', async (req, res) => res.json({ books: await library(req.user.id) }));
  app.get('/api/dashboard', async (req, res) => {
    const items = await library(req.user.id);
    res.json({ user: req.user, books: items, counts: { reading: items.filter(b => b.status === 'reading').length, finished: items.filter(b => b.status === 'finished').length, want: items.filter(b => b.status === 'want').length }, pagesRead: items.reduce((n,b) => n+b.currentPage,0) });
  });
  
  app.post('/api/library', async (req, res) => {
    const { googleBookId } = req.body || {};
    let book;

    if (googleBookId !== undefined) {
      if (
        typeof googleBookId !== 'string' ||
        !/^[\w-]{1,100}$/.test(googleBookId)
      ) {
        throw fail(400, 'Select a valid Google Books result.');
      }

      book = normalizeBook(
        await books(`volumes/${encodeURIComponent(googleBookId)}`)
      );
    } else {
      const { title, author, genre, pages, cover } = req.body || {};

      const totalPages = Number(pages);

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        title.trim().length > 300 ||
        typeof author !== 'string' ||
        !author.trim() ||
        author.trim().length > 300 ||
        !Number.isSafeInteger(totalPages) ||
        totalPages <= 0 ||
        typeof genre !== 'string' ||
        genre.length > 200 ||
        (cover != null &&
          (typeof cover !== 'string' || cover.length > 2000))
      ) {
        throw fail(400, 'Enter valid book details.');
      }

      book = {
        id: `manual-${randomBytes(16).toString('hex')}`,
        title: title.trim(),
        authors: [author.trim()],
        description: '',
        categories: [genre.trim() || 'Other'],
        pages: totalPages,
        cover: cover || '',
      };
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO readscape_books
         (id, title, authors, description, categories, pages, cover)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          book.id,
          book.title,
          JSON.stringify(book.authors),
          book.description,
          JSON.stringify(book.categories),
          book.pages,
          book.cover,
        ]
      );

      await client.query(
        `INSERT INTO readscape_user_books (user_id, book_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [req.user.id, book.id]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

res.status(201).json({
  book: {
    ...book,
    author: book.authors.join(", "),
    genre: book.categories.join(", "),
    currentPage: 0,
    progress: 0,
    status: "want"
  }
});  });


  // Update reading progress and completion date
  app.patch('/api/library/:id', async (req, res) => {
    const { status, currentPage } = req.body || {};

    if (
      !["want", "reading", "finished"].includes(status) ||
      !Number.isInteger(currentPage) ||
      currentPage < 0
    ) {
      throw fail(400, "Enter a valid status and page number.");
    }

    const { rows } = await pool.query(
      `UPDATE readscape_user_books ub
       SET
         status = $1,
         current_page = $2,
         finished_at = CASE
           WHEN $1 = 'finished'
             AND (ub.status <> 'finished' OR ub.finished_at IS NULL)
             THEN NOW()
           WHEN $1 = 'finished'
             THEN ub.finished_at
           ELSE NULL
         END
       FROM readscape_books b
       WHERE ub.book_id = b.id
         AND ub.user_id = $3
         AND ub.book_id = $4
         AND (
           COALESCE(ub.custom_pages, b.pages) = 0
           OR $2 <= COALESCE(ub.custom_pages, b.pages)
         )
       RETURNING ub.book_id, ub.finished_at`,
      [status, currentPage, req.user.id, req.params.id]
    );

    if (!rows.length) {
      throw fail(
        400,
        "Book not found or page exceeds the book length."
      );
    }

    res.json({
      updated: true,
      finishedAt: rows[0].finished_at
    });
  });

app.patch('/api/auth/profile', async (req, res) => {
  const { name, username, bio, location } = req.body || {};

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100 ||
    typeof username !== 'string' ||
    !/^[a-zA-Z0-9_.-]{3,40}$/.test(username) ||
    typeof bio !== 'string' ||
    bio.length > 500 ||
    typeof location !== 'string' ||
    location.length > 100
  ) {
    throw fail(400, 'Enter valid profile information.');
  }

  try {
    const { rows } = await pool.query(
      `UPDATE readscape_users
       SET name = $1,
           username = $2,
           bio = $3,
           location = $4
       WHERE id = $5
       RETURNING id, name, username, email, bio, location`,
      [
        name.trim(),
        username.trim(),
        bio.trim(),
        location.trim(),
        req.user.id
      ]
    );

    if (!rows.length) {
      throw fail(404, 'User not found.');
    }

    const session = sessions.get(req.token);

    if (session) {
      session.user = publicUser(rows[0]);
    }

    res.json({ user: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      throw fail(409, 'This username is already taken.');
    }
    throw error;
  }
});


  // DELETE a book from the logged-in user's library
  app.delete('/api/library/:id', async (req, res) => {
    const { rows } = await pool.query(
      `DELETE FROM readscape_user_books
       WHERE user_id = $1 AND book_id = $2
       RETURNING book_id`,
      [req.user.id, req.params.id]
    );

    if (!rows.length) {
      throw fail(404, 'Book not found in your library.');
    }

    res.status(204).send();
  });


  // Edit book details for the logged-in user only
  app.patch('/api/library/:id/details', async (req, res) => {
    const { title, author, genre, pages, cover } = req.body || {};

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 300 ||
      typeof author !== 'string' ||
      !author.trim() ||
      author.trim().length > 300 ||
      typeof genre !== 'string' ||
      genre.length > 200 ||
      !Number.isSafeInteger(pages) ||
      pages <= 0 ||
      typeof cover !== 'string' ||
      cover.length > 2000
    ) {
      throw fail(400, 'Enter valid book details.');
    }

    const { rows } = await pool.query(
      `UPDATE readscape_user_books ub
       SET custom_title = $1,
           custom_author = $2,
           custom_genre = $3,
           custom_pages = $4,
           custom_cover = $5
       WHERE ub.user_id = $6
         AND ub.book_id = $7
         AND ub.current_page <= $4
       RETURNING ub.book_id`,
      [
        title.trim(),
        author.trim(),
        genre.trim() || 'Other',
        pages,
        cover.trim(),
        req.user.id,
        req.params.id
      ]
    );

    if (!rows.length) {
      throw fail(
        400,
        'Book not found, or total pages are less than your current reading page.'
      );
    }

    res.json({ updated: true });
  });


  // Load goals belonging to the logged-in user
  app.get('/api/goals', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, title, target, unit,
              current_progress AS current,
              is_main AS main
       FROM readscape_goals
       WHERE user_id = $1
       ORDER BY created_at ASC, id ASC`,
      [req.user.id]
    );

    res.json({ goals: rows });
  });

  // Save the logged-in user's complete goals list
  app.put('/api/goals', async (req, res) => {
    const goals = req.body?.goals;

    if (!Array.isArray(goals) || goals.length > 100) {
      throw fail(400, 'Provide a valid goals list (maximum 100).');
    }

    const validUnits = ['books', 'pages', 'days', 'minutes'];
    const ids = new Set();

    for (const goal of goals) {
      if (
        !goal ||
        typeof goal.id !== 'string' ||
        goal.id.length < 1 ||
        goal.id.length > 100 ||
        ids.has(goal.id) ||
        typeof goal.title !== 'string' ||
        !goal.title.trim() ||
        goal.title.trim().length > 200 ||
        !Number.isSafeInteger(goal.target) ||
        goal.target <= 0 ||
        !validUnits.includes(goal.unit) ||
        !Number.isSafeInteger(goal.current) ||
        goal.current < 0 ||
        typeof goal.main !== 'boolean'
      ) {
        throw fail(400, 'One or more goals contain invalid information.');
      }

      ids.add(goal.id);
    }

    if (goals.filter(goal => goal.main).length > 1) {
      throw fail(400, 'Only one goal can be the main goal.');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Prevent overlapping saves from this user's sessions.
      await client.query(
        'SELECT id FROM readscape_users WHERE id = $1 FOR UPDATE',
        [req.user.id]
      );

      await client.query(
        'DELETE FROM readscape_goals WHERE user_id = $1',
        [req.user.id]
      );

      for (const goal of goals) {
        await client.query(
          `INSERT INTO readscape_goals
             (id, user_id, title, target, unit, current_progress, is_main)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            goal.id,
            req.user.id,
            goal.title.trim(),
            goal.target,
            goal.unit,
            goal.current,
            goal.main
          ]
        );
      }

      await client.query('COMMIT');
      res.json({ goals });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });


  // FRIENDS: Search registered Readscape users
  app.get('/api/friends/search', async (req, res) => {
    const q =
      typeof req.query.q === 'string'
        ? req.query.q.trim()
        : '';

    if (q.length < 2 || q.length > 100) {
      throw fail(
        400,
        'Search must contain between 2 and 100 characters.'
      );
    }

    const { rows } = await pool.query(
      `SELECT id, name, username
       FROM readscape_users
       WHERE id <> $1
         AND (
           name ILIKE '%' || $2 || '%'
           OR username ILIKE '%' || $2 || '%'
         )
       ORDER BY username ASC
       LIMIT 20`,
      [req.user.id, q]
    );

    res.json({ users: rows });
  });


  // FRIENDS: Send a friend request
  app.post('/api/friends/requests', async (req, res) => {
    const recipientId = Number(req.body?.recipientId);

    if (
      !Number.isSafeInteger(recipientId) ||
      recipientId <= 0
    ) {
      throw fail(400, 'Select a valid user.');
    }

    if (recipientId === Number(req.user.id)) {
      throw fail(400, 'You cannot send a friend request to yourself.');
    }

    const { rows: users } = await pool.query(
      'SELECT id FROM readscape_users WHERE id = $1',
      [recipientId]
    );

    if (!users.length) {
      throw fail(404, 'User not found.');
    }

    const { rows } = await pool.query(
      `INSERT INTO readscape_friendships
         (requester_id, recipient_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT DO NOTHING
       RETURNING id, requester_id, recipient_id, status`,
      [req.user.id, recipientId]
    );

    if (!rows.length) {
      throw fail(
        409,
        'A friend request or friendship already exists between these users.'
      );
    }

    res.status(201).json({ request: rows[0] });
  });


  // FRIENDS: Accept or decline a friend request
  app.patch('/api/friends/requests/:id', async (req, res) => {
    const requestId = req.params.id;
    const { action } = req.body || {};

    if (!/^[1-9]\d*$/.test(requestId)) {
      throw fail(400, 'Invalid friend request ID.');
    }

    if (!['accept', 'decline'].includes(action)) {
      throw fail(400, 'Choose accept or decline.');
    }

    if (action === 'accept') {
      const { rows } = await pool.query(
        `UPDATE readscape_friendships
         SET status = 'accepted',
             accepted_at = NOW()
         WHERE id = $1
           AND recipient_id = $2
           AND status = 'pending'
         RETURNING id, requester_id, recipient_id, status`,
        [requestId, req.user.id]
      );

      if (!rows.length) {
        throw fail(404, 'Pending friend request not found.');
      }

      return res.json({ request: rows[0] });
    }

    const { rows } = await pool.query(
      `DELETE FROM readscape_friendships
       WHERE id = $1
         AND recipient_id = $2
         AND status = 'pending'
       RETURNING id`,
      [requestId, req.user.id]
    );

    if (!rows.length) {
      throw fail(404, 'Pending friend request not found.');
    }

    res.json({ declined: true });
  });

  

  // FRIENDS: Get incoming pending requests
  app.get('/api/friends/requests', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         f.id,
         u.id AS user_id,
         u.name,
         u.username,
         f.created_at
       FROM readscape_friendships f
       JOIN readscape_users u
         ON u.id = f.requester_id
       WHERE f.recipient_id = $1
         AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: rows });
  });

  
  // FRIENDS: Get accepted friends with reading activity
  app.get('/api/friends', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.username,
         f.accepted_at,

         (
           SELECT COALESCE(ub.custom_title, b.title)
           FROM readscape_user_books ub
           JOIN readscape_books b
             ON b.id = ub.book_id
           WHERE ub.user_id = u.id
             AND ub.status = 'reading'
           ORDER BY ub.added_at DESC
           LIMIT 1
         ) AS current_book,

         (
           SELECT COUNT(*)::int
           FROM readscape_user_books ub
           WHERE ub.user_id = u.id
             AND ub.status = 'finished'
             AND ub.finished_at >= DATE_TRUNC(
               'year', CURRENT_DATE
             )
             AND ub.finished_at < DATE_TRUNC(
               'year', CURRENT_DATE
             ) + INTERVAL '1 year'
         ) AS books_finished_this_year

       FROM readscape_friendships f
       JOIN readscape_users u
         ON u.id = CASE
           WHEN f.requester_id = $1
             THEN f.recipient_id
           ELSE f.requester_id
         END
       WHERE (
         f.requester_id = $1
         OR f.recipient_id = $1
       )
         AND f.status = 'accepted'
       ORDER BY u.name ASC`,
      [req.user.id]
    );

    res.json({ friends: rows });
  });



  
  // FRIENDS: Remove an accepted friend
  app.delete('/api/friends/:id', async (req, res) => {
    const friendId = req.params.id;

    if (!/^[1-9]\d*$/.test(friendId)) {
      throw fail(400, 'Invalid friend ID.');
    }

    const { rows } = await pool.query(
      `DELETE FROM readscape_friendships
       WHERE status = 'accepted'
         AND (
           (requester_id = $1 AND recipient_id = $2)
           OR
           (recipient_id = $1 AND requester_id = $2)
         )
       RETURNING id`,
      [req.user.id, friendId]
    );

    if (!rows.length) {
      throw fail(404, 'Friendship not found.');
    }

    res.json({ removed: true });
  });

  // FRIENDS: Get outgoing pending requests
  app.get('/api/friends/requests/sent', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         f.id,
         f.recipient_id AS user_id,
         u.name,
         u.username,
         f.created_at
       FROM readscape_friendships f
       JOIN readscape_users u
         ON u.id = f.recipient_id
       WHERE f.requester_id = $1
         AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: rows });
  });

  // FRIENDS: Cancel an outgoing pending request
  app.delete('/api/friends/requests/sent/:id', async (req, res) => {
    const requestId = req.params.id;

    if (!/^[1-9]\d*$/.test(requestId)) {
      throw fail(400, 'Invalid friend request ID.');
    }

    const { rows } = await pool.query(
      `DELETE FROM readscape_friendships
       WHERE id = $1
         AND requester_id = $2
         AND status = 'pending'
       RETURNING id`,
      [requestId, req.user.id]
    );

    if (!rows.length) {
      throw fail(404, 'Pending friend request not found.');
    }

    res.json({ cancelled: true });
  });



  // FRIENDS: View an accepted friend's reading profile
  app.get('/api/friends/:id/profile', async (req, res) => {
    const friendId = req.params.id;

    if (!/^[1-9]\d*$/.test(friendId)) {
      throw fail(400, 'Invalid friend ID.');
    }

    // Only accepted friends can view this profile.
    const { rows: users } = await pool.query(
      `SELECT u.id, u.name, u.username, u.bio, u.location
       FROM readscape_users u
       WHERE u.id = $2
         AND EXISTS (
           SELECT 1
           FROM readscape_friendships f
           WHERE f.status = 'accepted'
             AND (
               (f.requester_id = $1 AND f.recipient_id = u.id)
               OR
               (f.recipient_id = $1 AND f.requester_id = u.id)
             )
         )`,
      [req.user.id, friendId]
    );

    if (!users.length) {
      throw fail(404, 'Friend profile not found.');
    }

    const { rows: books } = await pool.query(
      `SELECT
         b.id,
         COALESCE(ub.custom_title, b.title) AS title,
         COALESCE(
           ub.custom_author,
           b.authors->>0,
           'Unknown author'
         ) AS author,
         COALESCE(ub.custom_cover, b.cover) AS cover,
         ub.status,
         ub.current_page,
         COALESCE(ub.custom_pages, b.pages) AS pages,
         ub.finished_at
       FROM readscape_user_books ub
       JOIN readscape_books b ON b.id = ub.book_id
       WHERE ub.user_id = $1
         AND ub.status IN ('reading', 'finished')
       ORDER BY
         CASE WHEN ub.status = 'reading' THEN 0 ELSE 1 END,
         ub.finished_at DESC NULLS LAST,
         ub.added_at DESC`,
      [friendId]
    );

    const reading = books.filter(
      book => book.status === 'reading'
    );

    const finished = books.filter(
      book => book.status === 'finished'
    );

    const currentYear = new Date().getUTCFullYear();

    const finishedThisYear = finished.filter(book =>
      book.finished_at &&
      new Date(book.finished_at).getUTCFullYear() === currentYear
    ).length;

    res.json({
      user: users[0],
      reading,
      finished,
      stats: {
        currentlyReading: reading.length,
        totalFinished: finished.length,
        finishedThisYear
      }
    });
  });


  // CLUBS: Get all clubs with membership information
  app.get('/api/clubs', async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.description,
         c.category,
         c.visibility,
         c.current_book,
         c.next_meeting,
         c.created_by,
         c.created_at,

         (
           SELECT COUNT(*)::int
           FROM readscape_club_members cm
           WHERE cm.club_id = c.id
         ) AS members,

         EXISTS (
           SELECT 1
           FROM readscape_club_members cm
           WHERE cm.club_id = c.id
             AND cm.user_id = $1
         ) AS joined,

         
         (
           SELECT cm.role
           FROM readscape_club_members cm
           WHERE cm.club_id = c.id
             AND cm.user_id = $1
         ) AS my_role,

         EXISTS (
           SELECT 1
           FROM readscape_club_join_requests r
           WHERE r.club_id = c.id
             AND r.user_id = $1
             AND r.status = 'pending'
         ) AS request_pending


       FROM readscape_clubs c
       ORDER BY c.created_at DESC, c.id DESC`,
      [req.user.id]
    );

    res.json({ clubs: rows });
  });


  // CLUBS: Create a new reading club
  app.post('/api/clubs', async (req, res) => {
    const {
      name,
      description = "",
      category = "General",
      currentBook = "",
      nextMeeting = null,
      visibility = "public"
    } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof description !== "string" ||
      description.length > 2000 ||
      typeof category !== "string" ||
      !category.trim() ||
      category.trim().length > 60 ||
      typeof currentBook !== "string" ||
      currentBook.length > 300 ||
      !["public", "private"].includes(visibility)
    ) {
      throw fail(400, "Enter valid club information.");
    }

    let meetingDate = null;

    if (nextMeeting !== null && nextMeeting !== "") {
      if (
        typeof nextMeeting !== "string" ||
        !Number.isFinite(Date.parse(nextMeeting))
      ) {
        throw fail(400, "Enter a valid meeting date.");
      }

      meetingDate = new Date(nextMeeting).toISOString();
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows: clubs } = await client.query(
  `INSERT INTO readscape_clubs
     (name, description, category,
      current_book, next_meeting, created_by, visibility)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING
     id, name, description, category,
     current_book, next_meeting,
     created_by, created_at, visibility`,
  [
    name.trim(),
    description.trim(),
    category.trim(),
    currentBook.trim() || null,
    meetingDate,
    req.user.id,
    visibility
  ]
);

      const club = clubs[0];

      await client.query(
        `INSERT INTO readscape_club_members
           (club_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [club.id, req.user.id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        club: {
          ...club,
          members: 1,
          joined: true,
          my_role: "owner"
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });


  
  // CLUBS: Join a public club or request to join a private club
  app.post('/api/clubs/:id/join', async (req, res) => {
    const clubId = req.params.id;

    if (!/^[1-9]\d*$/.test(clubId)) {
      throw fail(400, "Invalid club ID.");
    }

    const { rows: clubs } = await pool.query(
      `SELECT id, visibility
       FROM readscape_clubs
       WHERE id = $1`,
      [clubId]
    );

    if (!clubs.length) {
      throw fail(404, "Club not found.");
    }

    const { rows: memberships } = await pool.query(
      `SELECT role
       FROM readscape_club_members
       WHERE club_id = $1
         AND user_id = $2`,
      [clubId, req.user.id]
    );

    if (memberships.length) {
      throw fail(409, "You are already a member of this club.");
    }

    // PRIVATE CLUB: Save a pending membership request
    if (clubs[0].visibility === "private") {
      const { rows } = await pool.query(
        `INSERT INTO readscape_club_join_requests
           (club_id, user_id, status)
         VALUES ($1, $2, 'pending')
         
ON CONFLICT (club_id, user_id)
DO UPDATE SET
  status = 'pending',
  requested_at = NOW(),
  reviewed_at = NULL
WHERE readscape_club_join_requests.status IN ('declined', 'approved')

         RETURNING id, club_id, user_id, status`,
        [clubId, req.user.id]
      );

      if (!rows.length) {
        throw fail(409, "Your request is already pending.");
      }

      return res.status(202).json({
        requested: true,
        request: rows[0]
      });
    }

    // PUBLIC CLUB: Join immediately
    const { rows } = await pool.query(
      `INSERT INTO readscape_club_members
         (club_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (club_id, user_id)
       DO NOTHING
       RETURNING club_id, user_id, role`,
      [clubId, req.user.id]
    );

    if (!rows.length) {
      throw fail(409, "You are already a member of this club.");
    }

    res.status(201).json({
      membership: rows[0],
      joined: true
    });
  });


  // CLUBS: Leave a club
  app.delete('/api/clubs/:id/leave', async (req, res) => {
    const clubId = req.params.id;

    if (!/^[1-9]\d*$/.test(clubId)) {
      throw fail(400, 'Invalid club ID.');
    }

    // Remove only the logged-in user's membership.
    // Owners cannot leave until ownership is handled.
    const { rows } = await pool.query(
      `DELETE FROM readscape_club_members
       WHERE club_id = $1
         AND user_id = $2
         AND role = 'member'
       RETURNING club_id, user_id`,
      [clubId, req.user.id]
    );

    if (!rows.length) {
      const { rows: membership } = await pool.query(
        `SELECT role
         FROM readscape_club_members
         WHERE club_id = $1
           AND user_id = $2`,
        [clubId, req.user.id]
      );

      if (membership[0]?.role === 'owner') {
        throw fail(
          403,
          'Club owners cannot leave. Transfer ownership or delete the club first.'
        );
      }

      throw fail(404, 'You are not a member of this club.');
    }

    res.json({ left: true });
  });


  // CLUBS: Owner views pending membership requests
  app.get('/api/clubs/:id/requests', async (req, res) => {
    const clubId = req.params.id;

    if (!/^[1-9]\d*$/.test(clubId)) {
      throw fail(400, "Invalid club ID.");
    }

    const { rows: owners } = await pool.query(
      `SELECT 1
       FROM readscape_club_members
       WHERE club_id = $1
         AND user_id = $2
         AND role = 'owner'`,
      [clubId, req.user.id]
    );

    if (!owners.length) {
      throw fail(403, "Only the club owner can view requests.");
    }

    const { rows } = await pool.query(
      `SELECT
         r.id,
         r.club_id,
         r.user_id,
         u.name,
         u.username,
         r.requested_at
       FROM readscape_club_join_requests r
       JOIN readscape_users u ON u.id = r.user_id
       WHERE r.club_id = $1
         AND r.status = 'pending'
       ORDER BY r.requested_at ASC`,
      [clubId]
    );

    res.json({ requests: rows });
  });

  // CLUBS: Owner approves or declines a membership request
  app.patch('/api/clubs/:id/requests/:requestId', async (req, res) => {
    const { id: clubId, requestId } = req.params;
    const { action } = req.body || {};

    if (
      !/^[1-9]\d*$/.test(clubId) ||
      !/^[1-9]\d*$/.test(requestId)
    ) {
      throw fail(400, "Invalid club or request ID.");
    }

    if (!["approve", "decline"].includes(action)) {
      throw fail(400, "Choose approve or decline.");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows: owners } = await client.query(
        `SELECT 1
         FROM readscape_club_members
         WHERE club_id = $1
           AND user_id = $2
           AND role = 'owner'`,
        [clubId, req.user.id]
      );

      if (!owners.length) {
        throw fail(403, "Only the club owner can review requests.");
      }

      const { rows: requests } = await client.query(
        `SELECT id, user_id
         FROM readscape_club_join_requests
         WHERE id = $1
           AND club_id = $2
           AND status = 'pending'
         FOR UPDATE`,
        [requestId, clubId]
      );

      if (!requests.length) {
        throw fail(404, "Pending membership request not found.");
      }

      const request = requests[0];

      if (action === "approve") {
        await client.query(
          `INSERT INTO readscape_club_members
             (club_id, user_id, role)
           VALUES ($1, $2, 'member')
           ON CONFLICT (club_id, user_id) DO NOTHING`,
          [clubId, request.user_id]
        );
      }

      const newStatus =
        action === "approve" ? "approved" : "declined";

      await client.query(
        `UPDATE readscape_club_join_requests
         SET status = $1,
             reviewed_at = NOW()
         WHERE id = $2`,
        [newStatus, requestId]
      );

      await client.query("COMMIT");

      res.json({
        reviewed: true,
        status: newStatus
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });



  // CLUBS: Get club details and authorized member information
  app.get('/api/clubs/:id', async (req, res) => {
    const clubId = req.params.id;

    if (!/^[1-9]\d*$/.test(clubId)) {
      throw fail(400, "Invalid club ID.");
    }

    const { rows: clubs } = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.description,
         c.category,
         c.current_book,
         c.next_meeting,
         c.visibility,
         c.created_by,
         c.created_at,
         u.name AS owner_name,
         u.username AS owner_username,

         (
           SELECT COUNT(*)::int
           FROM readscape_club_members cm
           WHERE cm.club_id = c.id
         ) AS members,

         (
           SELECT cm.role
           FROM readscape_club_members cm
           WHERE cm.club_id = c.id
             AND cm.user_id = $2
         ) AS my_role,

         EXISTS (
           SELECT 1
           FROM readscape_club_join_requests r
           WHERE r.club_id = c.id
             AND r.user_id = $2
             AND r.status = 'pending'
         ) AS request_pending

       FROM readscape_clubs c
       JOIN readscape_users u
         ON u.id = c.created_by
       WHERE c.id = $1`,
      [clubId, req.user.id]
    );

    if (!clubs.length) {
      throw fail(404, "Club not found.");
    }

    const club = clubs[0];

    // Private club membership details are for members only.
    if (club.visibility === "private" && !club.my_role) {
      return res.json({
        club,
        members: [],
        members_visible: false
      });
    }

    const { rows: members } = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.username,
         cm.role,
         cm.joined_at
       FROM readscape_club_members cm
       JOIN readscape_users u
         ON u.id = cm.user_id
       WHERE cm.club_id = $1
       ORDER BY
         CASE WHEN cm.role = 'owner' THEN 0 ELSE 1 END,
         cm.joined_at ASC`,
      [clubId]
    );

    res.json({
      club,
      members,
      members_visible: true
    });
  });


app.patch('/api/clubs/:id', async (req, res) => {
  const clubId = req.params.id;

  if (!/^[1-9]\d*$/.test(clubId)) {
    throw fail(400, "Invalid club ID.");
  }

  const {
    name,
    description,
    category,
    currentBook,
    nextMeeting,
    visibility
  } = req.body || {};

  // Only the club owner can edit the club.
  const { rows: ownership } = await pool.query(
    `SELECT id
     FROM readscape_clubs
     WHERE id = $1 AND created_by = $2`,
    [clubId, req.user.id]
  );

  if (ownership.length === 0) {
    throw fail(403, "Only the club owner can edit this club.");
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    typeof description !== "string" ||
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 60 ||
    typeof currentBook !== "string" ||
    !["public", "private"].includes(visibility) ||
    (
      nextMeeting !== null &&
      nextMeeting !== "" &&
      (
        typeof nextMeeting !== "string" ||
        !Number.isFinite(Date.parse(nextMeeting))
      )
    )
  ) {
    throw fail(400, "Invalid club details.");
  }

  const meetingDate = nextMeeting
    ? new Date(nextMeeting).toISOString()
    : null;

  const { rows } = await pool.query(
    `UPDATE readscape_clubs
     SET
       name = $1,
       description = $2,
       category = $3,
       current_book = $4,
       next_meeting = $5,
       visibility = $6
     WHERE id = $7 AND created_by = $8
     RETURNING *`,
    [
      name.trim(),
      description.trim(),
      category.trim(),
      currentBook.trim() || null,
      meetingDate,
      visibility,
      clubId,
      req.user.id
    ]
  );

  if (rows.length === 0) {
    throw fail(403, "Only the club owner can edit this club.");
  }

  res.json({ club: rows[0] });
});



app.delete('/api/clubs/:id', async (req, res) => {
  const clubId = req.params.id;

  if (!/^[1-9]\d*$/.test(clubId)) {
    throw fail(400, "Invalid club ID.");
  }

  // Delete only if the logged-in user owns the club.
  const { rows } = await pool.query(
    `DELETE FROM readscape_clubs
     WHERE id = $1
       AND created_by = $2
     RETURNING id, name`,
    [clubId, req.user.id]
  );

  if (rows.length === 0) {
    throw fail(404, "Club not found or you are not its owner.");
  }

  res.json({
    deleted: true,
    club: rows[0],
    message: "Club deleted successfully."
  });
});


  app.use((_req, _res, next) =>
    next(fail(404, 'Endpoint not found.'))
  ); 

  app.use((error, _req, res, _next) =>
    res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : 'Database request failed. Please try again.'
    })
  );


  return app;
}

module.exports = { createApp };


