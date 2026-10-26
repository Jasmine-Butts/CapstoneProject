function normalizeBook(volume) {
  const info = volume.volumeInfo || {};
  return { id: volume.id, title: info.title || 'Untitled', authors: info.authors || [],
    description: info.description || '', categories: info.categories || [],
    pages: Number.isInteger(info.pageCount) && info.pageCount > 0 ? info.pageCount : 0,
    cover: (info.imageLinks?.thumbnail || '').replace(/^http:/, 'https:') };
}
async function googleBooks(path, query = {}, fetcher = fetch) {
  const url = new URL(`https://www.googleapis.com/books/v1/${path}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  if (process.env.GOOGLE_BOOKS_API_KEY) url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY);
  try {
    const response = await fetcher(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Google Books request failed');
    return await response.json();
  } catch { const error = new Error('Google Books is unavailable. Please try again.'); error.status = 502; throw error; }
}
module.exports = { normalizeBook, googleBooks };
