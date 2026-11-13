
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("");
}

function BookCard({ book }) {
  return (
    <article
      style={{
        display: "flex",
        gap: "16px",
        padding: "18px",
        border: "1px solid #e6e6e2",
        borderRadius: "12px",
      }}
    >
      {book.cover ? (
        <img
          src={book.cover}
          alt={`Cover of ${book.title}`}
          style={{
            width: "75px",
            height: "110px",
            objectFit: "cover",
            borderRadius: "6px",
          }}
        />
      ) : (
        <div
          style={{
            width: "75px",
            minWidth: "75px",
            height: "110px",
            background: "#eeeae3",
            borderRadius: "6px",
            display: "grid",
            placeItems: "center",
          }}
        >
          📖
        </div>
      )}

      <div>
        <h3 style={{ margin: "0 0 6px" }}>
          {book.title}
        </h3>
        <p style={{ margin: "0 0 12px" }}>
          {book.author}
        </p>

        <span>
          {book.status === "reading"
            ? `Reading · ${book.current_page || 0} / ${book.pages || 0} pages`
            : "Finished"}
        </span>
      </div>
    </article>
  );
}

export default function FriendProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setProfile(null);

      try {
        const data = await api(
          `/friends/${encodeURIComponent(id)}/profile`
        );

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load friend profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main
      className="friends-page"
      style={{ maxWidth: "1100px", margin: "0 auto" }}
    >
      <Link to="/friends" className="friends-back-link">
        ← Back to friends
      </Link>

      {loading && <p>Loading friend profile...</p>}

      {error && (
        <p role="alert" style={{ color: "#a43e3e" }}>
          {error}
        </p>
      )}

      {!loading && profile && (
        <>
          <section
            className="friends-hero"
            style={{ marginBottom: "32px" }}
          >
            <p className="small-label">
              READING PROFILE
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                className="friend-avatar"
                style={{
                  width: "76px",
                  height: "76px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                }}
              >
                {initials(profile.user.name)}
              </div>

              
<div>
  <h1>{profile.user.name}</h1>
  <p>@{profile.user.username}</p>

  <Link
    to={`/report?type=user&id=${encodeURIComponent(profile.user.id)}`}
    style={{
      display: "inline-block",
      marginTop: "10px",
      color: "#a43e3e",
      fontSize: "14px",
      textDecoration: "underline"
    }}
  >
    Report User
  </Link>
</div>

            </div>

            {profile.user.bio && (
              <p style={{ marginTop: "20px" }}>
                {profile.user.bio}
              </p>
            )}

            {profile.user.location && (
              <p>📍 {profile.user.location}</p>
            )}
          </section>

          <section style={{ marginBottom: "40px" }}>
            <p className="small-label">
              READING STATISTICS
            </p>
            <h2>Reading at a glance</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              {[
                {
                  label: "Currently Reading",
                  value: profile.stats.currentlyReading,
                },
                {
                  label: "Books Finished",
                  value: profile.stats.totalFinished,
                },
                {
                  label: "Finished This Year",
                  value: profile.stats.finishedThisYear,
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    border: "1px solid #e6e6e2",
                    borderRadius: "12px",
                    padding: "22px",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    {stat.value}
                  </strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <p className="small-label">
              CURRENT BOOKS
            </p>
            <h2>Currently reading</h2>

            {profile.reading.length === 0 ? (
              <p>No books currently being read.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                {profile.reading.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: "40px" }}>
            <p className="small-label">
              COMPLETED BOOKS
            </p>
            <h2>Finished books</h2>

            {profile.finished.length === 0 ? (
              <p>No finished books yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                {profile.finished.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
