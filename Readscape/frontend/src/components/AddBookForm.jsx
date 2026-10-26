
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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.author.trim()) {
      return;
    }

    const pages = Number(form.pages);

    if (!Number.isInteger(pages) || pages <= 0) {
      return;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || "Other",
      pages,
      cover: form.cover.trim() ||
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600",
    };

    if (isEditing) {
      onSave(book.id, bookData);
    } else {
      onAdd(bookData);
    }

    onClose();
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
          required
        />

        <label htmlFor="book-author">Author</label>
        <input
          id="book-author"
          name="author"
          value={form.author}
          onChange={handleChange}
          required
        />

        <label htmlFor="book-genre">Genre</label>
        <input
          id="book-genre"
          name="genre"
          value={form.genre}
          onChange={handleChange}
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
        />

        <div className="book-form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit">
            {isEditing ? "Save Changes" : "Add Book"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AddBookForm;
