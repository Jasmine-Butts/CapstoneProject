import { useState } from "react";
import { Link } from "react-router-dom";

import {
  statisticsSummary,
  monthlyStatistics,
  genreStatistics,
  readingInsights,
  getBestMonth,
} from "../data/statisticsData";

function Statistics() {
  const [chartMode, setChartMode] = useState("books");

  const bestMonth = getBestMonth(monthlyStatistics);

  const maxValue = Math.max(
    ...monthlyStatistics.map((item) =>
      chartMode === "books" ? item.books : item.pages
    )
  );

  return (
    <>
      <main className="statistics-page">
        <Link to="/dashboard" className="statistics-back-link">
          ← Back to overview
        </Link>

        {/* Hero */}
        <section className="statistics-hero">
          <p className="small-label">YOUR YEAR SO FAR</p>

          <h1>Statistics.</h1>

          <p className="statistics-intro">
            How 2026 has gone, in numbers — books, pages, time and the kinds of
            stories you keep returning to.
          </p>
        </section>

        {/* Summary */}
        <section className="statistics-summary-grid">
          {statisticsSummary.map((item) => (
            <div className="statistics-summary-item" key={item.id}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        {/* Monthly Chart */}
        <section className="statistics-chart-section">
          <div className="statistics-section-heading">
            <div>
              <p className="small-label">MONTH BY MONTH</p>
              <h2>
                {chartMode === "books"
                  ? "Books finished each month"
                  : "Pages read each month"}
              </h2>
            </div>

            <div className="statistics-toggle">
              <button
                type="button"
                className={chartMode === "books" ? "active" : ""}
                onClick={() => setChartMode("books")}
              >
                Books
              </button>

              <button
                type="button"
                className={chartMode === "pages" ? "active" : ""}
                onClick={() => setChartMode("pages")}
              >
                Pages
              </button>
            </div>
          </div>

          <div className="statistics-chart">
            {monthlyStatistics.map((item) => {
              const value =
                chartMode === "books" ? item.books : item.pages;

              const height = (value / maxValue) * 180;

              return (
                <div className="statistics-chart-column" key={item.month}>
                  <span className="statistics-chart-value">
                    {value.toLocaleString()}
                  </span>

                  <div
                    className="statistics-chart-bar"
                    style={{ height: `${height}px` }}
                  ></div>

                  <span className="statistics-chart-month">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="statistics-best-month">
            Your best month was <strong>{bestMonth.month}</strong>, with{" "}
            <strong>{bestMonth.books} books</strong> finished.
          </p>
        </section>

        {/* Reading Mix */}
        <section className="statistics-reading-grid">
          <div className="statistics-genres">
            <p className="small-label">WHAT YOU READ</p>

            <h2>Genres</h2>

            <div className="statistics-genre-list">
              {genreStatistics.map((genre) => (
                <div className="statistics-genre-item" key={genre.name}>
                  <div className="statistics-genre-row">
                    <span>{genre.name}</span>
                    <strong>{genre.percentage}%</strong>
                  </div>

                  <div className="statistics-genre-track">
                    <div
                      className="statistics-genre-fill"
                      style={{ width: `${genre.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="statistics-insights">
            {readingInsights.map((item) => (
              <div className="statistics-insight" key={item.id}>
                <p>{item.label}</p>
                <h3>{item.value}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>Readscape</h3>
            <p>
              A quieter place to keep every book, thought, and reading
              milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>© 2026 Readscape</span>
            <Link to="/library">Library</Link>
            <span>All reading data saved</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Statistics;