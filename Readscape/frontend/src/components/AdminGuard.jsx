
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { api } from "../services/api";

function AdminGuard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const result = await api("/admin/me");

        if (!cancelled) {
          setAuthorized(result.authorized === true);
        }
      } catch (err) {
        if (!cancelled) {
          setAuthorized(false);
          setError(
            err.message || "Administrator access required."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="role-page">
        <p>Verifying administrator access...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="role-page">
        <div className="role-topbar">
          <Link to="/dashboard">Readscape</Link>
          <span>ACCESS RESTRICTED</span>
        </div>

        <header className="role-header">
          <p className="small-label">ACCESS DENIED</p>

          <h1>Administrator access required.</h1>

          <p role="alert">
            {error || "You do not have permission to view this page."}
          </p>

          <Link to="/dashboard" className="clubs-back-link">
            ← Back to dashboard
          </Link>
        </header>
      </main>
    );
  }

  return <Outlet />;
}

export default AdminGuard;
