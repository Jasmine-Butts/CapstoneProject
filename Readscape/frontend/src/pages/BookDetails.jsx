
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useSharedBooks } from "../context/BooksContext";
import AddBookForm from "../components/AddBookForm";
import UpdateProgressForm from "../components/UpdateProgressForm";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    books,
    updateBook,
    removeBook,
    startReading,
    updateReadingProgress,
  } = useSharedBooks();

  const book = books.find(
    (item) => String(item.id) === String(id)
  );

  const [editingBook, setEditingBook] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] =
    useState(false);

  const [noteDraft, setNoteDraft] = useState(null);
  const [noteSaved, setNoteSaved] = useState(false);

  // Handle a book that does not exist.
  if (!book) {
    return (
      <main className="book-details-page">
        <Link to="/library" className="library-back-link">
          ← Back to library
        </Link>

        <h1>Book not found</h1>
        <p>
          This book may have been removed from your library.
        </p>

        <Link to="/library">Return to Library</Link>
      </main>
    );
  }

  const totalPages = Number(book.pages) || 0;

  const currentPage = book.status === "finished"
    ? totalPages
    : book.currentPage ??
      Math.round(
        totalPages * (Number(book.progress) || 0) / 100
      );

  const progress = book.status === "finished"
    ? 100
    : Number(book.progress) || 0;

  const statusLabels = {
    want: "Want to Read",
    reading: "Currently Reading",
    finished: "Finished",
  };

  function handleStatusChange(event) {
    const newStatus = event.target.value;

    if (newStatus === "reading" && book.status === "want") {
      startReading(book.id);
    } else if (newStatus === "finished") {
      updateReadingProgress(book.id, totalPages);
    } else if (newStatus === "want") {
      updateBook(book.id, {
        status: "want",
        currentPage: 0,
        progress: 0,
        finishedDate: undefined,
      });
    } else {
      updateBook(book.id, {
        status: newStatus,
        finishedDate: undefined,
      });
    }
  }

  function saveNote() {
    const value = (noteDraft ?? book.note ?? "").trim();

    updateBook(book.id, { note: value });
    setNoteSaved(true);
  }

  function confirmRemove() {
    removeBook(book.id);
    navigate("/library");
  }

  return (
    <>
      <main
        className="library-page book-details-page"
      >
        <Link
          to="/library"
          className="library-back-link"
        >
          ← Back to library
        </Link>

        {/* BOOK INFORMATION */}
        <section className="book-details-hero">

          <div className="book-details-cover-wrap">
            <img
              src={book.cover}
              alt={`${book.title} cover`}
              className="book-details-cover"
            />
          </div>

          <div className="book-details-info">

            <p className="small-label">
              YOUR BOOK COLLECTION
            </p>

            <h1>{book.title}</h1>

            <p className="book-details-author">
              by {book.author}
            </p>

            <p className="book-details-meta">
              {book.genre} · {book.pages} pages
            </p>

            {/* READING STATUS */}
            <div className="book-details-field">
              <label htmlFor="book-reading-status">
                Reading status
              </label>

              <select
                id="book-reading-status"
                value={book.status}
                onChange={handleStatusChange}
              >
                <option value="want">Want to Read</option>
                <option value="reading">
                  Currently Reading
                </option>
                <option value="finished">Finished</option>
              </select>
            </div>

            <p>
              Status:{" "}
              <strong>
                {statusLabels[book.status] || book.status}
              </strong>
            </p>

            {/* READING PROGRESS */}
            {book.status === "reading" && (
              <div className="book-details-progress">

                <div className="featured-progress-row">
                  <span>
                    {progress}% complete
                  </span>

                  <span>
                    {currentPage} / {totalPages} pages
                  </span>
                </div>

                <div className="featured-progress-bar">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowProgressForm(true)}
                >
                  Update Progress
                </button>

              </div>
            )}

            {book.status === "finished" && (
              <p>
                ✓ Finished
                {book.finishedDate
                  ? ` on ${book.finishedDate}`
                  : ""}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="book-details-actions">
              <button
                type="button"
                className="library-edit-button"
                onClick={() => setEditingBook(true)}
              >
                Edit Book
              </button>

              <button
                type="button"
                className="library-remove-button"
                onClick={() =>
                  setShowRemoveConfirmation(true)
                }
              >
                Remove Book
              </button>
            </div>

          </div>
        </section>

        {/* PERSONAL READING NOTES */}
        <section className="book-details-notes">
          <p className="small-label">
            MY READING JOURNAL
          </p>

          <h2>Notes & thoughts</h2>

          <p>
            Keep your favorite quotes, thoughts,
            and reflections about this book.
          </p>

          <label htmlFor="book-note">
            Personal notes
          </label>

          <textarea
            id="book-note"
            rows="6"
            placeholder="What do you want to remember about this book?"
            value={noteDraft ?? book.note ?? ""}
            onChange={(event) => {
              setNoteDraft(event.target.value);
              setNoteSaved(false);
            }}
          />

          <button
            type="button"
            className="primary-button"
            onClick={saveNote}
          >
            Save Notes
          </button>

          {noteSaved && (
            <p role="status">
              Your notes have been saved.
            </p>
          )}
        </section>

        {/* EDIT BOOK */}
        {editingBook && (
          <AddBookForm
            book={book}
            onSave={updateBook}
            onClose={() => setEditingBook(false)}
          />
        )}

        {/* UPDATE PROGRESS */}
        {showProgressForm && book.status === "reading" && (
          <UpdateProgressForm
            book={book}
            onSave={updateReadingProgress}
            onClose={() => setShowProgressForm(false)}
          />
        )}

        {/* REMOVE CONFIRMATION */}
        {showRemoveConfirmation && (
          <div className="book-form-overlay">
            <div
              className="book-form"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="book-remove-heading"
            >
              <h2 id="book-remove-heading">
                Remove Book?
              </h2>

              <p>
                Are you sure you want to remove{" "}
                <strong>{book.title}</strong>?
              </p>

              <p>
                This also removes it from your Wishlist
                and Dashboard.
              </p>

              <div className="book-form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowRemoveConfirmation(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="library-confirm-remove"
                  onClick={confirmRemove}
                >
                  Remove Book
                </button>
              </div>
            </div>
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
            <Link to="/library">Library</Link>
            <span>Reading data saved locally</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default BookDetails;
