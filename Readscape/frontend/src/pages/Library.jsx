import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getLibraryCounts,
  filterLibraryBooks,
} from "../data/libraryData";

import { api } from "../services/api";
function Library() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  useEffect(() => { let active = true; api('/library').then(d => { if(active)setLibraryBooks(d.books); }).catch(e => {if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);}); return ()=>{active=false;}; }, []);
  async function update(book, status, currentPage) {
    setSaving(book.id); setError('');
    try { await api(`/library/${encodeURIComponent(book.id)}`, {method:'PATCH',body:JSON.stringify({status,currentPage})}); const data=await api('/library'); setLibraryBooks(data.books); }
    catch(e) {setError(e.message);} finally {setSaving(null);}
  }

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const counts =
    getLibraryCounts(libraryBooks);

  const filteredBooks = useMemo(() => {
    return filterLibraryBooks(
      libraryBooks,
      activeFilter,
      searchTerm
    );
  }, [libraryBooks, activeFilter, searchTerm]);

  return (
    <>
      <main className="library-page">
        <Link
          to="/dashboard"
          className="library-back-link"
        >
          ← Back to overview
        </Link>

        <section className="library-hero">
          <div>
            <p className="small-label">
              YOUR COLLECTION
            </p>

            <h1>The library.</h1>

            <p className="library-intro">
              Every book you're reading, have finished,
              and hope to pick up next — kept in one
              quiet place.
            </p>
          </div>

          <Link to="/search" className="library-add-button">+ Add a book</Link>
        </section>

        <section className="library-counts">
          <div className="library-count">
            <strong>{counts.reading}</strong>
            <span>Reading</span>
          </div>

          <div className="library-count">
            <strong>{counts.finished}</strong>
            <span>Finished</span>
          </div>

          <div className="library-count">
            <strong>{counts.want}</strong>
            <span>Want to read</span>
          </div>
        </section>

        <section className="library-controls">
          <div className="library-filters">
            <button
              type="button"
              className={
                activeFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("all")
              }
            >
              All books
            </button>

            <button
              type="button"
              className={
                activeFilter === "reading"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("reading")
              }
            >
              Reading
            </button>

            <button
              type="button"
              className={
                activeFilter === "finished"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("finished")
              }
            >
              Finished
            </button>

            <button
              type="button"
              className={
                activeFilter === "want"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("want")
              }
            >
              Want to read
            </button>
          </div>

          <div className="library-search">
            <span className="library-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search title or author"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </section>

        {error && <p role="alert">{error}</p>}
        {loading && <p role="status">Loading your library…</p>}
        <section className="library-grid">
          {filteredBooks.map((book) => (
            <article
              className="library-book"
              key={book.id}
            >
              <Link
                to={`/books/${book.id}`}
                className="library-cover-wrap"
              >
                <img
                  src={book.cover}
                  alt={`${book.title} cover`}
                  className="library-book-cover"
                />

                {book.status === "reading" && (
                  <span className="library-status reading-status">
                    {book.progress}%
                  </span>
                )}

                {book.status === "finished" && (
                  <span className="library-status finished-status">
                    Finished
                  </span>
                )}
              </Link>

              <div className="library-book-content">
                {book.status === 'reading' && <form onSubmit={event => {event.preventDefault(); update(book, 'reading', Number(new FormData(event.currentTarget).get('page')));}}>
                  <label>Current page <input name="page" type="number" min="0" max={book.pages || undefined} defaultValue={book.currentPage} key={book.currentPage} required /></label>
                  <button disabled={saving !== null}>Save progress</button>
                  <button type="button" disabled={saving !== null} onClick={() => update(book, 'finished', book.pages || book.currentPage)}>Mark finished</button>
                </form>}

                <Link to={`/books/${book.id}`}>
                  <h2>{book.title}</h2>
                </Link>

                <p className="library-book-author">
                  {book.author}
                </p>

                <p className="library-book-details">
                  {book.genre} · {book.pages} pages
                </p>

                {book.status === "reading" && (
                  <div className="library-reading-progress">
                    <div className="library-progress-track">
                      <div
                        className="library-progress-fill"
                        style={{
                          width: `${book.progress}%`,
                        }}
                      ></div>
                    </div>

                    <span>
                      {book.progress}% complete
                    </span>
                  </div>
                )}

                {book.status === "finished" && (
                  <div className="library-finished-info">
                    <span>
                      Finished
                    </span>

                    <span>

                    </span>
                  </div>
                )}

                {book.status === "want" && (
                  <button
                    type="button"
                    className="start-reading-button"
                    disabled={saving !== null}
                    onClick={() => update(book, "reading", 0)}
                  >
                    Start reading →
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="library-empty">
            <h2>No books found.</h2>
            <p>
              Try a different search or filter.
            </p>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>Readscape</h3>

            <p>
              A quieter place to keep every book,
              thought, and reading milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>© 2026 Readscape</span>

            <Link to="/dashboard">
              Overview
            </Link>

            <span>
              All reading data saved
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Library;
