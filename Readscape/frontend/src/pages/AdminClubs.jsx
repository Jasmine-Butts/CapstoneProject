import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingClubId, setDeletingClubId] = useState(null);
const [actionError, setActionError] = useState("");
const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClubs() {
      setLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("readscapeToken");

        const response = await fetch(
          `/api/admin/clubs?search=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load clubs."
          );
        }

        if (!cancelled) {
          setClubs(data.clubs || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
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
  }, [search]);


async function handleDeleteClub(club) {
  if (deletingClubId !== null) return;

  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${club.name}"?\n\n` +
    `This will remove the club and its ${club.members} membership(s).\n` +
    "This action cannot be undone."
  );

  if (!confirmed) return;

  setDeletingClubId(club.id);
  setActionError("");
  setActionNotice("");

  try {
    const token = sessionStorage.getItem("readscapeToken");

    const response = await fetch(
      `/api/admin/clubs/${encodeURIComponent(club.id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not delete the club."
      );
    }

    setClubs(previousClubs =>
      previousClubs.filter(
        item => String(item.id) !== String(club.id)
      )
    );

    setActionNotice(
      `"${club.name}" was deleted successfully.`
    );
  } catch (err) {
    setActionError(
      err.message || "Could not delete the club."
    );
  } finally {
    setDeletingClubId(null);
  }
}


  return (
    <div className="role-page">
      <div className="role-topbar">
        <Link to="/admin">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="role-header">
        <div>
          <h1>Club Management</h1>
          <p>
            View and manage reading communities
            across Readscape.
          </p>
        </div>
      </div>

      <section className="role-section">
        <div className="role-card">
          <h2>Registered Book Clubs</h2>

          <p>
            Search clubs and review their
            owners, membership, and visibility.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              margin: "20px 0",
              flexWrap: "wrap"
            }}
          >
            <input
              type="search"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Search club name or owner..."
              aria-label="Search clubs"
              maxLength={100}
              style={{
                flex: 1,
                minWidth: 220,
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: 8
              }}
            />

            <button
              type="button"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              Clear
            </button>
          </div>

          {error && (
            <p role="alert" style={{ color: "#a43e3e" }}>
              {error}
            </p>
          )}

          {actionError && (
  <p role="alert" style={{ color: "#a43e3e" }}>
    {actionError}
  </p>
)}

{actionNotice && (
  <p role="status" style={{ color: "#285c44" }}>
    {actionNotice}
  </p>
)}

          {loading ? (
            <p>Loading clubs...</p>
          ) : !error && clubs.length === 0 ? (
            <p>No clubs found.</p>
          ) : !error ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left"
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Club Name",
                      "Owner",
                      "Category",
                      "Members",
                      "Visibility",
                      "Created",
                      "Actions"
                    ].map(heading => (
                      <th
                        key={heading}
                        style={{
                          padding: "14px 12px",
                          borderBottom: "1px solid #ddd"
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {clubs.map(club => (
                    <tr key={club.id}>
                      <td style={{ padding: "14px 12px" }}>
                        <strong>{club.name}</strong>
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        @{club.owner_username}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {club.category}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {club.members}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {club.visibility === "private"
                          ? "Private"
                          : "Public"}
                      </td>

                      <td
                        style={{
                          padding: "14px 12px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {new Date(
                          club.created_at
                        ).toLocaleDateString()}
                      </td>


<td style={{ padding: "14px 12px" }}>
  <button
    type="button"
    onClick={() => handleDeleteClub(club)}
    disabled={deletingClubId !== null}
    style={{
      padding: "8px 14px",
      borderRadius: 8,
      border: "1px solid #b94a48",
      color: "#b94a48",
      background: "transparent",
      cursor: deletingClubId !== null
        ? "not-allowed"
        : "pointer",
      whiteSpace: "nowrap"
    }}
  >
    {String(deletingClubId) === String(club.id)
      ? "Deleting..."
      : "Delete"}
  </button>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && !error && (
            <p style={{ marginTop: 16 }}>
              Showing {clubs.length} club(s)
              {clubs.length === 50
                ? " (first 50 results)"
                : ""}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
