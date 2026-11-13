import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managingClubId, setManagingClubId] = useState(null);
  const [clubRequests, setClubRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

const [newClub, setNewClub] = useState({
  name: "",
  description: "",
  category: "General",
  currentBook: "",
  nextMeeting: "",
  visibility: "public"
});

  // Load real clubs from Neon PostgreSQL
  useEffect(() => {
    let cancelled = false;

    async function loadClubs() {
      try {
        const data = await api("/clubs");

        if (!cancelled) {
          const formattedClubs = (data.clubs || []).map(club => ({
            ...club,
            currentBook: club.current_book || "Not selected",
            nextMeeting: club.next_meeting
              ? new Date(club.next_meeting).toLocaleString()
              : "Not scheduled"
          }));

          setClubs(formattedClubs);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load clubs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      cancelled = true;
    };
  }, []);

  // Search by club name, description, category or current book
  const filteredClubs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return clubs;

    return clubs.filter(club =>
      [
        club.name,
        club.description,
        club.category,
        club.currentBook
      ].some(value =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [clubs, searchTerm]);

  const joinedClubs = filteredClubs.filter(
    club => club.joined
  );

  // Suggestions come from real clubs
  const suggestedClubs = filteredClubs
    .filter(club => !club.joined)
    .slice(0, 3);

  const stats = {
    joined: clubs.filter(club => club.joined).length,
    readersNearby: clubs.reduce(
      (total, club) => total + Number(club.members || 0),
      0
    ),
    discover: clubs.filter(club => !club.joined).length
  };

  
async function handleCreateClub(event) {
  event.preventDefault();
  setError("");
  setCreating(true);

  try {
    const data = await api("/clubs", {
      method: "POST",
      body: JSON.stringify({
        ...newClub,
        nextMeeting: newClub.nextMeeting
          ? new Date(newClub.nextMeeting).toISOString()
          : null
      })
    });

    const club = data.club;

    setClubs(previousClubs => [
      {
        ...club,
        currentBook: club.current_book || "Not selected",
        nextMeeting: club.next_meeting
          ? new Date(club.next_meeting).toLocaleString()
          : "Not scheduled",
        visibility: club.visibility || newClub.visibility,
        request_pending: false
      },
      ...previousClubs
    ]);

    setNewClub({
      name: "",
      description: "",
      category: "General",
      currentBook: "",
      nextMeeting: "",
      visibility: "public"
    });

    setShowCreateForm(false);
  } catch (err) {
    setError(err.message || "Could not create club.");
  } finally {
    setCreating(false);
  }
}


async function handleManageRequests(clubId) {
  // Clicking the same club again closes the panel
  if (String(managingClubId) === String(clubId)) {
    setManagingClubId(null);
    setClubRequests([]);
    return;
  }

  setManagingClubId(clubId);
  setClubRequests([]);
  setLoadingRequests(true);
  setError("");

  try {
    const data = await api(`/clubs/${clubId}/requests`);
    setClubRequests(data.requests || []);
  } catch (err) {
    setError(err.message || "Could not load membership requests.");
    setManagingClubId(null);
  } finally {
    setLoadingRequests(false);
  }
}


async function handleReviewRequest(requestId, action) {
  if (managingClubId === null) return;

  setReviewingRequestId(String(requestId));
  setError("");

  try {
    const data = await api(
      `/clubs/${managingClubId}/requests/${requestId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ action })
      }
    );

    // Remove the reviewed request from the pending list
    setClubRequests(previousRequests =>
      previousRequests.filter(
        request => String(request.id) !== String(requestId)
      )
    );

    // Update the club's member count after approval
    if (data.status === "approved") {
      setClubs(previousClubs =>
        previousClubs.map(club =>
          String(club.id) === String(managingClubId)
            ? {
                ...club,
                members: Number(club.members) + 1
              }
            : club
        )
      );
    }
  } catch (err) {
    setError(err.message || "Could not review membership request.");
  } finally {
    setReviewingRequestId(null);
  }
}


async function handleJoinClub(clubId) {
  setError("");

  try {
    const data = await api(`/clubs/${clubId}/join`, {
      method: "POST"
    });

    setClubs(previousClubs =>
      previousClubs.map(club => {
        if (String(club.id) !== String(clubId)) {
          return club;
        }

        // Private club: request submitted, not a member yet
        if (data.requested) {
          return {
            ...club,
            request_pending: true,
            joined: false
          };
        }

        // Public club: joined immediately
        if (data.joined) {
          return {
            ...club,
            joined: true,
            my_role: "member",
            request_pending: false,
            members: Number(club.members) + 1
          };
        }

        return club;
      })
    );
  } catch (err) {
    setError(err.message || "Could not join club.");
  }
}



  
async function handleLeaveClub(clubId) {
  const club = clubs.find(
    item => String(item.id) === String(clubId)
  );

  if (!club || club.my_role === "owner") {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to leave "${club.name}"?`
  );

  if (!confirmed) return;

  setError("");

  try {
    await api(`/clubs/${encodeURIComponent(clubId)}/leave`, {
      method: "DELETE"
    });

    setClubs(previousClubs =>
      previousClubs.map(item =>
        String(item.id) === String(clubId)
          ? {
              ...item,
              joined: false,
              my_role: null,
              members: Math.max(0, Number(item.members) - 1)
            }
          : item
      )
    );
  } catch (err) {
    setError(err.message || "Could not leave club.");
  }
}


  return (
    <>
      <main className="clubs-page">

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
          onClick={() => setShowCreateForm(value => !value)}
          >
          {showCreateForm ? "Cancel" : "+ Create a club"}
          </button>
        </section>


{showCreateForm && (
  <section
    className="clubs-create-section"
    style={{
      padding: "28px",
      border: "1px solid #e6e6e2",
      borderRadius: "14px",
      marginBottom: "32px"
    }}
  >
    <p className="small-label">START A READING CIRCLE</p>
    <h2>Create a club</h2>

    <form
      onSubmit={handleCreateClub}
      style={{
        display: "grid",
        gap: "18px",
        marginTop: "24px"
      }}
    >
      <label>
        <strong>Club name *</strong>
        <input
          type="text"
          required
          maxLength={100}
          value={newClub.name}
          onChange={event =>
            setNewClub(prev => ({
              ...prev,
              name: event.target.value
            }))
          }
          placeholder="e.g. Weekend Book Lovers"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginTop: "8px"
          }}
        />
      </label>

      <label>
        <strong>Description</strong>
        <textarea
          value={newClub.description}
          maxLength={2000}
          onChange={event =>
            setNewClub(prev => ({
              ...prev,
              description: event.target.value
            }))
          }
          placeholder="What is your club about?"
          rows={3}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginTop: "8px"
          }}
        />
      </label>

      <label>
        <strong>Category *</strong>
        <select
          value={newClub.category}
          onChange={event =>
            setNewClub(prev => ({
              ...prev,
              category: event.target.value
            }))
          }
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginTop: "8px"
          }}
        >
          <option value="General">General</option>
          <option value="Fiction">Fiction</option>
          <option value="Mystery & Thriller">Mystery & Thriller</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Romance">Romance</option>
          <option value="Nonfiction">Nonfiction</option>
          <option value="Personal Development">
            Personal Development
          </option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label>
        <strong>Current book (optional)</strong>
        <input
          type="text"
          maxLength={300}
          value={newClub.currentBook}
          onChange={event =>
            setNewClub(prev => ({
              ...prev,
              currentBook: event.target.value
            }))
          }
          placeholder="Which book will you read together?"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginTop: "8px"
          }}
        />
      </label>

      <label>
        <strong>Next meeting (optional)</strong>
        <input
          type="datetime-local"
          value={newClub.nextMeeting}
          onChange={event =>
            setNewClub(prev => ({
              ...prev,
              nextMeeting: event.target.value
            }))
          }
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginTop: "8px"
          }}
        />
      </label>

      <fieldset
        style={{
          border: "1px solid #e6e6e2",
          borderRadius: "10px",
          padding: "16px"
        }}
      >
        <legend><strong>Club privacy</strong></legend>

        <label style={{ display: "block", marginBottom: "12px" }}>
          <input
            type="radio"
            name="club-visibility"
            value="public"
            checked={newClub.visibility === "public"}
            onChange={() =>
              setNewClub(prev => ({
                ...prev,
                visibility: "public"
              }))
            }
          />
          {" "}Public — anyone can join
        </label>

        <label style={{ display: "block" }}>
          <input
            type="radio"
            name="club-visibility"
            value="private"
            checked={newClub.visibility === "private"}
            onChange={() =>
              setNewClub(prev => ({
                ...prev,
                visibility: "private"
              }))
            }
          />
          {" "}Private — owner approval required
        </label>
      </fieldset>

      <button
        type="submit"
        className="clubs-create-button"
        disabled={creating}
      >
        {creating ? "Creating..." : "Create Club"}
      </button>
    </form>
  </section>
)}


        {loading && <p>Loading reading clubs...</p>}

