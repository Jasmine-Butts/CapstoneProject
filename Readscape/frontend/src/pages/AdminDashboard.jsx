import { Link } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";
import { useSharedBooks } from "../context/BooksContext";

function AdminDashboard() {
  const { profile } = useSharedProfile();
  const { books } = useSharedBooks();

  const finished = books.filter(
    (book) => book.status === "finished"
  ).length;

  const reading = books.filter(
    (book) => book.status === "reading"
  ).length;

  const stats = [
    { label: "Registered users", value: "Demo" },
    { label: "Moderators", value: "Demo" },
    { label: "Books in sample library", value: books.length },
    { label: "Books finished", value: finished },
    { label: "Currently reading", value: reading },
    { label: "Pending reports", value: "Demo" },
  ];

  return (
    <main className="role-page">
      <div className="role-topbar">
        <Link to="/dashboard">Readscape</Link>
        <span>ADMINISTRATION</span>
      </div>

      <header className="role-header">
        <p className="small-label">ADMIN DASHBOARD</p>
        <h1>Welcome, {profile.name}.</h1>
        <p>
          Manage the Readscape platform and oversee
          community operations.
        </p>
      </header>

      <section className="role-stats">
        {stats.map((stat) => (
          <div className="role-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="role-section">
        <h2>Platform management</h2>

        <div className="role-actions">
          <article className="role-card">
            <h3>User management</h3>
            <p>
              View accounts, manage user roles,
              and review account issues.
            </p>
            <span className="role-planned">
              Backend integration pending
            </span>
          </article>

          <article className="role-card">
            <h3>Moderator management</h3>
            <p>
              Assign moderator roles and oversee
              moderation responsibilities.
            </p>
            <span className="role-planned">
              Backend integration pending
            </span>
          </article>

          <article className="role-card">
            <h3>Community reports</h3>
            <p>
              Review reported content and
              platform safety activity.
            </p>
            <Link to="/moderator">
              View moderation preview
            </Link>
          </article>

          <article className="role-card">
            <h3>Clubs management</h3>
            <p>
              Oversee reading clubs and their
              community activity.
            </p>
            <Link to="/clubs">
              View clubs
            </Link>
          </article>
        </div>
      </section>

      <p className="role-disclaimer">
        Presentation preview: book figures are from the
        current browser library. User, moderator and
        report metrics are not connected to a backend.
      </p>
    </main>
  );
}

export default AdminDashboard;
