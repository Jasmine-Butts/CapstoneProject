
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getLibraryCounts,
  filterLibraryBooks,
} from "../data/libraryData";

import { useSharedBooks } from "../context/BooksContext";
import AddBookForm from "../components/AddBookForm";
import UpdateProgressForm from "../components/UpdateProgressForm";

function Library() {
  // Dynamic book data
  const {
    books,
    addBook,
    removeBook,
    updateBook,
    startReading,
    updateReadingProgress,
  } = useSharedBooks();

  // Search and filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Add and edit book forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Remove confirmation
  const [bookToRemove, setBookToRemove] = useState(null);

  // Reading progress form
  const [progressBook, setProgressBook] = useState(null);

  // Calculate library counts
  const counts = useMemo(() => {
    return getLibraryCounts(books);
  }, [books]);

  // Filter and search books
  const filteredBooks = useMemo(() => {
    return filterLibraryBooks(
      books,
      activeFilter,
      searchTerm
    );
  }, [books, activeFilter, searchTerm]);

  // Close the Add/Edit form
  function closeBookForm() {
    setShowAddForm(false);
    setEditingBook(null);
  }

  // Confirm removal
  function confirmRemoveBook() {
    if (!bookToRemove) return;

    removeBook(bookToRemove.id);
    setBookToRemove(null);
  }

  return (
    <>
      <main className="library-page">

        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className="library-back-link"
        >
          ← Back to overview
        </Link>

        {/* Library Hero */}
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

          <button
            type="button"
            className="library-add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add a book
          </button>
        </section>

        {/* Add / Edit Book Form */}
        {(showAddForm || editingBook) && (
          <AddBookForm
            key={editingBook?.id ?? "new"}
            book={editingBook}
            onAdd={addBook}
            onSave={updateBook}
            onClose={closeBookForm}
          />
        )}

        {/* Library Counts */}
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

        {/* Search and Filters */}
        <section className="library-controls">

          <div className="library-filters">

            <button
              type="button"
              className={
                activeFilter === "all" ? "active" : ""
              }
              onClick={() => setActiveFilter("all")}
            >
              All books
            </button>

            <button
              type="button"
              className={
                activeFilter === "reading" ? "active" : ""
              }
              onClick={() => setActiveFilter("reading")}
            >
              Reading
            </button>

            <button
              type="button"
              className={
                activeFilter === "finished" ? "active" : ""
              }
              onClick={() => setActiveFilter("finished")}
            >
              Finished
            </button>

            <button
              type="button"
              className={
                activeFilter === "want" ? "active" : ""
              }
              onClick={() => setActiveFilter("want")}
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

        {/* Book Collection */}
        <section className="library-grid">

          {filteredBooks.map((book) => (
            <article
              className="library-book"
              key={book.id}
            >

              {/* Book Cover */}
              <Link
                to={`/books/${book.id}`}
                className="library-cover-wrap"
              >
                <img
                  src={book.cover}
                  alt={`${book.title} cover`}
                  className="library-book-cover"
                />

                {/* Reading Progress Badge */}
                {book.status === "reading" && (
                  <span className="library-status reading-status">
                    {book.progress ?? 0}%
                  </span>
                )}

                {/* Finished Badge */}
                {book.status === "finished" && (
                  <span className="library-status finished-status">
                    Finished
                  </span>
                )}

              </Link>

              {/* Book Information */}
              <div className="library-book-content">

                <Link to={`/books/${book.id}`}>
                  <h2>{book.title}</h2>
                </Link>

                <p className="library-book-author">
                  {book.author}
                </p>

                <p className="library-book-details">
                  {book.genre} · {book.pages} pages
                </p>

                {/* Currently Reading */}
                {book.status === "reading" && (
                  <>
                    <div className="library-reading-progress">

                      <div className="library-progress-track">
                        <div
                          className="library-progress-fill"
                          style={{
                            width: `${book.progress ?? 0}%`,
                          }}
                        />
                      </div>

                      <span>
                        {book.progress ?? 0}% complete
                      </span>

                    </div>

                    {/* Update Reading Progress Button */}
                    <button
                      type="button"
                      className="start-reading-button"
                      onClick={() => setProgressBook(book)}
                    >
                      Update Progress
                    </button>
                  </>
                )}

                {/* Finished Books */}
                {book.status === "finished" && (
                  <div className="library-finished-info">

                    {book.rating != null && (
                      <span>
                        ★ {book.rating}
                      </span>
                    )}

                    {book.finishedDate && (
                      <span>
                        Finished {book.finishedDate}
                      </span>
                    )}

                  </div>
                )}

                {/* Want to Read */}
                {book.status === "want" && (
                  <button
                    type="button"
                    className="start-reading-button"
                    onClick={() => startReading(book.id)}
                  >
                    Start reading →
                  </button>
                )}

                {/* Edit and Remove Buttons */}
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

        {/* Empty Library Message */}
        {filteredBooks.length === 0 && (
          <div className="library-empty">
            <h2>No books found.</h2>

            <p>
              {books.length === 0
                ? "Your library is empty. Add your first book!"
                : "Try a different search or filter."}
            </p>
          </div>
        )}

        {/* Remove Book Confirmation Dialog */}
        {bookToRemove && (
          <div className="book-form-overlay">
            <div
              className="book-form"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="remove-book-title"
              aria-describedby="remove-book-description"
            >

              <h2 id="remove-book-title">
                Remove Book?
              </h2>

              <p id="remove-book-description">
                Are you sure you want to remove
                <strong> "{bookToRemove.title}"</strong>?
              </p>

              <p>This action cannot be undone.</p>

              <div className="book-form-actions">

                <button
                  type="button"
                  onClick={() => setBookToRemove(null)}
                >
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

        {/* Update Reading Progress Form */}
        {progressBook && (
          <UpdateProgressForm
            key={progressBook.id}
            book={progressBook}
            onSave={updateReadingProgress}
            onClose={() => setProgressBook(null)}
          />
        )}

      </main>

      {/* Footer */}
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
              Reading data saved locally
            </span>

          </div>

        </div>
      </footer>
    </>
  );
}

export default Library;
