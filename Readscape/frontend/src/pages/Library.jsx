import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getLibraryCounts, filterLibraryBooks } from "../data/libraryData";
import { useSharedBooks } from "../context/BooksContext";
import AddBookForm from "../components/AddBookForm";
import UpdateProgressForm from "../components/UpdateProgressForm";
import { api } from "../services/api";

function Library() {
  const {
    books,
    addBook,
    removeBook,
    updateBook,
    startReading,
    updateReadingProgress,
  } = useSharedBooks();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToRemove, setBookToRemove] = useState(null);
  const [progressBook, setProgressBook] = useState(null);

  // Keep the backend collection separate until all app pages use the API.
  const [serverBooks, setServerBooks] = useState([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const hasSession = Boolean(sessionStorage.getItem("readscapeToken"));

  useEffect(() => {
    if (!hasSession) return;
    let active = true;
    setServerLoading(true);
    api("/library")
      .then((data) => {
        if (active) setServerBooks(Array.isArray(data?.books) ? data.books : []);
      })
      .catch((error) => {
        if (active) setServerError(error.message || "Unable to load server library.");
      })
      .finally(() => {
        if (active) setServerLoading(false);
      });
    return () => { active = false; };
  }, [hasSession]);

  async function updateServerBook(book, status, currentPage) {
    setSavingId(book.id);
    setServerError("");
    try {
      await api(`/library/${encodeURIComponent(book.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, currentPage }),
      });
      const data = await api("/library");
      setServerBooks(Array.isArray(data?.books) ? data.books : []);
    } catch (error) {
      setServerError(error.message || "Unable to save changes.");
    } finally {
      setSavingId(null);
    }
  }

  const counts = useMemo(() => getLibraryCounts(books), [books]);
  const filteredBooks = useMemo(
    () => filterLibraryBooks(books, activeFilter, searchTerm),
    [books, activeFilter, searchTerm]
  );

  function closeBookForm() {
    setShowAddForm(false);
    setEditingBook(null);
  }

  function confirmRemoveBook() {
    if (!bookToRemove) return;
    removeBook(bookToRemove.id);
    setBookToRemove(null);
  }

  return (
    <>
      <main className="library-page">
        <Link to="/dashboard" className="library-back-link">
          ← Back to overview
        </Link>

        <section className="library-hero">
          <div>
            <p className="small-label">YOUR COLLECTION</p>
            <h1>The library.</h1>
            <p className="library-intro">
              Every book you're reading, have finished, and hope to pick up next —
              kept in one quiet place.
            </p>
          </div>
          <button
            type="button"
            className="library-add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add a book
          </button>
        </section>

        <p>
          <Link to="/search" className="text-link">Search for books →</Link>
        </p>

        {(showAddForm || editingBook) && (
          <AddBookForm
            key={editingBook?.id ?? "new"}
            book={editingBook}
            onAdd={addBook}
            onSave={updateBook}
            onClose={closeBookForm}
          />
        )}

        <section className="library-counts">
          <div className="library-count">
            <strong>{counts.reading}</strong><span>Reading</span>
          </div>
          <div className="library-count">
            <strong>{counts.finished}</strong><span>Finished</span>
          </div>
          <div className="library-count">
            <strong>{counts.want}</strong><span>Want to read</span>
          </div>
        </section>

        <section className="library-controls">
          <div className="library-filters">
            {[
              ["all", "All books"],
              ["reading", "Reading"],
              ["finished", "Finished"],
              ["want", "Want to read"],
            ].map(([filter, label]) => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="library-search">
            <span className="library-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search title or author"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </section>

        <section className="library-grid">
          {filteredBooks.map((book) => (
            <article className="library-book" key={book.id}>
              <Link to={`/books/${book.id}`} className="library-cover-wrap">
                {book.cover && (
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="library-book-cover"
                  />
                )}
                {book.status === "reading" && (
                  <span className="library-status reading-status">
                    {book.progress ?? 0}%
                  </span>
                )}
                {book.status === "finished" && (
                  <span className="library-status finished-status">Finished</span>
                )}
              </Link>
              <div className="library-book-content">
                <Link to={`/books/${book.id}`}><h2>{book.title}</h2></Link>
                <p className="library-book-author">{book.author}</p>
                <p className="library-book-details">
                  {book.genre || "Uncategorized"} · {book.pages ?? "?"} pages
                </p>

                {book.status === "reading" && (
                  <>
                    <div className="library-reading-progress">
                      <div className="library-progress-track">
                        <div
                          className="library-progress-fill"
                          style={{ width: `${book.progress ?? 0}%` }}
                        />
                      </div>
                      <span>{book.progress ?? 0}% complete</span>
                    </div>
                    <button
                      type="button"
                      className="start-reading-button"
                      onClick={() => setProgressBook(book)}
                    >
                      Update Progress
                    </button>
                  </>
                )}

                {book.status === "finished" && (
                  <div className="library-finished-info">
                    {book.rating != null && <span>★ {book.rating}</span>}
                    {book.finishedDate && <span>Finished {book.finishedDate}</span>}
                    {!book.finishedDate && book.rating == null && <span>Finished</span>}
                  </div>
                )}

                {book.status === "want" && (
                  <button
                    type="button"
                    className="start-reading-button"
                    onClick={() => startReading(book.id)}
                  >
                    Start reading →
                  </button>
                )}

                <div className="library-book-actions">
                  <button
                    type="button"
                    className="library-edit-button"
                    onClick={() => setEditingBook(book)}
                  >
                    Edit Book
                  </button>
                  <button
                    type="button"
                    className="library-remove-button"
                    onClick={() => setBookToRemove(book)}
                  >
                    Remove Book
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {filteredBooks.length === 0 && (
          <div className="library-empty">
            <h2>No books found.</h2>
            <p>
              {books.length === 0
                ? "Your local library is empty. Add your first book!"
                : "Try a different search or filter."}
            </p>
          </div>
        )}

        {/* Server books are shown separately until backend and BooksContext are unified. */}
        {hasSession && (
          <section className="recent-library-section">
            <h2>Account library (server)</h2>
            <p>These books come from your account's backend library. Changes here do not yet update local reading statistics and goals.</p>
            {serverError && <p role="alert">{serverError}</p>}
            {serverLoading && <p role="status">Loading account library…</p>}
            {!serverLoading && !serverError && serverBooks.length === 0 && (
              <p>No books saved on the server yet.</p>
            )}
            {!serverLoading && serverBooks.map((book) => (
              <article className="library-book" key={`server-${book.id}`}>
                <div className="library-book-content">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <p>Status: {book.status}</p>
                  {book.status === "reading" && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const page = Number(new FormData(event.currentTarget).get("page"));
                        updateServerBook(book, "reading", page);
                      }}
                    >
                      <label>
                        Current page{" "}
                        <input
                          name="page"
                          type="number"
                          min="0"
                          max={book.pages || undefined}
                          defaultValue={book.currentPage ?? 0}
                          key={book.currentPage}
                          required
                        />
                      </label>
                      <button type="submit" disabled={savingId !== null}>
                        Save progress
                      </button>
                      <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => updateServerBook(book, "finished", book.pages || book.currentPage || 0)}
                      >
                        Mark finished
                      </button>
                    </form>
                  )}
                  {book.status === "want" && (
                    <button
                      type="button"
                      disabled={savingId !== null}
                      onClick={() => updateServerBook(book, "reading", 0)}
                    >
                      Start reading →
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {bookToRemove && (
          <div className="book-form-overlay">
            <div
              className="book-form"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="remove-book-title"
              aria-describedby="remove-book-description"
            >
              <h2 id="remove-book-title">Remove Book?</h2>
              <p id="remove-book-description">
                Are you sure you want to remove <strong>"{bookToRemove.title}"</strong>?
              </p>
              <p>This action cannot be undone.</p>
              <div className="book-form-actions">
                <button type="button" onClick={() => setBookToRemove(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="library-confirm-remove"
                  onClick={confirmRemoveBook}
                >
                  Remove Book
                </button>
              </div>
            </div>
          </div>
        )}

        {progressBook && (
          <UpdateProgressForm
            key={progressBook.id}
            book={progressBook}
            onSave={updateReadingProgress}
            onClose={() => setProgressBook(null)}
          />
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>Readscape</h3>
            <p>A quieter place to keep every book, thought, and reading milestone.</p>
          </div>
          <div className="footer-bottom-row">
            <span>© 2026 Readscape</span>
            <Link to="/dashboard">Overview</Link>
            <span>Reading data saved locally</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Library;
