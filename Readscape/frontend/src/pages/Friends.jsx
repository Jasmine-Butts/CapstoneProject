
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("");
}

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  
const loadFriends = useCallback(async () => {
  try {
    const [friendsData, requestsData, sentData] =
      await Promise.all([
        api("/friends"),
        api("/friends/requests"),
        api("/friends/requests/sent")
      ]);

    setFriends(friendsData.friends || []);
    setRequests(requestsData.requests || []);
    setSentRequests(sentData.requests || []);
    setError("");
  } catch (err) {
    setError(err.message || "Could not load friends.");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const data = await api(
          `/friends/search?q=${encodeURIComponent(query)}`
        );

        if (!cancelled) {
          setResults(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err.message || "Search failed.");
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  async function sendRequest(userId) {
    setSavingId(String(userId));
    setError("");
    setNotice("");

    try {
      await api("/friends/requests", {
        method: "POST",
        body: JSON.stringify({
          recipientId: Number(userId)
        })
      });

      await loadFriends();

      setNotice("Friend request sent successfully.");
    } catch (err) {
      setError(err.message || "Could not send request.");
    } finally {
      setSavingId(null);
    }
  }

  async function respondToRequest(id, action) {
    setSavingId(String(id));
    setError("");
    setNotice("");

    try {
      await api(`/friends/requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ action })
      });

      await loadFriends();

      setNotice(
        action === "accept"
          ? "Friend request accepted."
          : "Friend request declined."
      );
    } catch (err) {
      setError(err.message || "Could not update request.");
    } finally {
      setSavingId(null);
    }
  }


async function cancelRequest(requestId) {
  setSavingId(String(requestId));
  setError("");
  setNotice("");

  try {
    await api(
      `/friends/requests/sent/${encodeURIComponent(requestId)}`,
      { method: "DELETE" }
    );

    await loadFriends();
    setNotice("Friend request cancelled.");
  } catch (err) {
    setError(err.message || "Could not cancel request.");
  } finally {
    setSavingId(null);
  }
}


  async function removeFriend(friend) {
    const confirmed = window.confirm(
      `Remove ${friend.name} from your friends?`
    );

    if (!confirmed) return;

    setSavingId(String(friend.id));
    setError("");
    setNotice("");

    try {
      await api(
        `/friends/${encodeURIComponent(friend.id)}`,
        { method: "DELETE" }
      );

      await loadFriends();
      setNotice("Friend removed.");
    } catch (err) {
      setError(err.message || "Could not remove friend.");
    } finally {
      setSavingId(null);
    }
  }

  const friendIds = new Set(
    friends.map(friend => String(friend.id))
  );

  return (
    <>
      <main className="friends-page">

        <section className="friends-hero">
          <p className="small-label">
            YOUR READING CIRCLE
          </p>

          <h1>Friends.</h1>

          <p className="friends-intro">
            Connect with readers, send friend requests,
            and build your reading circle.
          </p>
        </section>

        {error && (
          <p role="alert" style={{ color: "#a43e3e" }}>
            {error}
          </p>
        )}

        {notice && (
          <p role="status" style={{ color: "#334d40" }}>
            {notice}
          </p>
        )}

        <section className="friends-search-section">
          <div>
            <p className="small-label">
              SEARCH FOR FRIENDS
            </p>
            <h2>Find a reader</h2>
          </div>

          <div className="friends-search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search by name or @username"
              value={searchTerm}
              maxLength={100}
              onChange={event => {
                setSearchTerm(event.target.value);
                setNotice("");
              }}
            />
          </div>
        </section>

        {searchTerm.trim().length >= 2 && (
          <section className="suggested-readers-section">
            <div className="friends-section-heading">
              <h2>Search results</h2>
            </div>

            {searching && <p>Searching readers...</p>}

            {!searching && results.length === 0 && (
              <p>No matching readers found.</p>
            )}

            <div className="suggested-readers-grid">
              {results.map(reader => {

                const pendingRequest = sentRequests.find(
                request => String(request.user_id) === String(reader.id)
              );

                const alreadyFriend = friendIds.has(
                  String(reader.id)
                );

                return (
                  <article
                    className="suggested-reader-card"
                    key={reader.id}
                  >
                    <div className="suggested-reader-avatar">
                      {initials(reader.name)}
                    </div>

                    <h3>{reader.name}</h3>

                    <p className="suggested-username">
                      @{reader.username}
                    </p>

                   
{alreadyFriend ? (
  <p>Already friends</p>
) : pendingRequest ? (
  <button
    type="button"
    className="suggested-follow-button"
    disabled={savingId === String(pendingRequest.id)}
    onClick={() => cancelRequest(pendingRequest.id)}
  >
    {savingId === String(pendingRequest.id)
      ? "Cancelling..."
      : "Pending · Cancel"}
  </button>
) : (
  <button
    type="button"
    className="suggested-follow-button"
    disabled={savingId === String(reader.id)}
    onClick={() => sendRequest(reader.id)}
  >
    {savingId === String(reader.id)
      ? "Sending..."
      : "Add Friend"}
  </button>
)}

                  </article>
                );
              })}
            </div>
          </section>
        )}


{sentRequests.length > 0 && (
  <section className="friend-requests-section">
    <div className="friends-section-heading">
      <div>
        <p className="small-label">
          OUTGOING FRIEND REQUESTS
        </p>
        <h2>Requests you've sent</h2>
      </div>
    </div>

    <div className="friend-request-list">
      {sentRequests.map(request => (
        <article
          className="friend-request-row"
          key={request.id}
        >
          <div className="friend-avatar">
            {initials(request.name)}
          </div>

          <div className="friend-request-info">
            <h3>{request.name}</h3>
            <p>@{request.username}</p>
            <p>Pending acceptance</p>
          </div>

          <button
            type="button"
            className="friend-remove-button"
            disabled={savingId === String(request.id)}
            onClick={() => cancelRequest(request.id)}
          >
            {savingId === String(request.id)
              ? "Cancelling..."
              : "Cancel Request"}
          </button>
        </article>
      ))}
    </div>
  </section>
)}


        {requests.length > 0 && (
          <section className="friend-requests-section">
            <div className="friends-section-heading">
              <div>
                <p className="small-label">
                  FRIEND REQUESTS
                </p>
                <h2>Waiting for you</h2>
              </div>
            </div>

            <div className="friend-request-list">
              {requests.map(request => (
                <article
                  className="friend-request-row"
                  key={request.id}
                >
                  <div className="friend-avatar">
                    {initials(request.name)}
                  </div>

                  <div className="friend-request-info">
                    <h3>{request.name}</h3>
                    <p>@{request.username}</p>
                  </div>

                  <div className="goal-actions">
                    <button
                      type="button"
                      className="friend-accept-button"
                      disabled={
                        savingId === String(request.id)
                      }
                      onClick={() =>
                        respondToRequest(
                          request.id,
                          "accept"
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      className="friend-remove-button"
                      disabled={
                        savingId === String(request.id)
                      }
                      onClick={() =>
                        respondToRequest(
                          request.id,
                          "decline"
                        )
                      }
                    >
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="friends-list-section">
          <div className="friends-section-heading">
            <div>
              <p className="small-label">
                YOUR FRIENDS · {friends.length}
              </p>
              <h2>Your reading circle</h2>
            </div>
          </div>

          {loading ? (
            <p>Loading friends...</p>
          ) : friends.length === 0 ? (
            <div className="friends-empty">
              <h3>No friends yet.</h3>
              <p>
                Search for a reader above and
                send your first friend request.
              </p>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map(friend => (
                <article
                  className="friend-row"
                  key={friend.id}
                >
                  <div className="friend-avatar">
                    {initials(friend.name)}
                  </div>


<div className="friend-main-info">
  <Link
    to={`/friends/${friend.id}`}
    style={{
      textDecoration: "none",
      color: "inherit"
    }}
  >
    <h3>{friend.name}</h3>
    <p>@{friend.username}</p>
  </Link>
</div>


                  
<div className="friend-reading-now">
  <span>CURRENTLY READING</span>

  <strong>
    {friend.current_book || "Not reading a book yet"}
  </strong>

  <p>
    {friend.books_finished_this_year ?? 0}{" "}
    {Number(friend.books_finished_this_year) === 1
      ? "book"
      : "books"}{" "}
    finished this year
  </p>
</div>


                  <button
                    type="button"
                    className="friend-remove-button"
                    disabled={
                      savingId === String(friend.id)
                    }
                    onClick={() =>
                      removeFriend(friend)
                    }
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
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
            <span>Reading data saved to your account</span>
          </div>
        </div>
      </footer>
    </>
  );
}
