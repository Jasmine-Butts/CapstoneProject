
import { useState } from "react";

function AddBookForm({ onAdd, onSave, onClose, book = null }) {
  const isEditing = Boolean(book);

  const [form, setForm] = useState({
    title: book?.title || "",
    author: book?.author || "",
    genre: book?.genre || "",
    pages: book?.pages || "",
    cover: book?.cover || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const title = form.title.trim();
    const author = form.author.trim();
    const pages = Number(form.pages);

    if (!title || !author) {
      setError("Book title and author are required.");
      return;
    }

    if (!Number.isSafeInteger(pages) || pages <= 0) {
      setError("Enter a valid number of pages.");
      return;
    }

    if (isEditing && pages < Number(book.currentPage || 0)) {
      setError(
        "Total pages cannot be less than your current reading page."
      );
      return;
    }

    const bookData = {
      title,
      author,
      genre: form.genre.trim() || "Other",
      pages,
      cover: form.cover.trim() ||
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600",
    };

    setSaving(true);
    setError("");

    try {
      const result = isEditing
        ? await onSave(book.id, bookData)
        : await onAdd(bookData);

      if (result) {
        onClose();
      } else {
        setError(
          isEditing
            ? "Unable to save book changes. Please try again."
            : "Unable to add book. Please try again."
        );
      }
    } catch (err) {
      setError(err.message || "Unable to save book.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="book-form-overlay">
      <form className="book-form" onSubmit={handleSubmit}>
        <h2>
          {isEditing ? "Edit Book" : "Add a New Book"}
        </h2>

        <label htmlFor="book-title">Book Title</label>
        <input
          id="book-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={300}
          required
        />

        <label htmlFor="book-author">Author</label>
        <input
          id="book-author"
          name="author"
          value={form.author}
          onChange={handleChange}
          maxLength={300}
          required
        />

        <label htmlFor="book-genre">Genre</label>
        <input
          id="book-genre"
          name="genre"
          value={form.genre}
          onChange={handleChange}
          maxLength={200}
        />

        <label htmlFor="book-pages">Total Pages</label>
        <input
          id="book-pages"
          name="pages"
          type="number"
          min="1"
          step="1"
          value={form.pages}
          onChange={handleChange}
          required
        />

        <label htmlFor="book-cover">
          Cover Image URL (optional)
        </label>
        <input
          id="book-cover"
          name="cover"
          type="url"
          value={form.cover}
          onChange={handleChange}
          placeholder="https://..."
          maxLength={2000}
        />

        {error && (
          <p role="alert" style={{ color: "#a43e3e" }}>
            {error}
          </p>
        )}

        <div className="book-form-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Book"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBookForm;
