import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  initialFriendRequests,
  initialFriends,
  suggestedReaders,
  searchFriends,
  acceptFriendRequest,
  removeFriend,
} from "../data/friendsData";

function Friends() {
  const [friends, setFriends] =
    useState(initialFriends);

  const [
    friendRequests,
    setFriendRequests,
  ] = useState(
    initialFriendRequests
  );

  const [searchTerm, setSearchTerm] =
    useState("");

  const filteredFriends = useMemo(() => {
    return searchFriends(
      friends,
      searchTerm
    );
  }, [friends, searchTerm]);

  function handleAcceptRequest(request) {
    const {
      updatedFriends,
      updatedRequests,
    } = acceptFriendRequest(
      friends,
      friendRequests,
      request
    );

    setFriends(updatedFriends);

    setFriendRequests(
      updatedRequests
    );
  }

  function handleRemoveFriend(friendId) {
    setFriends((previousFriends) =>
      removeFriend(
        previousFriends,
        friendId
      )
    );
  }

  return (
    <>
      <main className="friends-page">
        <Link
          to="/dashboard"
          className="friends-back-link"
        >
          ← Back to overview
        </Link>

        {/* HERO */}

        <section className="friends-hero">
          <p className="small-label">
            YOUR READING CIRCLE
          </p>

          <h1>
            Friends.
          </h1>

          <p className="friends-intro">
            See what the people you follow are
            reading right now, and find new
            readers by name or username.
          </p>
        </section>

        {/* SEARCH */}

        <section className="friends-search-section">
          <div>
            <p className="small-label">
              SEARCH FOR FRIENDS
            </p>

            <h2>
              Find a reader
            </h2>
          </div>

          <div className="friends-search-box">
            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name or @username"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>
        </section>

        {/* FRIEND REQUESTS */}

        {friendRequests.length > 0 && (
          <section className="friend-requests-section">
            <div className="friends-section-heading">
              <div>
                <p className="small-label">
                  FRIEND REQUESTS
                </p>

                <h2>
                  Waiting for you
                </h2>
              </div>
            </div>

            <div className="friend-request-list">
              {friendRequests.map(
                (request) => (
                  <article
                    className="friend-request-row"
                    key={request.id}
                  >
                    <div className="friend-avatar">
                      {request.initials}
                    </div>

                    <div className="friend-request-info">
                      <h3>
                        {request.name}
                      </h3>

                      <p>
                        {request.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="friend-accept-button"
                      onClick={() =>
                        handleAcceptRequest(
                          request
                        )
                      }
                    >
                      Accept
                    </button>
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {/* FRIENDS LIST */}

        <section className="friends-list-section">
          <div className="friends-section-heading">
            <div>
              <p className="small-label">
                YOUR FRIENDS ·{" "}
                {friends.length}
              </p>

              <h2>
                Your reading circle
              </h2>
            </div>
          </div>

          <div className="friends-list">
            {filteredFriends.map(
              (friend) => (
                <article
                  className="friend-row"
                  key={friend.id}
                >
                  <div className="friend-avatar">
                    {friend.initials}
                  </div>

                  <div className="friend-main-info">
                    <h3>
                      {friend.name}
                    </h3>

                    <p>
                      {friend.username}
                    </p>
                  </div>

                  <div className="friend-reading-now">
                    <span>
                      READING NOW
                    </span>

                    <strong>
                      {friend.currentBook}
                    </strong>
                  </div>

                  <div className="friend-year-stat">
                    <strong>
                      {friend.booksThisYear}
                    </strong>

                    <span>
                      books this year
                    </span>
                  </div>

                  <button
                    type="button"
                    className="friend-remove-button"
                    onClick={() =>
                      handleRemoveFriend(
                        friend.id
                      )
                    }
                  >
                    Remove
                  </button>
                </article>
              )
            )}
          </div>

          {filteredFriends.length === 0 && (
            <div className="friends-empty">
              <h3>
                No readers found.
              </h3>

              <p>
                Try searching by a different
                name or username.
              </p>
            </div>
          )}
        </section>

        {/* SUGGESTED READERS */}

        <section className="suggested-readers-section">
          <div className="friends-section-heading">
            <div>
              <p className="small-label">
                DISCOVER
              </p>

              <h2>
                Readers you may like
              </h2>
            </div>
          </div>

          <div className="suggested-readers-grid">
            {suggestedReaders.map(
              (reader) => (
                <article
                  className="suggested-reader-card"
                  key={reader.id}
                >
                  <div className="suggested-reader-avatar">
                    {reader.initials}
                  </div>

                  <h3>
                    {reader.name}
                  </h3>

                  <p className="suggested-username">
                    {reader.username}
                  </p>

                  <p className="suggested-genre">
                    Reads{" "}
                    {reader.favoriteGenre}
                  </p>

                  <button
                    type="button"
                    className="suggested-follow-button"
                  >
                    Follow
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

export default Friends;