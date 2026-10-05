import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  wishlistBooks,
  recommendedBooks,
  savedSources,
  filterWishlistBooks,
  getWishlistStats,
} from "../data/wishlistData";

function Wishlist() {
  const [activeFilter, setActiveFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const stats =
    getWishlistStats(wishlistBooks);

  const filteredBooks = useMemo(() => {
    return filterWishlistBooks(
      wishlistBooks,
      activeFilter,
      searchTerm
    );
  }, [activeFilter, searchTerm]);

  const longestWait = wishlistBooks[0];

  return (
    <>
      <main className="wishlist-page">
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

            <h1>
              The wishlist.
            </h1>

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
          >
            + Add a book
          </button>
        </section>

        {/* STATS */}

        <section className="wishlist-stats">
          <div>
            <strong>
              {stats.waiting}
            </strong>

            <span>
              Waiting
            </span>
          </div>

          <div>
            <strong>
              {stats.pagesQueued.toLocaleString()}
            </strong>

            <span>
              Pages queued
            </span>
          </div>

          <div>
            <strong>
              {stats.nextUp}
            </strong>

            <span>
              Next up
            </span>
          </div>
        </section>

        {/* CONTROLS */}

        <section className="wishlist-controls">
          <div className="wishlist-filters">
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
              All waiting
            </button>

            <button
              type="button"
              className={
                activeFilter === "next"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("next")
              }
            >
              Next up
            </button>

            <button
              type="button"
              className={
                activeFilter === "october"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("october")
              }
            >
              Added in October
            </button>
          </div>

          <div className="wishlist-search">
            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search title or author"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
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

            <h2>
              In the order you'd read them
            </h2>

            <div className="wishlist-queue">
              {filteredBooks.map((book) => (
                <article
                  className="wishlist-book-row"
                  key={book.id}
                >
                  <span className="wishlist-order">
                    {book.order}
                  </span>

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

                  <div className="wishlist-book-copy">
                    <Link
                      to={`/books/${book.id}`}
                    >
                      <h3>
                        {book.title}
                      </h3>
                    </Link>

                    <p className="wishlist-book-meta">
                      {book.author} ·{" "}
                      {book.genre} ·{" "}
                      {book.pages} pages
                    </p>

                    <blockquote>
                      “{book.note}”
                    </blockquote>

                    <p className="wishlist-waiting">
                      Waiting since{" "}
                      {book.waitingSince} · from{" "}
                      {book.source}
                    </p>

                    <button
                      type="button"
                      className="wishlist-start-button"
                    >
                      Start reading →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="wishlist-empty">
                <h3>
                  No books found.
                </h3>

                <p>
                  Try another filter or search.
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

              <h3>
                {longestWait.title}
              </h3>

              <p>
                Waiting since{" "}
                {longestWait.waitingSince} ·{" "}
                {longestWait.pages} pages
              </p>
            </div>

            <div className="wishlist-side-block">
              <p className="small-label">
                SAVED FROM
              </p>

              <ul className="wishlist-source-list">
                {savedSources.map(
                  (source) => (
                    <li key={source.name}>
                      <span>
                        {source.name}
                      </span>

                      <strong>
                        {source.count}
                      </strong>
                    </li>
                  )
                )}
              </ul>
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

              <h2>
                Picked for you
              </h2>

              <p className="wishlist-recommendation-subtitle">
                Based on what you've finished
              </p>
            </div>
          </div>

          <div className="wishlist-recommendation-grid">
            {recommendedBooks.map(
              (book) => (
                <article
                  className="wishlist-recommendation-card"
                  key={book.id}
                >
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                  />

                  <h3>
                    {book.title}
                  </h3>

                  <p className="recommendation-author">
                    {book.author}
                  </p>

                  <p className="recommendation-meta">
                    {book.genre} ·{" "}
                    {book.pages} pages
                  </p>

                  <button
                    type="button"
                    className="recommendation-add-button"
                  >
                    Add to wishlist
                  </button>
                </article>
              )
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>
              Readscape
            </h3>

            <p>
              A quieter place to keep every
              book, thought, and reading
              milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>
              © 2026 Readscape
            </span>

            <Link to="/library">
              Library
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

export default Wishlist;