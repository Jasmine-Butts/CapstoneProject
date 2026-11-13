import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const FILTERS = [
  { value: "all", label: "All Activity" },
  { value: "user_role_changed", label: "Role Changes" },
  { value: "user_suspended", label: "Suspensions" },
  { value: "user_reactivated", label: "Reactivations" },
  { value: "club_deleted", label: "Club Deletions" },
  { value: "report_reviewed", label: "Reports Reviewed" },
  { value: "report_dismissed", label: "Reports Dismissed" }
];

const ACTION_LABELS = {
  user_role_changed: "Role Changed",
  user_suspended: "User Suspended",
  user_reactivated: "User Reactivated",
  club_deleted: "Club Deleted",
  report_reviewed: "Report Reviewed",
  report_dismissed: "Report Dismissed"
};

function getDescription(activity) {
  const details = activity.details || {};

  switch (activity.action) {
    case "user_role_changed":
      return `Changed @${details.username || activity.target_id} from ${
        details.previous_role || "unknown"
      } to ${details.new_role || "unknown"}.`;

    case "user_suspended":
      return `Suspended @${details.username || activity.target_id}.`;

    case "user_reactivated":
      return `Reactivated @${details.username || activity.target_id}.`;

    case "club_deleted":
      return `Deleted club "${details.club_name || activity.target_id}".`;

    case "report_reviewed":
      return `Marked report #${activity.target_id} as reviewed.`;

    case "report_dismissed":
      return `Dismissed report #${activity.target_id}.`;

    default:
      return `Performed ${activity.action}.`;
  }
}

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError("");

      try {
        const data = await api(
          `/admin/activity?action=${encodeURIComponent(filter)}`
        );

        if (active) {
          setActivities(data.activities || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load activity.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 20px"
      }}
    >
      <Link to="/admin">← Back to Admin Dashboard</Link>

      <header style={{ marginTop: "24px", marginBottom: "28px" }}>
        <h1>Administrative Activity Log</h1>
        <p>
          Review recent administrative and moderation actions
          across Readscape.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <label>
          Filter activity:{" "}
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginLeft: "8px"
            }}
          >
            {FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <span>
          {loading
            ? "Loading..."
            : `${activities.length} activities found`}
        </span>
      </section>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      {!loading && !error && activities.length === 0 && (
        <p>No activities found for this filter.</p>
      )}

      {!error && (
        <section style={{ display: "grid", gap: "14px" }}>
          {activities.map((activity) => (
            <article
              key={activity.id}
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #ddd",
                backgroundColor: "var(--card-bg, #fff)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <strong>
                  {ACTION_LABELS[activity.action] ||
                    activity.action}
                </strong>

                <time dateTime={activity.created_at}>
                  {new Date(activity.created_at).toLocaleString()}
                </time>
              </div>

              <p style={{ marginTop: "12px" }}>
                {getDescription(activity)}
              </p>

              <small>
                Performed by:{" "}
                <strong>
                  {activity.actor_username
                    ? `@${activity.actor_username}`
                    : "Deleted account"}
                </strong>
              </small>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
