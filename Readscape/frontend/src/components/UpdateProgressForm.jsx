
import { useState } from "react";

function UpdateProgressForm({ book, onSave, onClose }) {
  const totalPages = Number(book.pages);

  const initialPage = book.currentPage ??
    Math.round(
      (Number(book.progress || 0) / 100) * totalPages
    );

  const [currentPage, setCurrentPage] = useState(initialPage);

  const validPage =
    currentPage !== "" &&
    Number.isInteger(Number(currentPage)) &&
    Number(currentPage) >= 0 &&
    Number(currentPage) <= totalPages;

  const percentage = validPage
    ? Math.round((Number(currentPage) / totalPages) * 100)
    : 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (!validPage) return;

    onSave(book.id, Number(currentPage));
    onClose();
  }

  return (
    <div className="book-form-overlay">
      <form className="book-form" onSubmit={handleSubmit}>
        <h2>Update Reading Progress</h2>

        <h3>{book.title}</h3>

        <p>Total pages: {totalPages}</p>

        <label htmlFor="current-page">
          What page are you on?
        </label>

        <input
          id="current-page"
          type="number"
          min="0"
          max={totalPages}
          step="1"
          value={currentPage}
          onChange={(event) =>
            setCurrentPage(event.target.value)
          }
          required
        />

        <p>
          Reading progress: <strong>{percentage}%</strong>
        </p>

        <div className="library-progress-track">
          <div
            className="library-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {validPage && Number(currentPage) === totalPages && (
          <p>You've finished this book!</p>
        )}

        <div className="book-form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" disabled={!validPage}>
            Save Progress
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProgressForm;
