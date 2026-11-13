import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersVisible, setMembersVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
const [saving, setSaving] = useState(false);

const [editClub, setEditClub] = useState({
  name: "",
  description: "",
  category: "",
  currentBook: "",
  nextMeeting: "",
  visibility: "public"
});

  useEffect(() => {
    let cancelled = false;

    async function loadClub() {
      setLoading(true);
      setClub(null);
      setMembers([]);
      setError("");

      try {
        const data = await api(
          `/clubs/${encodeURIComponent(id)}`
        );

        if (!cancelled) {
          setClub(data.club);
          setMembers(data.members || []);
          setMembersVisible(data.members_visible);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load club.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClub();

    return () => {
      cancelled = true;
    };
  }, [id]);


function openEditForm() {
  if (!club || club.my_role !== "owner") return;

  setEditClub({
    name: club.name,
    description: club.description || "",
    category: club.category || "General",
    currentBook: club.current_book || "",
    nextMeeting: club.next_meeting
      ? new Date(club.next_meeting).toLocaleString("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }).replace(" ", "T")
      : "",
    visibility: club.visibility || "public"
  });

  setError("");
  setNotice("");
  setShowEditForm(true);
}

async function handleSaveClub(event) {
  event.preventDefault();
  if (club?.my_role !== "owner" || saving) return;

  setSaving(true);
  setError("");
  setNotice("");

  try {
    const data = await api(
      `/clubs/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...editClub,
          nextMeeting: editClub.nextMeeting
            ? new Date(editClub.nextMeeting).toISOString()
            : null
        })
      }
    );

    setClub(previous => ({
      ...previous,
      ...data.club
    }));

    setShowEditForm(false);
    setNotice("Club updated successfully!");
  } catch (err) {
    setError(err.message || "Could not update club.");
  } finally {
    setSaving(false);
  }
}


async function handleDeleteClub() {
  if (!club || club.my_role !== "owner" || submitting) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${club.name}"?\n\n` +
    "All club memberships and pending requests will be deleted. " +
    "This action cannot be undone."
  );

  if (!confirmed) return;

  setSubmitting(true);
  setError("");
  setNotice("");

  try {
    await api(`/clubs/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    navigate("/clubs", { replace: true });
  } catch (err) {
    setError(err.message || "Could not delete club.");
  } finally {
    setSubmitting(false);
  }
}



  async function joinOrRequest() {
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const result = await api(
        `/clubs/${encodeURIComponent(id)}/join`,
        { method: "POST" }
      );

      if (result.requested) {
        setClub(previous => ({
          ...previous,
          request_pending: true
        }));
        setNotice("Your membership request was sent.");
      } else if (result.joined) {
        const updated = await api(
          `/clubs/${encodeURIComponent(id)}`
        );

        setClub(updated.club);
        setMembers(updated.members || []);
        setMembersVisible(updated.members_visible);
        setNotice("You joined the club!");
      }
    } catch (err) {
      setError(err.message || "Could not join club.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="clubs-page">
        <p>Loading club details...</p>
      </main>
    );
  }

  return (
    <main className="clubs-page">
      <Link to="/clubs" className="clubs-back-link">
        ← Back to clubs
      </Link>

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

      {!club ? (
        <section className="clubs-empty">
          <h2>Club not found</h2>
          <p>We couldn't load this reading club.</p>
        </section>
      ) : (
        <>
          <section className="clubs-hero">
            <div>
              <p className="small-label">
                {club.visibility === "private"
                  ? "PRIVATE READING CLUB"
                  : "PUBLIC READING CLUB"}
              </p>

              <h1>{club.name}</h1>

              <p className="clubs-intro">
                {club.description || "A Readscape reading circle."}
              </p>

              
<p>
  <strong>Category:</strong> {club.category}
</p>

<Link
  to={`/report?type=club&id=${encodeURIComponent(club.id)}`}
  style={{
    display: "inline-block",
    marginTop: "12px",
    color: "#a43e3e",
    fontSize: "14px",
    textDecoration: "underline"
  }}
>
  Report Club
</Link>

            </div>

{club.my_role === "owner" && (
  <div
    style={{
      display: "flex",
      gap: "12px",
      flexWrap: "wrap"
    }}
  >
    <button
      type="button"
      className="clubs-create-button"
      onClick={openEditForm}
      disabled={submitting}
    >
      Edit Club
    </button>

    <button
      type="button"
      className="club-leave-button"
      onClick={handleDeleteClub}
      disabled={submitting}
    >
      {submitting ? "Deleting..." : "Delete Club"}
    </button>
  </div>
)}


            {!club.my_role && (
              club.request_pending ? (
                <span className="club-joined-label">
                  Pending Approval
                </span>
              ) : (
                <button
                  type="button"
                  className="clubs-create-button"
                  disabled={submitting}
                  onClick={joinOrRequest}
                >
                  {submitting
                    ? "Processing..."
                    : club.visibility === "private"
                      ? "Request to Join"
                      : "Join Club"}
                </button>
              )
            )}
          </section>


{showEditForm && club.my_role === "owner" && (
  <section
    style={{
      padding: "28px",
      border: "1px solid #e6e6e2",
      borderRadius: "14px",
      marginBottom: "32px"
    }}
  >
    <p className="small-label">CLUB MANAGEMENT</p>
    <h2>Edit club details</h2>

    <form
      onSubmit={handleSaveClub}
      style={{
        display: "grid",
        gap: "18px",
        marginTop: "20px"
      }}
    >
      <label>
        Club name
        <input
          required
          maxLength={100}
          value={editClub.name}
          onChange={event =>
            setEditClub(prev => ({
              ...prev,
              name: event.target.value
            }))
          }
        />
      </label>

      <label>
        Description
        <textarea
          rows={3}
          value={editClub.description}
          onChange={event =>
            setEditClub(prev => ({
              ...prev,
              description: event.target.value
            }))
          }
        />
      </label>

      <label>
        Category
        <input
          required
          maxLength={60}
          value={editClub.category}
          onChange={event =>
            setEditClub(prev => ({
              ...prev,
              category: event.target.value
            }))
          }
        />
      </label>

      <label>
        Current book
        <input
          maxLength={300}
          value={editClub.currentBook}
          onChange={event =>
            setEditClub(prev => ({
              ...prev,
              currentBook: event.target.value
            }))
          }
        />
      </label>

      <label>
        Next meeting
        <input
          type="datetime-local"
          value={editClub.nextMeeting}
          onChange={event =>
            setEditClub(prev => ({
              ...prev,
              nextMeeting: event.target.value
            }))
          }
        />
      </label>

      <fieldset>
        <legend>Club privacy</legend>

        <label>
          <input
            type="radio"
            name="edit-visibility"
            checked={editClub.visibility === "public"}
            onChange={() =>
              setEditClub(prev => ({
                ...prev,
                visibility: "public"
              }))
            }
          />
          {" "}Public
        </label>

        <label style={{ marginLeft: "18px" }}>
          <input
            type="radio"
            name="edit-visibility"
            checked={editClub.visibility === "private"}
            onChange={() =>
              setEditClub(prev => ({
                ...prev,
                visibility: "private"
              }))
            }
          />
          {" "}Private
        </label>
      </fieldset>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="submit"
          className="clubs-create-button"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="club-leave-button"
          disabled={saving}
          onClick={() => setShowEditForm(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
)}


          <section
            className="clubs-stats"
            style={{ marginBottom: "36px" }}
          >
            <div>
              <strong>{club.members}</strong>
              <span>Members</span>
            </div>

            <div>
              <strong>
                {club.visibility === "private"
                  ? "Private"
                  : "Public"}
              </strong>
              <span>Club privacy</span>
            </div>

            <div>
              <strong>
                {club.my_role === "owner"
                  ? "Owner"
                  : club.my_role === "member"
                    ? "Member"
                    : "Visitor"}
              </strong>
              <span>Your role</span>
            </div>
          </section>

          <section
            className="your-clubs-section"
            style={{ marginBottom: "36px" }}
          >
            <p className="small-label">CLUB INFORMATION</p>
            <h2>What we're reading</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
                marginTop: "20px"
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e6e6e2",
                  borderRadius: "12px"
                }}
              >
                <p className="small-label">CURRENT BOOK</p>
                <h3>{club.current_book || "Not selected yet"}</h3>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e6e6e2",
                  borderRadius: "12px"
                }}
              >
                <p className="small-label">NEXT MEETING</p>
                <h3>
                  {club.next_meeting
                    ? new Date(
                        club.next_meeting
                      ).toLocaleString()
                    : "Not scheduled"}
                </h3>
              </div>
            </div>

            <p style={{ marginTop: "20px" }}>
              <strong>Club owner:</strong>{" "}
              {club.owner_name} (@{club.owner_username})
            </p>
          </section>

          <section className="your-clubs-section">
            <p className="small-label">READING COMMUNITY</p>
            <h2>Club members</h2>

            {!membersVisible ? (
              <div className="clubs-empty">
                <h3>Members are private</h3>
                <p>
                  Join this club to see its members.
                </p>
              </div>
            ) : members.length === 0 ? (
              <p>No members to display.</p>
            ) : (
              <div
                className="clubs-list"
                style={{ marginTop: "20px" }}
              >
                {members.map(member => (
                  <article
                    key={member.id}
                    className="club-row"
                  >
                    <div className="club-number">
                      {initials(member.name)}
                    </div>

                    <div className="club-main-info">
                      <h3>{member.name}</h3>
                      <p>@{member.username}</p>
                    </div>

                    <span className="club-joined-label">
                      {member.role === "owner"
                        ? "Owner"
                        : "Member"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
