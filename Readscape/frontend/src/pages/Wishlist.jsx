
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { recommendedBooks } from "../data/wishlistData";
import { useSharedBooks } from "../context/BooksContext";
import AddBookForm from "../components/AddBookForm";

function Wishlist() {
  const {
    books,
    addBook,
    updateBook,
    removeBook,
    startReading,
  } = useSharedBooks();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToRemove, setBookToRemove] = useState(null);

  // All Wishlist books come from the shared Library.
  const wishlistBooks = useMemo(() => {
    return books.filter((book) => book.status === "want");
  }, [books]);

  // Display the first three books as Next Up.
  const nextUpBooks = wishlistBooks.slice(0, 3);

  // Search and filter Wishlist books.
  const filteredBooks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return wishlistBooks.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search);

      let matchesFilter = true;

      if (activeFilter === "next") {
        matchesFilter = nextUpBooks.some(
          (nextBook) => nextBook.id === book.id
        );
      }

      if (activeFilter === "october") {
        const addedDate = book.addedAt
          ? new Date(book.addedAt)
          : null;

        matchesFilter =
          addedDate !== null &&
          !Number.isNaN(addedDate.getTime()) &&
          addedDate.getFullYear() === 2026 &&
          addedDate.getMonth() === 9;
      }

      return matchesSearch && matchesFilter;
    });
  }, [wishlistBooks, activeFilter, searchTerm]);

  // Dynamic Wishlist statistics.
  const stats = useMemo(() => {
    return {
      waiting: wishlistBooks.length,

      pagesQueued: wishlistBooks.reduce(
        (total, book) =>
          total + (Number(book.pages) || 0),
        0
      ),

      nextUp: nextUpBooks.length,
    };
  }, [wishlistBooks]);

  // Find the oldest book with a recorded addition date.
  const oldestDatedBook = [...wishlistBooks]
    .filter((book) => book.addedAt)
    .filter((book) =>
      !Number.isNaN(new Date(book.addedAt).getTime())
    )
    .sort(
      (a, b) =>
        new Date(a.addedAt) - new Date(b.addedAt)
    )[0];

  // Count recorded sources, if available.
  const savedSources = useMemo(() => {
    const counts = {};

    wishlistBooks.forEach((book) => {
      if (book.source) {
        counts[book.source] =
          (counts[book.source] || 0) + 1;
      }
    });

    return Object.entries(counts).map(
      ([name, count]) => ({ name, count })
    );
  }, [wishlistBooks]);

  // Close Add / Edit form.
  function closeBookForm() {
    setShowAddForm(false);
    setEditingBook(null);
  }

  // Remove a book only after confirmation.
  function confirmRemoveBook() {
    if (!bookToRemove) return;

    removeBook(bookToRemove.id);
    setBookToRemove(null);
  }

  // Add a recommended book to the Wishlist.
  function addRecommendedBook(book) {
    const exists = books.some(
      (saved) =>
        saved.title.trim().toLowerCase() ===
          book.title.trim().toLowerCase() &&
        saved.author.trim().toLowerCase() ===
          book.author.trim().toLowerCase()
    );

    if (exists) return;

    addBook({
      title: book.title,
      author: book.author,
      genre: book.genre,
      pages: book.pages,
      cover: book.cover,
    });
  }

  function isBookSaved(book) {
    return books.some(
      (saved) =>
        saved.title.trim().toLowerCase() ===
          book.title.trim().toLowerCase() &&
        saved.author.trim().toLowerCase() ===
          book.author.trim().toLowerCase()
    );
  }

  function formatDate(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <main className="wishlist-page">

        {/* BACK TO DASHBOARD */}
        <Link
          to="/dashboard"
          className="wishlist-back-link"
        >
          ← Back to overview
        </Link>

        {/* HERO */}
        <section className="wishlist-hero">
          <div>
            <p className="small-label">
              WANT TO READ
            </p>

            <h1>The wishlist.</h1>

            <p className="wishlist-intro">
              Everything you haven't got to yet —
              kept in the order you'd actually read
              them, with a line on why each one is
              waiting.
            </p>
          </div>

          <button
            type="button"
            className="wishlist-add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add a book
          </button>
        </section>

        {/* ADD / EDIT FORM */}
        {(showAddForm || editingBook) && (
          <AddBookForm
            key={editingBook?.id ?? "new"}
            book={editingBook}
            onAdd={addBook}
            onSave={updateBook}
            onClose={closeBookForm}
          />
        )}

        {/* STATS */}
        <section className="wishlist-stats">
          <div>
            <strong>{stats.waiting}</strong>
            <span>Waiting</span>
          </div>

          <div>
            <strong>
              {stats.pagesQueued.toLocaleString()}
            </strong>
            <span>Pages queued</span>
          </div>

          <div>
            <strong>{stats.nextUp}</strong>
            <span>Next up</span>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="wishlist-controls">
          <div className="wishlist-filters">

            <button
              type="button"
              className={
                activeFilter === "all" ? "active" : ""
              }
              onClick={() => setActiveFilter("all")}
            >
              All waiting
            </button>

            <button
              type="button"
              className={
                activeFilter === "next" ? "active" : ""
              }
              onClick={() => setActiveFilter("next")}
            >
              Next up
            </button>

            <button
              type="button"
              className={
                activeFilter === "october" ? "active" : ""
              }
              onClick={() => setActiveFilter("october")}
            >
              Added in October
            </button>

          </div>

          <div className="wishlist-search">
            <span>⌕</span>

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

        {/* MAIN QUEUE AREA */}
        <section className="wishlist-content-grid">

          <div className="wishlist-queue-section">
            <p className="small-label">
              YOUR QUEUE
            </p>

            <h2>In the order you'd read them</h2>

            <div className="wishlist-queue">

              {filteredBooks.map((book) => {
                const order =
                  wishlistBooks.findIndex(
                    (item) => item.id === book.id
                  ) + 1;

                const waitingSince = formatDate(
                  book.addedAt
                );

                return (
                  <article
                    className="wishlist-book-row"
                    key={book.id}
                  >

                    <span className="wishlist-order">
                      {String(order).padStart(2, "0")}
                    </span>

                    {/* BOOK COVER */}
                    <Link
                      to={`/books/${book.id}`}
                      className="wishlist-cover-link"
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} cover`}
                        className="wishlist-cover"
                      />
                    </Link>

                    {/* BOOK INFORMATION */}
                    <div className="wishlist-book-copy">

                      <Link to={`/books/${book.id}`}>
                        <h3>{book.title}</h3>
                      </Link>

                      <p className="wishlist-book-meta">
                        {book.author} ·{" "}
                        {book.genre} ·{" "}
                        {book.pages} pages
                      </p>

                      {book.note && (
                        <blockquote>
                          “{book.note}”
                        </blockquote>
                      )}

                      <p className="wishlist-waiting">
                        {waitingSince
                          ? `Waiting since ${waitingSince}`
                          : "On your reading wishlist"}

                        {book.source
                          ? ` · from ${book.source}`
                          : ""}
                      </p>

                      {/* ACTION BUTTONS */}
                      <div className="library-book-actions">

                        <button
                          type="button"
                          className="wishlist-start-button"
                          onClick={() =>
                            startReading(book.id)
                          }
                        >
                          Start reading →
                        </button>

                        <button
                          type="button"
                          className="library-edit-button"
                          onClick={() =>
                            setEditingBook(book)
                          }
                        >
                          Edit Book
                        </button>

                        <button
                          type="button"
                          className="library-remove-button"
                          onClick={() =>
                            setBookToRemove(book)
                          }
                        >
                          Remove Book
                        </button>

                      </div>
                    </div>
                  </article>
                );
              })}

            </div>

            {/* EMPTY MESSAGE */}
            {filteredBooks.length === 0 && (
              <div className="wishlist-empty">
                <h3>No books found.</h3>

                <p>
                  {wishlistBooks.length === 0
                    ? "Your wishlist is empty. Add your first book!"
                    : "Try another filter or search."}
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="wishlist-sidebar">

            <div className="wishlist-side-block">
              <p className="small-label">
                LONGEST WAIT
              </p>

              {oldestDatedBook ? (
                <>
                  <h3>{oldestDatedBook.title}</h3>

                  <p>
                    Waiting since{" "}
                    {formatDate(oldestDatedBook.addedAt)}
                    {" · "}
                    {oldestDatedBook.pages} pages
                  </p>
                </>
              ) : (
                <p>
                  Waiting dates haven't been recorded
                  for these books yet.
                </p>
              )}
            </div>

            <div className="wishlist-side-block">
              <p className="small-label">
                SAVED FROM
              </p>

              {savedSources.length > 0 ? (
                <ul className="wishlist-source-list">
                  {savedSources.map((source) => (
                    <li key={source.name}>
                      <span>{source.name}</span>
                      <strong>{source.count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No sources recorded yet.</p>
              )}
            </div>

            <div className="wishlist-note">
              <p className="small-label">
                A NOTE
              </p>

              <p>
                A wishlist is allowed to be too
                long. Move one down, set one
                aside, and the list stops feeling
                like a debt.
              </p>
            </div>

          </aside>
        </section>

        {/* RECOMMENDATIONS */}
        <section className="wishlist-recommendations">

          <div className="section-heading-row">
            <div>
              <p className="small-label">
                WHILE YOU WAIT
              </p>

              <h2>Picked for you</h2>

              <p className="wishlist-recommendation-subtitle">
                Sample recommendations
              </p>
            </div>
          </div>

          <div className="wishlist-recommendation-grid">

            {recommendedBooks.map((book) => {
              const alreadySaved = isBookSaved(book);

              return (
                <article
                  className="wishlist-recommendation-card"
                  key={book.id}
                >
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                  />

                  <h3>{book.title}</h3>

                  <p className="recommendation-author">
                    {book.author}
                  </p>

                  <p className="recommendation-meta">
                    {book.genre} · {book.pages} pages
                  </p>

                  <button
                    type="button"
                    className="recommendation-add-button"
                    disabled={alreadySaved}
                    onClick={() =>
                      addRecommendedBook(book)
                    }
                  >
                    {alreadySaved
                      ? "Already in library"
                      : "Add to wishlist"}
                  </button>
                </article>
              );
            })}

          </div>
        </section>

        {/* REMOVE CONFIRMATION */}
        {bookToRemove && (
          <div className="book-form-overlay">
            <div
              className="book-form"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="wishlist-remove-title"
            >

              <h2 id="wishlist-remove-title">
                Remove Book?
              </h2>

              <p>
                Are you sure you want to remove
                <strong> "{bookToRemove.title}"</strong>?
              </p>

              <p>
                This will also remove the book
                from your Library.
              </p>

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

      </main>

      {/* FOOTER */}
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

            <Link to="/library">
              Library
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

export default Wishlist;
