// src/db/booksRepo.js
//
// All reads/writes to the `books` and `book_searches` cache tables live
// here, so routes/books.js stays focused on HTTP concerns.

const { query } = require("./pool");

const SEARCH_CACHE_TTL_HOURS = Number(process.env.SEARCH_CACHE_TTL_HOURS || 24);

function rowToBook(row) {
  if (!row) return null;
  return {
    id: row.id,
    googleId: row.google_id,
    title: row.title,
    subtitle: row.subtitle,
    authors: row.authors || [],
    description: row.description,
    thumbnail: row.thumbnail,
    publishedDate: row.published_date,
    publisher: row.publisher,
    pageCount: row.page_count,
    categories: row.categories || [],
    averageRating: row.average_rating !== null ? Number(row.average_rating) : null,
    ratingsCount: row.ratings_count,
    isbn10: row.isbn_10,
    isbn13: row.isbn_13,
    language: row.language,
    previewLink: row.preview_link,
    cachedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Insert a normalized Google Books volume, or refresh it if we already
// have that google_id cached. Returns the stored row.
async function upsertBook(book) {
  const result = await query(
    `INSERT INTO books (
       google_id, title, subtitle, authors, description, thumbnail,
       published_date, publisher, page_count, categories,
       average_rating, ratings_count, isbn_10, isbn_13, language,
       preview_link, raw_data
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
     )
     ON CONFLICT (google_id) DO UPDATE SET
       title = EXCLUDED.title,
       subtitle = EXCLUDED.subtitle,
       authors = EXCLUDED.authors,
       description = EXCLUDED.description,
       thumbnail = EXCLUDED.thumbnail,
       published_date = EXCLUDED.published_date,
       publisher = EXCLUDED.publisher,
       page_count = EXCLUDED.page_count,
       categories = EXCLUDED.categories,
       average_rating = EXCLUDED.average_rating,
       ratings_count = EXCLUDED.ratings_count,
       isbn_10 = EXCLUDED.isbn_10,
       isbn_13 = EXCLUDED.isbn_13,
       language = EXCLUDED.language,
       preview_link = EXCLUDED.preview_link,
       raw_data = EXCLUDED.raw_data
     RETURNING *`,
    [
      book.googleId,
      book.title,
      book.subtitle,
      book.authors,
      book.description,
      book.thumbnail,
      book.publishedDate,
      book.publisher,
      book.pageCount,
      book.categories,
      book.averageRating,
      book.ratingsCount,
      book.isbn10,
      book.isbn13,
      book.language,
      book.previewLink,
      book.raw,
    ]
  );
  return rowToBook(result.rows[0]);
}

async function upsertManyBooks(books) {
  const results = [];
  for (const book of books) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await upsertBook(book));
  }
  return results;
}

async function getBookByGoogleId(googleId) {
  const result = await query(`SELECT * FROM books WHERE google_id = $1`, [googleId]);
  return rowToBook(result.rows[0]);
}

async function getBooksByGoogleIds(googleIds) {
  if (!googleIds.length) return [];
  const result = await query(`SELECT * FROM books WHERE google_id = ANY($1::text[])`, [googleIds]);
  const byId = new Map(result.rows.map((row) => [row.google_id, rowToBook(row)]));
  // Preserve the original (relevance-ranked) order.
  return googleIds.map((id) => byId.get(id)).filter(Boolean);
}

// Looks up a cached search. Returns null if there's no cache entry, or the
// entry is older than SEARCH_CACHE_TTL_HOURS.
async function getFreshSearch(normalizedQuery) {
  const result = await query(
    `SELECT * FROM book_searches
     WHERE query = $1
       AND searched_at > now() - ($2 || ' hours')::interval`,
    [normalizedQuery, SEARCH_CACHE_TTL_HOURS]
  );
  return result.rows[0] || null;
}

async function saveSearch(normalizedQuery, googleIds) {
  await query(
    `INSERT INTO book_searches (query, google_ids, searched_at)
     VALUES ($1, $2, now())
     ON CONFLICT (query) DO UPDATE SET
       google_ids = EXCLUDED.google_ids,
       searched_at = now()`,
    [normalizedQuery, googleIds]
  );
}

module.exports = {
  upsertBook,
  upsertManyBooks,
  getBookByGoogleId,
  getBooksByGoogleIds,
  getFreshSearch,
  saveSearch,
};
