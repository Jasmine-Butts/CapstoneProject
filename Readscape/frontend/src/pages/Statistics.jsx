
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSharedBooks } from "../context/BooksContext";

function Statistics() {
  const { books } = useSharedBooks();

  const [chartMode, setChartMode] = useState("books");
  const currentYear = new Date().getFullYear();

  const finishedBooks = useMemo(
    () => books.filter(book => book.status === "finished"),
    [books]
  );

  const readingBooks = useMemo(
    () => books.filter(book => book.status === "reading"),
    [books]
  );

  // Estimate pages for older sample books without currentPage.
  function getPagesRead(book) {
    const pages = Number(book.pages) || 0;

    if (book.status === "finished") {
      return pages;
    }

    if (book.status === "reading") {
      return book.currentPage ??
        Math.round(
          pages * (Number(book.progress) || 0) / 100
        );
    }

    return 0;
  }

  const totalPagesRead = useMemo(
    () => books.reduce(
      (total, book) => total + getPagesRead(book),
      0
    ),
    [books]
  );

  // Summary cards
  const statisticsSummary = [
    {
      id: 1,
      value: finishedBooks.length.toLocaleString(),
      label: "Books finished",
    },
    {
      id: 2,
      value: totalPagesRead.toLocaleString(),
      label: "Pages recorded (est.)",
    },
    {
      id: 3,
      value: readingBooks.length.toLocaleString(),
      label: "Currently reading",
    },
    {
      id: 4,
      value: books.length.toLocaleString(),
      label: "Books in library",
    },
  ];

  // Monthly statistics only use books with a reliable
  // ISO completion timestamp stored in finishedAt.
  const monthlyStatistics = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(
        currentYear,
        index,
        1
      ).toLocaleDateString("en-US", { month: "short" }),
      books: 0,
      pages: 0,
    }));

    finishedBooks.forEach(book => {
      if (
        typeof book.finishedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T/.test(book.finishedAt)
      ) {
        return;
      }

      const date = new Date(book.finishedAt);

      if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== currentYear
      ) {
        return;
      }

      const monthIndex = date.getMonth();

      months[monthIndex].books += 1;
      months[monthIndex].pages +=
        Number(book.pages) || 0;
    });

    return months;
  }, [finishedBooks, currentYear]);

  const maxValue = Math.max(
    1,
    ...monthlyStatistics.map(item =>
      chartMode === "books" ? item.books : item.pages
    )
  );

  const totalDatedFinished = monthlyStatistics.reduce(
    (total, month) => total + month.books,
    0
  );

  const bestMonth = totalDatedFinished > 0
    ? monthlyStatistics.reduce(
        (best, current) =>
          current.books > best.books ? current : best
      )
    : null;

  // Genres of finished books
  const genreStatistics = useMemo(() => {
    const genreCounts = {};

    finishedBooks.forEach(book => {
      const genre = book.genre?.trim() || "Other";

      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    return Object.entries(genreCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: finishedBooks.length
          ? Math.round(count / finishedBooks.length * 100)
          : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [finishedBooks]);

  // Average book length
  const averageLength = finishedBooks.length
    ? Math.round(
        finishedBooks.reduce(
          (total, book) => total + (Number(book.pages) || 0),
          0
        ) / finishedBooks.length
      )
    : 0;

  // Average rating (only books with valid ratings)
  const ratedBooks = finishedBooks.filter(book =>
    book.rating !== null &&
    book.rating !== undefined &&
    book.rating !== "" &&
    Number.isFinite(Number(book.rating)) &&
    Number(book.rating) >= 0 &&
    Number(book.rating) <= 5
  );

  const averageRating = ratedBooks.length
    ? (
        ratedBooks.reduce(
          (total, book) => total + Number(book.rating),
          0
        ) / ratedBooks.length
      ).toFixed(1)
    : null;

  const favoriteGenre = genreStatistics.length
    ? genreStatistics[0].name
    : "Not available";

  const readingInsights = [
    {
      id: 1,
      label: "Average finished book length",
      value: `${averageLength} pages`,
    },
    {
      id: 2,
      label: "Average rating you give",
      value: averageRating
        ? `${averageRating} / 5`
        : "No ratings yet",
    },
    {
      id: 3,
      label: "Most read genre",
      value: favoriteGenre,
    },
  ];

  return (
    <>
      <main className="statistics-page">
        <Link
          to="/dashboard"
          className="statistics-back-link"
        >
          ← Back to overview
        </Link>

        {/* HERO */}
        <section className="statistics-hero">
          <p className="small-label">
            YOUR READING IN NUMBERS
          </p>

          <h1>Statistics.</h1>

          <p className="statistics-intro">
            Your reading journey — books, pages,
            and the kinds of stories you keep
            returning to.
          </p>
        </section>

        {/* SUMMARY */}
        <section className="statistics-summary-grid">
          {statisticsSummary.map(item => (
            <div
              className="statistics-summary-item"
              key={item.id}
            >
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        {/* MONTHLY CHART */}
        <section className="statistics-chart-section">
          <div className="statistics-section-heading">
            <div>
              <p className="small-label">
                MONTH BY MONTH · {currentYear}
              </p>

              <h2>
                {chartMode === "books"
                  ? "Books finished each month"
                  : "Pages in books finished each month"}
              </h2>
            </div>

            <div className="statistics-toggle">
              <button
                type="button"
                className={
                  chartMode === "books" ? "active" : ""
                }
                onClick={() => setChartMode("books")}
              >
                Books
              </button>

              <button
                type="button"
                className={
                  chartMode === "pages" ? "active" : ""
                }
                onClick={() => setChartMode("pages")}
              >
                Pages
              </button>
            </div>
          </div>

          <div className="statistics-chart">
            {monthlyStatistics.map(item => {
              const value = chartMode === "books"
                ? item.books
                : item.pages;

              const height = value / maxValue * 180;

              return (
                <div
                  className="statistics-chart-column"
                  key={item.month}
                >
                  <span className="statistics-chart-value">
                    {value.toLocaleString()}
                  </span>

                  <div
                    className="statistics-chart-bar"
                    style={{
                      height: `${height}px`,
                    }}
                  />

                  <span className="statistics-chart-month">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="statistics-best-month">
            {bestMonth ? (
              <>
                Your best recorded month was{" "}
                <strong>{bestMonth.month}</strong>,
                with{" "}
                <strong>
                  {bestMonth.books} books
                </strong>{" "}
                finished.
              </>
            ) : (
              "No dated book completions recorded for this year yet."
            )}
          </p>

          <p className="statistics-best-month">
            This chart uses books with recorded completion
            dates. The Pages view counts pages in books
            finished that month, not pages read during
            individual sessions.
          </p>
        </section>

        {/* GENRES AND INSIGHTS */}
        <section className="statistics-reading-grid">
          <div className="statistics-genres">
            <p className="small-label">
              WHAT YOU READ
            </p>

            <h2>Genres</h2>

            <div className="statistics-genre-list">
              {genreStatistics.length > 0 ? (
                genreStatistics.map(genre => (
                  <div
                    className="statistics-genre-item"
                    key={genre.name}
                  >
                    <div className="statistics-genre-row">
                      <span>{genre.name}</span>
                      <strong>
                        {genre.percentage}%
                      </strong>
                    </div>

                    <div className="statistics-genre-track">
                      <div
                        className="statistics-genre-fill"
                        style={{
                          width: `${genre.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  Finish a book to see your genre
                  statistics.
                </p>
              )}
            </div>
          </div>

          <div className="statistics-insights">
            {readingInsights.map(item => (
              <div
                className="statistics-insight"
                key={item.id}
              >
                <p>{item.label}</p>
                <h3>{item.value}</h3>
              </div>
            ))}
          </div>
        </section>
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
            <Link to="/library">Library</Link>
            <span>Reading data saved locally</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Statistics;
