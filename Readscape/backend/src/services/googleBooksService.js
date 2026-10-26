// src/services/googleBooksService.js
//
// Thin wrapper around the Google Books API. An API key is optional for
// read-only volume searches (Google allows a small number of unauthenticated
// requests per day) but strongly recommended -- set GOOGLE_BOOKS_API_KEY in
// backend/.env to raise your quota.

const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

function buildUrl(params) {
  const url = new URL(GOOGLE_BOOKS_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }
  return url.toString();
}

// Maps one Google Books "volume" object into the flat shape our `books`
// table (and frontend) expects.
function normalizeVolume(volume) {
  const info = volume.volumeInfo || {};
  const industryIds = info.industryIdentifiers || [];
  const isbn13 = industryIds.find((i) => i.type === "ISBN_13")?.identifier ?? null;
  const isbn10 = industryIds.find((i) => i.type === "ISBN_10")?.identifier ?? null;

  return {
    googleId: volume.id,
    title: info.title || "Untitled",
    subtitle: info.subtitle || null,
    authors: info.authors || [],
    description: info.description || null,
    thumbnail:
      info.imageLinks?.thumbnail?.replace("http://", "https://") ||
      info.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
      null,
    publishedDate: info.publishedDate || null,
    publisher: info.publisher || null,
    pageCount: info.pageCount ?? null,
    categories: info.categories || [],
    averageRating: info.averageRating ?? null,
    ratingsCount: info.ratingsCount ?? null,
    isbn10,
    isbn13,
    language: info.language || null,
    previewLink: info.previewLink || null,
    raw: volume,
  };
}

async function searchVolumes(query, { maxResults = 20 } = {}) {
  const url = buildUrl({ q: query, maxResults });
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Books search failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const items = data.items || [];
  return items.map(normalizeVolume);
}

async function getVolumeById(googleId) {
  const url = new URL(`${GOOGLE_BOOKS_BASE}/${encodeURIComponent(googleId)}`);
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }
  const res = await fetch(url.toString());

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Books lookup failed (${res.status}): ${body}`);
  }

  const volume = await res.json();
  return normalizeVolume(volume);
}

module.exports = { searchVolumes, getVolumeById, normalizeVolume };
