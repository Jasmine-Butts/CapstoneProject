
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function AdminModerators() {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModerators() {
      try {
        const data = await api("/admin/moderators");

        if (!cancelled) {
          setModerators(data.moderators || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load moderators."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModerators();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemoveModerator(moderator) {
    if (updatingId !== null) return;

    const confirmed = window.confirm(
      `Remove moderator privileges from @${moderator.username}?\n\n` +
      "This account will become a regular Readscape user."
    );

    if (!confirmed) return;

    setUpdatingId(moderator.id);
    setActionError("");
    setActionNotice("");

    try {
      await api(`/admin/users/${moderator.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: "user" })
      });

      setModerators(previous =>
        previous.filter(
          item => String(item.id) !== String(moderator.id)
        )
      );

      setActionNotice(
        `@${moderator.username} is now a regular user.`
      );
    } catch (err) {
      setActionError(
        err.message || "Could not update moderator role."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="role-page">
      <div className="role-topbar">
        <Link to="/admin">
          ← Back to Admin Dashboard
        </Link>
        <span>MODERATOR MANAGEMENT</span>
      </div>

      <header className="role-header">
        <p className="small-label">ADMINISTRATION</p>
        <h1>Moderator Management</h1>
        <p>
          View moderator accounts and manage
          their platform privileges.
        </p>
      </header>

      <section className="role-section">
        <div className="role-card">
          <h2>Current Moderators</h2>
          <p>
            Moderators are assigned by administrators.
            You can manage additional role assignments
            from User Management.
          </p>

          <p>
            <Link to="/admin/users">
              Manage all users →
            </Link>
          </p>

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
            <p>Loading moderators...</p>
          ) : !error && moderators.length === 0 ? (
            <p>No moderators assigned yet.</p>
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
                      "Name",
                      "Username",
                      "Email",
                      "Status",
                      "Clubs Joined",
                      "Registered",
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
                  {moderators.map(moderator => (
                    <tr key={moderator.id}>
                      <td style={{ padding: "14px 12px" }}>
                        {moderator.name}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        @{moderator.username}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {moderator.email}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        <span
                          style={{
                            color: moderator.is_suspended
                              ? "#a43e3e"
                              : "#285c44"
                          }}
                        >
                          {moderator.is_suspended
                            ? "Suspended"
                            : "Active"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {moderator.clubs_joined}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {new Date(
                          moderator.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        <button
                          type="button"
                          disabled={updatingId !== null}
                          onClick={() =>
                            handleRemoveModerator(moderator)
                          }
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "transparent",
                            border: "1px solid #b94a48",
                            color: "#b94a48",
                            cursor:
                              updatingId !== null
                                ? "not-allowed"
                                : "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {String(updatingId) ===
                          String(moderator.id)
                            ? "Updating..."
                            : "Remove Moderator"}
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
              Total moderators: {moderators.length}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
