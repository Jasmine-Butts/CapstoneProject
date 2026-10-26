
import { Link } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";
import { useSharedBooks } from "../context/BooksContext";

function Profile() {
  const { profile, initials } = useSharedProfile();
  const { books } = useSharedBooks();

  const finishedBooks = books.filter(
    (book) => book.status === "finished"
  );

  const readingBooks = books.filter(
    (book) => book.status === "reading"
  );

  const wishlistBooks = books.filter(
    (book) => book.status === "want"
  );

  const stats = [
    {
      id: 1,
      value: finishedBooks.length,
      label: "Books finished",
    },
    {
      id: 2,
      value: books.length,
      label: "Books in library",
    },
    {
      id: 3,
      value: readingBooks.length,
      label: "Currently reading",
    },
    {
      id: 4,
      value: wishlistBooks.length,
      label: "Want to read",
    },
  ];

  const recentBooks = finishedBooks.slice(0, 3);

  const badges = [
    {
      id: 1,
      title: "First Chapter",
      description: "Added your first book",
      earned: books.length >= 1,
    },
    {
      id: 2,
      title: "First Finish",
      description: "Finished your first book",
      earned: finishedBooks.length >= 1,
    },
    {
      id: 3,
      title: "Page Turner",
      description: "Finished 5 books",
      earned: finishedBooks.length >= 5,
    },
    {
      id: 4,
      title: "Book Collector",
      description: "Added 10 books to your library",
      earned: books.length >= 10,
    },
  ];

  const earnedBadges = badges.filter(
    (badge) => badge.earned
  );

  return (
    <>
      <main className="profile-page">
        <Link
          to="/dashboard"
          className="profile-back-link"
        >
          ← Back to overview
        </Link>

        {/* PROFILE HEADER */}
        <section className="profile-header">
          <div className="profile-avatar-large">
            {initials}
          </div>

          <div className="profile-header-copy">
            <p className="small-label">
              YOUR PROFILE
            </p>

            <h1>{profile.name}</h1>

            <p className="profile-username">
              {profile.username}
            </p>

            <p className="profile-member-info">
              Reader since {profile.readerSince}
              {profile.location
                ? ` · ${profile.location}`
                : ""}
            </p>

            <p className="profile-bio">
              {profile.bio ||
                "Your reading story starts here."}
            </p>
          </div>

          <Link
            to="/profile/edit"
            className="profile-edit-button"
          >
            Edit profile
          </Link>
        </section>

        {/* STATS */}
        <section className="profile-stats">
          {stats.map((stat) => (
            <div
              className="profile-stat"
              key={stat.id}
            >
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* FINISHED BOOKS */}
        <section className="profile-favorites">
          <div className="profile-section-heading">
            <div>
              <p className="small-label">
                RECENTLY FINISHED
              </p>

              <h2>Books worth remembering</h2>
            </div>

            <Link
              to="/library"
              className="text-link"
            >
              View library
            </Link>
          </div>

          <div className="profile-books-grid">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <article
                  className="profile-book-card"
                  key={book.id}
                >
                  <Link to={`/books/${book.id}`}>
                    <img
                      src={book.cover}
                      alt={`${book.title} cover`}
                    />
                  </Link>

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </article>
              ))
            ) : (
              <p>
                Books you finish will appear here.
              </p>
            )}
          </div>
        </section>

        {/* BADGES + COMMUNITY */}
        <section className="profile-bottom-grid">
          <div className="profile-badges">
            <p className="small-label">
              READING BADGES
            </p>

            <h2>Milestones</h2>

            <div className="profile-badge-list">
              {earnedBadges.length > 0 ? (
                earnedBadges.map((badge) => (
                  <div
                    className="profile-badge"
                    key={badge.id}
                  >
                    <div className="badge-marker">
                      ✓
                    </div>

                    <div>
                      <h3>{badge.title}</h3>
                      <p>{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  Add your first book to earn a badge.
                </p>
              )}
            </div>
          </div>

          <aside className="profile-community">
            <p className="small-label">
              YOUR COMMUNITY
            </p>

            <h2>Reading together</h2>

            <Link
              to="/friends"
              className="profile-community-link"
            >
              <div>
                <strong>Friends</strong>
                <span>
                  See what your reading circle
                  is reading.
                </span>
              </div>
              <span>→</span>
            </Link>

            <Link
              to="/clubs"
              className="profile-community-link"
            >
              <div>
                <strong>Clubs</strong>
                <span>
                  Continue reading with your
                  groups.
                </span>
              </div>
              <span>→</span>
            </Link>
          </aside>
        </section>
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

export default Profile;
