import { Link } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";


const reviewCategories = [
  {
    title: "Reported discussions",
    description:
      "Review community discussions flagged by readers.",
  },
  {
    title: "Reported comments",
    description:
      "Check comments that may violate community rules.",
  },
  {
    title: "Club moderation",
    description:
      "Oversee reading clubs and discussions.",
  },
];

function ModeratorDashboard() {
  const { profile } = useSharedProfile();

  return (
    <main className="role-page">
      <div className="role-topbar">
        <Link to="/dashboard">Readscape</Link>
        <span>MODERATION</span>
      </div>

      <header className="role-header">
        <p className="small-label">
          MODERATOR DASHBOARD
        </p>

        <h1>Welcome, {profile.name}.</h1>

        <p>
          Help keep the Readscape community
          respectful, welcoming, and safe.
        </p>
      </header>

      <section className="role-stats">
        <div className="role-card">
          <strong>—</strong>
          <span>Pending reports</span>
        </div>

        <div className="role-card">
          <strong>—</strong>
          <span>Reviewed reports</span>
        </div>

        <div className="role-card">
          <strong>—</strong>
          <span>Active discussions</span>
        </div>
      </section>

      <section className="role-section">
        <h2>Moderation workspace</h2>

        <div className="role-actions">
          {reviewCategories.map((category) => (
            <article
              className="role-card"
              key={category.title}
            >
              <h3>{category.title}</h3>
              <p>{category.description}</p>

              <span className="role-planned">
                Report API pending
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="role-section">
        <h2>Community</h2>

        <div className="role-actions">
          <article className="role-card">
            <h3>Reading clubs</h3>
            <p>View existing reading clubs.</p>
            <Link to="/clubs">View clubs</Link>
          </article>

          <article className="role-card">
            <h3>Moderation guidelines</h3>
            <p>
              Future home for community rules
              and moderator procedures.
            </p>
            <span className="role-planned">
              Planned feature
            </span>
          </article>
        </div>
      </section>

      <p className="role-disclaimer">
        Presentation preview: moderation reports and
        activity counts require backend integration.
      </p>
    </main>
  );
}

export default ModeratorDashboard;
