import { Link } from "react-router-dom";

import { profileData } from "../data/profileData";

function Profile() {
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
            {profileData.initials}
          </div>

          <div className="profile-header-copy">
            <p className="small-label">
              YOUR PROFILE
            </p>

            <h1>{profileData.name}</h1>

            <p className="profile-username">
              {profileData.username}
            </p>

            <p className="profile-member-info">
              Reader since {profileData.readerSince}
              {" · "}
              {profileData.location}
            </p>

            <p className="profile-bio">
              {profileData.bio}
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
          {profileData.stats.map((stat) => (
            <div
              className="profile-stat"
              key={stat.id}
            >
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* FAVORITE BOOKS */}
        <section className="profile-favorites">
          <div className="profile-section-heading">
            <div>
              <p className="small-label">
                FAVORITE BOOKS
              </p>

              <h2>Books worth keeping close</h2>
            </div>

            <Link
              to="/library"
              className="text-link"
            >
              View library
            </Link>
          </div>

          <div className="profile-books-grid">
            {profileData.favoriteBooks.map(
              (book) => (
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
              )
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
              {profileData.badges.map(
                (badge) => (
                  <div
                    className="profile-badge"
                    key={badge.id}
                  >
                    <div className="badge-marker">
                      ✓
                    </div>

                    <div>
                      <h3>{badge.title}</h3>

                      <p>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                )
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

export default Profile;