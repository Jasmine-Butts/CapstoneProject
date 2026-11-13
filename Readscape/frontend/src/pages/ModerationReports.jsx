
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function ModerationReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const data = await api(
          `/moderation/reports?status=${filter}`
        );

        if (!cancelled) {
          setReports(data.reports || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load reports.");
          setReports([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [filter, refresh]);

  async function handleReview(report, status) {
    if (updatingId !== null) return;

    const confirmed = window.confirm(
      status === "reviewed"
        ? `Mark report #${report.id} as reviewed?`
        : `Dismiss report #${report.id}?`
    );

    if (!confirmed) return;

    setUpdatingId(report.id);
    setError("");
    setActionNotice("");

    try {
      const data = await api(
        `/moderation/reports/${report.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status })
        }
      );

      setActionNotice(data.message);
      setRefresh(previous => previous + 1);
    } catch (err) {
      setError(
        err.message || "Could not update report."
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
  <span>COMMUNITY MODERATION</span>
</div>


      <header className="role-header">
        <p className="small-label">
          COMMUNITY SAFETY
        </p>

        <h1>Community Reports</h1>

        <p>
          Review reports submitted by Readscape
          members and manage their status.
        </p>
      </header>

      <section className="role-section">
        <div className="role-card">
          <h2>Report Management</h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              margin: "20px 0"
            }}
          >
            {[
              ["pending", "Pending"],
              ["reviewed", "Reviewed"],
              ["dismissed", "Dismissed"],
              ["all", "All Reports"]
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setFilter(value);
                  setActionNotice("");
                }}
                aria-pressed={filter === value}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1px solid #ddd",
                  background:
                    filter === value
                      ? "#285c44"
                      : "#fff",
                  color:
                    filter === value
                      ? "#fff"
                      : "#333"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" style={{ color: "#a43e3e" }}>
              {error}
            </p>
          )}

          {actionNotice && (
            <p role="status" style={{ color: "#285c44" }}>
              {actionNotice}
            </p>
          )}

          {loading ? (
            <p>Loading reports...</p>
          ) : !error && reports.length === 0 ? (
            <p>No reports found for this filter.</p>
          ) : !error ? (
            <div style={{ display: "grid", gap: 16 }}>
              {reports.map(report => (
                <article
                  key={report.id}
                  style={{
                    padding: 20,
                    border: "1px solid #e6e6e2",
                    borderRadius: 12
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap"
                    }}
                  >
                    <h3>Report #{report.id}</h3>
                    <strong>{report.status}</strong>
                  </div>

                  <p>
                    <strong>Reported by:</strong>{" "}
                    @{report.reporter_username}
                  </p>

                  <p>
                    <strong>Reported target:</strong>{" "}
                    {report.reported_username
                      ? `User: @${report.reported_username}`
                      : report.club_name
                        ? `Club: ${report.club_name}`
                        : "Target no longer exists"}
                  </p>

                  <p>
                    <strong>Reason:</strong> {report.reason}
                  </p>

                  {report.description && (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <strong>Description:</strong>{" "}
                      {report.description}
                    </p>
                  )}

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(
                      report.created_at
                    ).toLocaleString()}
                  </p>

                  {report.reviewed_at && (
                    <p>
                      <strong>Reviewed:</strong>{" "}
                      {new Date(
                        report.reviewed_at
                      ).toLocaleString()}
                      {report.reviewed_by_username
                        ? ` by @${report.reviewed_by_username}`
                        : ""}
                    </p>
                  )}

                  {report.status === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 16,
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() =>
                          handleReview(report, "reviewed")
                        }
                        className="clubs-create-button"
                      >
                        {String(updatingId) ===
                        String(report.id)
                          ? "Updating..."
                          : "Mark Reviewed"}
                      </button>

                      <button
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() =>
                          handleReview(report, "dismissed")
                        }
                        style={{
                          padding: "10px 16px",
                          border: "1px solid #b94a48",
                          borderRadius: 8,
                          background: "transparent",
                          color: "#b94a48"
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : null}

          {!loading && !error && (
            <p style={{ marginTop: 16 }}>
              Showing {reports.length} report(s)
              {reports.length === 100
                ? " (first 100 results)"
                : ""}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
