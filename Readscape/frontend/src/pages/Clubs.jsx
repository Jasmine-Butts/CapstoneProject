import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  initialClubs,
  suggestedClubs,
  searchClubs,
  getClubStats,
  joinClub,
  leaveClub,
} from "../data/clubsData";

function Clubs() {
  const [clubs, setClubs] =
    useState(initialClubs);

  const [searchTerm, setSearchTerm] =
    useState("");

  const filteredClubs = useMemo(() => {
    return searchClubs(
      clubs,
      searchTerm
    );
  }, [clubs, searchTerm]);

  const joinedClubs =
    filteredClubs.filter(
      (club) => club.joined
    );

  const stats =
    getClubStats(clubs);

  function handleJoinClub(clubId) {
    setClubs((previousClubs) =>
      joinClub(
        previousClubs,
        clubId
      )
    );
  }

  function handleLeaveClub(clubId) {
    setClubs((previousClubs) =>
      leaveClub(
        previousClubs,
        clubId
      )
    );
  }

  return (
    <>
      <main className="clubs-page">
        <Link
          to="/dashboard"
          className="clubs-back-link"
        >
          ← Back to overview
        </Link>

        {/* HERO */}

        <section className="clubs-hero">
          <div>
            <p className="small-label">
              READING TOGETHER
            </p>

            <h1>
              Clubs.
            </h1>

            <p className="clubs-intro">
              Join reading circles, discover what
              others are reading, and keep track of
              the conversations waiting for you.
            </p>
          </div>

          <button
            type="button"
            className="clubs-create-button"
          >
            + Create a club
          </button>
        </section>

        {/* STATS */}

        <section className="clubs-stats">
          <div>
            <strong>
              {stats.joined}
            </strong>

            <span>
              Your clubs
            </span>
          </div>

          <div>
            <strong>
              {stats.readersNearby}
            </strong>

            <span>
              Readers nearby
            </span>
          </div>

          <div>
            <strong>
              {stats.discover}
            </strong>

            <span>
              Clubs to discover
            </span>
          </div>
        </section>

        {/* SEARCH */}

        <section className="clubs-search-section">
          <div>
            <p className="small-label">
              FIND A CLUB
            </p>

            <h2>
              Read with others
            </h2>
          </div>

          <div className="clubs-search-box">
            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search clubs or books"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>
        </section>

        {/* YOUR CLUBS */}

        <section className="your-clubs-section">
          <div className="clubs-section-heading">
            <div>
              <p className="small-label">
                YOUR CLUBS
              </p>

              <h2>
                Where you're reading
              </h2>
            </div>
          </div>

          {joinedClubs.length > 0 ? (
            <div className="clubs-list">
              {joinedClubs.map((club) => (
                <article
                  className="club-row"
                  key={club.id}
                >
                  <div className="club-number">
                    {String(
                      club.id
                    ).padStart(2, "0")}
                  </div>

                  <div className="club-main-info">
                    <h3>
                      {club.name}
                    </h3>

                    <p>
                      {club.description}
                    </p>

                    <span>
                      {club.members} members
                    </span>
                  </div>

                  <div className="club-current-book">
                    <span>
                      CURRENT BOOK
                    </span>

                    <strong>
                      {club.currentBook}
                    </strong>
                  </div>

                  <div className="club-meeting">
                    <span>
                      NEXT MEETING
                    </span>

                    <strong>
                      {club.nextMeeting}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="club-leave-button"
                    onClick={() =>
                      handleLeaveClub(
                        club.id
                      )
                    }
                  >
                    Leave
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="clubs-empty">
              <h3>
                No joined clubs found.
              </h3>

              <p>
                Try clearing your search or join
                another reading circle.
              </p>
            </div>
          )}
        </section>

        {/* DISCOVER */}

        <section className="discover-clubs-section">
          <div className="clubs-section-heading">
            <div>
              <p className="small-label">
                DISCOVER
              </p>

              <h2>
                Clubs you may like
              </h2>
            </div>
          </div>

          <div className="discover-clubs-grid">
            {suggestedClubs.map(
              (club) => (
                <article
                  className="discover-club-card"
                  key={club.id}
                >
                  <p className="club-category">
                    {club.category}
                  </p>

                  <h3>
                    {club.name}
                  </h3>

                  <p className="discover-description">
                    {club.description}
                  </p>

                  <p className="discover-members">
                    {club.members} members
                  </p>

                  <button
                    type="button"
                    className="club-join-button"
                  >
                    Join club →
                  </button>
                </article>
              )
            )}
          </div>
        </section>

        {/* ALL CLUBS */}

        <section className="all-clubs-section">
          <div className="clubs-section-heading">
            <div>
              <p className="small-label">
                ALL CLUBS
              </p>

              <h2>
                Browse reading circles
              </h2>
            </div>
          </div>

          <div className="all-clubs-list">
            {filteredClubs.map(
              (club) => (
                <article
                  className="all-club-row"
                  key={club.id}
                >
                  <div>
                    <h3>
                      {club.name}
                    </h3>

                    <p>
                      {club.members} members ·
                      Reading{" "}
                      {club.currentBook}
                    </p>
                  </div>

                  {club.joined ? (
                    <span className="club-joined-label">
                      Joined
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="club-join-button"
                      onClick={() =>
                        handleJoinClub(
                          club.id
                        )
                      }
                    >
                      Join club →
                    </button>
                  )}
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
              A quieter place to keep every book,
              thought, and reading milestone.
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

export default Clubs;