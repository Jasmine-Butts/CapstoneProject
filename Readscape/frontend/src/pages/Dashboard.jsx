import { Link } from "react-router-dom";

import {
  dashboardData,
  getMonthlyBarHeight,
} from "../data/dashboardData";

function Dashboard() {
  return (
    <>
      <main className="dashboard-page">
        {/* HERO */}

        <section className="dashboard-hero">
          <div className="hero-copy">
            <p className="dashboard-date">
              Monday, October 5
            </p>

            <h1>
              A good evening
              <br />
              to keep reading.
            </h1>

            <p className="hero-description">
              Welcome back, {dashboardData.userName}. You read 126 pages this
              week and kept your pace for another seven days.
            </p>
          </div>

          <div className="goal-summary">
            <p className="small-label">
              2026 GOAL
            </p>

            <h2>
              {dashboardData.goalCurrent} of{" "}
              {dashboardData.goalTarget} books
            </h2>

            <p>
              {dashboardData.aheadOfSchedule} books ahead of schedule
            </p>
          </div>
        </section>

        {/* CURRENTLY READING */}

        <section className="featured-reading">
          <div className="featured-copy">
            <p className="small-label">
              CURRENTLY READING
            </p>

            <h2>
              {dashboardData.currentlyReading.title}
            </h2>

            <p className="featured-author">
              {dashboardData.currentlyReading.author}
            </p>

            <blockquote>
              “{dashboardData.currentlyReading.quote}”
            </blockquote>

            <div className="featured-progress-row">
              <span>
                {dashboardData.currentlyReading.progress}% complete
              </span>

              <span>
                {dashboardData.currentlyReading.currentPage} /{" "}
                {dashboardData.currentlyReading.totalPages} pages
              </span>
            </div>

            <div className="featured-progress-bar">
              <div
                style={{
                  width: `${dashboardData.currentlyReading.progress}%`,
                }}
              ></div>
            </div>

            <div className="featured-actions">
              <button
                type="button"
                className="primary-button"
              >
                Update progress
              </button>

              <button
                type="button"
                className="secondary-button"
              >
                Add note
              </button>
            </div>
          </div>

          <div className="featured-cover-wrap">
            <img
              src={dashboardData.currentlyReading.cover}
              alt={`${dashboardData.currentlyReading.title} cover`}
              className="featured-cover"
            />
          </div>
        </section>

        {/* READING PROGRESS */}

        <section className="reading-progress-section">
          <p className="small-label">
            READING PROGRESS
          </p>

          <div className="reading-progress-grid">
            {dashboardData.readingProgress.map(
              (item) => (
                <div
                  className="progress-stat"
                  key={item.label}
                >
                  <strong>
                    {item.value}
                  </strong>

                  <span>
                    {item.label}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* READING NOTE + MONTHLY ACTIVITY */}

        <section className="dashboard-middle-grid">
          <div className="reading-note-card">
            <p className="small-label">
              READING NOTE
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
              THIS MONTH
            </p>

            <h2>
              A steady rhythm
            </h2>

            <p className="monthly-pages">
              842 pages
            </p>

            <div className="monthly-bars">
              {dashboardData.monthlyActivity.map(
                (item) => (
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
                    ></div>

                    <span>
                      {item.month}
                    </span>
                  </div>
                )
              )}
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

              <h2>
                Reading queue
              </h2>
            </div>

            <Link
              to="/wishlist"
              className="text-link"
            >
              View wishlist
            </Link>
          </div>

          <div className="queue-list">
            {dashboardData.readingQueue.map(
              (book) => (
                <div
                  className="queue-row"
                  key={book.id}
                >
                  <span className="queue-number">
                    {book.number}
                  </span>

                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="queue-cover"
                  />

                  <div>
                    <h3>
                      {book.title}
                    </h3>

                    <p>
                      {book.author}
                    </p>
                  </div>
                </div>
              )
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

              <h2>
                Finished, remembered.
              </h2>
            </div>

            <Link
              to="/library"
              className="text-link"
            >
              View library
            </Link>
          </div>

          <div className="recent-books-grid">
            {dashboardData.recentBooks.map(
              (book) => (
                <article
                  className="recent-book-card"
                  key={book.id}
                >
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="recent-book-cover"
                  />

                  <h3>
                    {book.title}
                  </h3>

                  <p>
                    {book.author}
                  </p>

                  <div className="recent-book-meta">
                    <span>
                      Finished {book.finished}
                    </span>

                    <span>
                      ★ {book.rating}
                    </span>
                  </div>
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
              A quieter place to keep every book, thought, and reading
              milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>
              © 2026 Readscape
            </span>

            <span>
              Privacy
            </span>

            <span>
              All reading data saved
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Dashboard;