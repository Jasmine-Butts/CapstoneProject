import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";
import { api } from "../services/api";

function AdminDashboard() {
  const { profile } = useSharedProfile();

  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);


  useEffect(() => {
    let cancelled = false;

    async function loadAdminStats() {
      setLoading(true);
      setError("");
      setAccessDenied(false);

      try {
        const data = await api("/admin/stats");

        if (!cancelled) {
          setPlatformStats(data.stats);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.message || "Could not load administrator statistics.";

          setError(message);

          if (
            message.includes("403") ||
            message.toLowerCase().includes("administrator access")
          ) {
            setAccessDenied(true);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAdminStats();

    return () => {
      cancelled = true;
    };
  }, []);


  const stats = platformStats
    ? [
        {
          label: "Registered users",
          value: platformStats.total_users
        },
        {
          label: "Books tracked",
          value: platformStats.books_tracked
        },
        {
          label: "Reading clubs",
          value: platformStats.total_clubs
        },
        {
          label: "Club memberships",
          value: platformStats.club_memberships
        }
      ]
    : [];

  // Wait until the authorization request finishes.
  if (loading) {
    return (
      <main className="role-page">
        <div className="role-topbar">
          <Link to="/dashboard">Readscape</Link>
          <span>ADMINISTRATION</span>
        </div>

        <section className="role-header">
          <p className="small-label">ADMIN DASHBOARD</p>
          <h1>Loading dashboard...</h1>
          <p>Verifying administrator access.</p>
        </section>
      </main>
    );
  }

  // Do not display administrative content when access fails.
  if (error) {
    return (
      <main className="role-page">
        <div className="role-topbar">
          <Link to="/dashboard">Readscape</Link>
          <span>ADMINISTRATION</span>
        </div>

        <section className="role-header">
          <p className="small-label">
            {accessDenied ? "ACCESS DENIED" : "DASHBOARD ERROR"}
          </p>

          <h1>
            {accessDenied
              ? "Administrator access required."
              : "Unable to load dashboard."}
          </h1>

          <p role="alert">
            {accessDenied
              ? "You do not have permission to access the Readscape Admin Dashboard."
              : error}
          </p>

          <Link to="/dashboard" className="clubs-back-link">
            ← Back to overview
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="role-page">
      {/* TOP NAVIGATION */}
      <div className="role-topbar">
        <Link to="/dashboard">Readscape</Link>
        <span>ADMINISTRATION</span>
      </div>

      {/* WELCOME SECTION */}
      <header className="role-header">
        <p className="small-label">ADMIN DASHBOARD</p>

        <h1>Welcome, {profile?.name || "Administrator"}.</h1>

        <p>
          Manage the Readscape platform, monitor community
          activity, and oversee administrative operations.
        </p>
      </header>

      {/* REAL DATABASE STATISTICS */}
      <section className="role-stats">
        {stats.map(stat => (
          <div className="role-card" key={stat.label}>
            <strong>
              {typeof stat.value === "number"
                ? stat.value.toLocaleString()
                : "—"}
            </strong>

            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* PLATFORM MANAGEMENT */}
      <section className="role-section">
        <h2>Platform management</h2>

        <div className="role-actions">
          {/* USER MANAGEMENT */}
          

<article className="role-card">
  <h3>User management</h3>

  <p>
    Search registered accounts, review user activity,
    and manage account permissions.
  </p>

  <Link to="/admin/users" className="role-action">
    Manage users 
  </Link>
</article>



          {/* MODERATOR MANAGEMENT */}
          <article className="role-card">
            <h3>Moderator management</h3>

            <p>
              Assign moderator roles and manage moderation
              responsibilities.
            </p>

            <Link to="/admin/moderators" className="role-action">
              Manage moderators
            </Link>
          </article>

          {/* COMMUNITY REPORTS */}
          <article className="role-card" >
            <h3>Community reports</h3>

            <p>
              Review reported content and monitor community
              safety activity.
            </p>

            <Link to="/moderation-reports" className="role-action">
              View reports
            </Link>
          </article>

          {/* CLUB MANAGEMENT */}
          <article className="role-card">
            <h3>Clubs management</h3>

            <p>
              Oversee reading clubs, review club information,
              and monitor community participation.
            </p>

            
<Link to="/admin/clubs" className="role-action">
  Manage clubs
</Link>

          </article>
        </div>
      </section>


      {/* FUTURE FEATURES */}
      <section className="role-section">
        <h2>Administration overview</h2>

        <div className="role-actions">
          <article className="role-card">
            <h3>Platform activity</h3>

            <p>
              Monitor new registrations, reading activity,
              and community growth.
            </p>

            <span className="role-planned" className="role-action">
              Coming soon
            </span>
          </article>

          
<Link
  to="/admin/activity"
  style={{ textDecoration: "none", color: "inherit" }}
>
  <article className="role-card">
    <h3>Administrative Activity Log</h3>

    <p>
      Review role changes, account suspensions,
      club deletions, and moderator decisions
      across Readscape.
    </p>

    <span className="role-action">
      View Activity Log
    </span>
  </article>
</Link>

        </div>
      </section>

      {/* FOOTER */}
      <p className="role-disclaimer">
        Dashboard statistics are retrieved from Readscape's
        Neon PostgreSQL database. Additional administrative
        management features are under development.
      </p>
    </main>
  );
}

export default AdminDashboard;