{error && (
  <p role="alert" style={{ color: "#a43e3e" }}>
    {error}
  </p>
)}

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
              Club memberships
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
                    <Link
  to={`/clubs/${club.id}`}
  style={{ textDecoration: "none", color: "inherit" }}
>
  <h3>{club.name}</h3>
</Link>

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


{club.my_role === "owner" && (
  <button
    type="button"
    className="club-join-button"
    onClick={() => handleManageRequests(club.id)}
  >
    {String(managingClubId) === String(club.id)
      ? "Close Requests"
      : "Manage Requests"}
  </button>
)}


                 
{club.my_role === "member" && (
  <button
    type="button"
    className="club-leave-button"
    onClick={() => handleLeaveClub(club.id)}
  >
    Leave
  </button>
)}

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


{managingClubId !== null && (
  <section
    style={{
      border: "1px solid #e6e6e2",
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "32px"
    }}
  >
    <p className="small-label">CLUB MANAGEMENT</p>
    <h2>Membership Requests</h2>

    <p>
      {clubs.find(
        club => String(club.id) === String(managingClubId)
      )?.name}
    </p>

    {loadingRequests ? (
      <p>Loading requests...</p>
    ) : clubRequests.length === 0 ? (
      <p>No pending membership requests.</p>
    ) : (
      <div className="clubs-list">
        {clubRequests.map(request => (
          <article
            key={request.id}
            className="club-row"
          >
            <div className="club-main-info">
              <h3>{request.name}</h3>
              <p>@{request.username}</p>
              <span>Waiting for approval</span>
            </div>

            
<div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  }}
>
  <button
    type="button"
    className="club-join-button"
    disabled={reviewingRequestId !== null}
    onClick={() =>
      handleReviewRequest(request.id, "approve")
    }
  >
    {reviewingRequestId === String(request.id)
      ? "Processing..."
      : "Approve"}


<button
  type="button"
  className="club-leave-button"
  disabled={reviewingRequestId !== null}
  onClick={() =>
    handleReviewRequest(request.id, "decline")
  }
>
  Decline
</button>

  </button>

</div>

          </article>
        ))}
      </div>
    )}
  </section>
)}


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

              
{club.request_pending ? (
  <span className="club-joined-label">
    Pending Approval
  </span>
) : (
  <button
    type="button"
    className="club-join-button"
    onClick={() => handleJoinClub(club.id)}
  >
    {club.visibility === "private"
      ? "Request to Join →"
      : "Join club →"}
  </button>
)}

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
                    <Link
  to={`/clubs/${club.id}`}
  style={{ textDecoration: "none", color: "inherit" }}
>
  <h3>{club.name}</h3>
</Link>

                    <p>
                      {club.members} members ·
                      Reading{" "}
                      {club.currentBook}
                    </p>
                  </div>

                  
{club.joined ? (
  <span className="club-joined-label">
    {club.my_role === "owner" ? "Owner" : "Joined"}
  </span>
) : club.request_pending ? (
  <span className="club-joined-label">
    Pending Approval
  </span>
) : (
  <button
    type="button"
    className="club-join-button"
    onClick={() => handleJoinClub(club.id)}
  >
    {club.visibility === "private"
      ? "Request to Join →"
      : "Join club →"}
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