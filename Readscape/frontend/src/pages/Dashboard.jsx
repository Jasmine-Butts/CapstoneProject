import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSharedGoals } from "../context/GoalsContext";
import { useSharedProfile } from "../context/ProfileContext";

import {
  dashboardData,
  getMonthlyBarHeight,
} from "../data/dashboardData";

import { useSharedBooks } from "../context/BooksContext";
import UpdateProgressForm from "../components/UpdateProgressForm";

function Dashboard() {
  const { books, updateReadingProgress } = useSharedBooks();
  const { goals } = useSharedGoals();
  const [progressBook, setProgressBook] = useState(null);
  const { profile } = useSharedProfile();

  const today = new Date();

  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const readingBooks = useMemo(
    () => books.filter((book) => book.status === "reading"),
    [books]
  );

  const finishedBooks = useMemo(
    () => books.filter((book) => book.status === "finished"),
    [books]
  );

  const wishlistBooks = useMemo(
    () => books.filter((book) => book.status === "want"),
    [books]
  );

  // Show the first book currently being read.
  const currentBook = readingBooks[0] || null;

  // Use the current Library books 
  const readingQueue = wishlistBooks.slice(0, 3);

  const recentBooks = finishedBooks.slice(0, 3);

 const mainGoal =
  goals.find((goal) => goal.main) || goals[0] || null;

const goalTarget = Number(mainGoal?.target) || 0;

const recordedPages = books.reduce((total, book) => {
  const pages = Number(book.pages) || 0;

  if (book.status === "finished") {
    return total + pages;
  }

  if (book.status === "reading") {
    const currentPage = book.currentPage ??
      Math.round(
        pages * (Number(book.progress) || 0) / 100
      );

    return total + currentPage;
  }

  return total;
}, 0);

const goalCurrent = !mainGoal
  ? 0
  : mainGoal.unit === "books"
    ? finishedBooks.length
    : mainGoal.unit === "pages"
      ? recordedPages
      : Number(mainGoal.current) || 0;


  // only have a percentage rather than an exact page number.
  function getPagesRead(book) {
    const totalPages = Number(book.pages) || 0;

    if (book.status === "finished") {
      return totalPages;
    }

    if (book.status !== "reading") {
      return 0;
    }

    return book.currentPage ??
      Math.round(
        totalPages * (Number(book.progress) || 0) / 100
      );
  }

  const pagesRecorded = useMemo(
    () => books.reduce(
      (total, book) => total + getPagesRead(book),
      0
    ),
    [books]
  );

  const readingProgress = [
    {
      value: String(finishedBooks.length),
      label: "Books finished",
    },
    {
      value: String(readingBooks.length),
      label: "Currently reading",
    },
    {
      value: String(wishlistBooks.length),
      label: "Want to read",
    },
    {
      value: pagesRecorded.toLocaleString(),
      label: "Pages recorded (est.)",
    },
  ];

  const currentPage = currentBook
    ? getPagesRead(currentBook)
    : 0;

  const monthlyActivity = dashboardData.monthlyActivity;

  return (
    <>
      <main className="dashboard-page">

        {/* HERO */}
        <section className="dashboard-hero">
          <div className="hero-copy">
            <p className="dashboard-date">
              {dateLabel}
            </p>

            <h1>
              A good day
              <br />
              to keep reading.
            </h1>

            <p className="hero-description">
              Welcome back, {profile.name?.trim().split(/\s+/)[0] || "Reader"}.
              You have {readingBooks.length} books in
              progress and {wishlistBooks.length} waiting
              to be explored.
            </p>
          </div>

        <div className="goal-summary">
  <p className="small-label">
    MAIN READING GOAL
  </p>

  {mainGoal ? (
    <>
      <h2>{mainGoal.title}</h2>

      <p>
        {goalCurrent.toLocaleString()} of{" "}
        {goalTarget.toLocaleString()}{" "}
        {mainGoal.unit}
      </p>

      <p>
        {Math.max(
          goalTarget - goalCurrent,
          0
        ).toLocaleString()}{" "}
        {mainGoal.unit} remaining
      </p>

      <Link to="/goals" className="text-link">
        Manage goals
      </Link>
    </>
  ) : (
    <>
      <h2>No reading goal yet</h2>

      <Link to="/goals" className="text-link">
        Create a goal
      </Link>
    </>
  )}
</div>
</section>

        {/* CURRENTLY READING */}
        <section className="featured-reading">
          <div className="featured-copy">
            <p className="small-label">
              CURRENTLY READING
            </p>

            {currentBook ? (
              <>
                <h2>{currentBook.title}</h2>

                <p className="featured-author">
                  {currentBook.author}
                </p>

                <blockquote>
                  Keep turning pages. Every chapter
                  brings you closer to the finish.
                </blockquote>

                <div className="featured-progress-row">
                  <span>
                    {currentBook.progress ?? 0}% complete
                  </span>

                  <span>
                    {currentPage} / {currentBook.pages} pages
                  </span>
                </div>

                <div className="featured-progress-bar">
                  <div
                    style={{
                      width: `${currentBook.progress ?? 0}%`,
                    }}
                  />
                </div>

                <div className="featured-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setProgressBook(currentBook)}
                  >
                    Update progress
                  </button>

                  <Link
                    to="/library"
                    className="secondary-button"
                  >
                    View library
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2>Your next story awaits.</h2>

                <p className="featured-author">
                  You're not currently reading a book.
                </p>

                <div className="featured-actions">
                  <Link
                    to="/library"
                    className="primary-button"
                  >
                    Explore your library
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="featured-cover-wrap">
            {currentBook ? (
              <img
                src={currentBook.cover}
                alt={`${currentBook.title} cover`}
                className="featured-cover"
              />
            ) : (
              <div className="featured-cover">
                <p>Readscape</p>
              </div>
            )}
          </div>
        </section>

        {/* READING PROGRESS */}
        <section className="reading-progress-section">
          <p className="small-label">
            READING PROGRESS
          </p>

          <div className="reading-progress-grid">
            {readingProgress.map((item) => (
              <div
                className="progress-stat"
                key={item.label}
              >
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* READING NOTE + MONTHLY ACTIVITY */}
        <section className="dashboard-middle-grid">
          <div className="reading-note-card">
            <p className="small-label">
              READING INSPIRATION
            </p>

            <blockquote>
              “{dashboardData.readingNote.quote}”
            </blockquote>

            <p className="quote-author">
              — {dashboardData.readingNote.author}
            </p>
          </div>

          <div className="monthly-summary">
            <p className="small-label">
              SAMPLE MONTHLY ACTIVITY
            </p>

            <h2>A steady rhythm</h2>

            <p className="monthly-pages">
              Demo activity data
            </p>

            <div className="monthly-bars">
              {monthlyActivity.map((item) => (
                <div
                  className="month-column"
                  key={item.month}
                >
                  <div
                    className="month-bar"
                    style={{
                      height: `${getMonthlyBarHeight(
                        item.pages
                      )}px`,
                    }}
                  />

                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* READING QUEUE */}
        <section className="queue-section">
          <div className="section-heading-row">
            <div>
              <p className="small-label">
                UP NEXT
              </p>

              <h2>Reading queue</h2>
            </div>

            <Link
              to="/wishlist"
              className="text-link"
            >
              View wishlist
            </Link>
          </div>

          <div className="queue-list">
            {readingQueue.length > 0 ? (
              readingQueue.map((book, index) => (
                <div
                  className="queue-row"
                  key={book.id}
                >
                  <span className="queue-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="queue-cover"
                  />

                  <div>
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>
                Your reading queue is empty.
                Add books to your Want to Read list.
              </p>
            )}
          </div>
        </section>

        {/* RECENT LIBRARY */}
        <section className="recent-library-section">
          <div className="section-heading-row">
            <div>
              <p className="small-label">
                RECENT IN YOUR LIBRARY
              </p>

              <h2>Finished, remembered.</h2>
            </div>

            <Link
              to="/library"
              className="text-link"
            >
              View library
            </Link>
          </div>

          <div className="recent-books-grid">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <article
                  className="recent-book-card"
                  key={book.id}
                >
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="recent-book-cover"
                  />

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>

                  <div className="recent-book-meta">
                    <span>
                      {book.finishedDate
                        ? `Finished ${book.finishedDate}`
                        : "Finished"}
                    </span>

                    {book.rating != null && (
                      <span>★ {book.rating}</span>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p>
                Books you finish will appear here.
              </p>
            )}
          </div>
        </section>

        {/* UPDATE PROGRESS FORM */}
        {progressBook && (
          <UpdateProgressForm
            key={progressBook.id}
            book={progressBook}
            onSave={updateReadingProgress}
            onClose={() => setProgressBook(null)}
          />
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
            <span>Privacy</span>
            <span>Reading data saved locally</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Dashboard;
