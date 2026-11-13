
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function SubmitReport() {
  const [params] = useSearchParams();

  const type = params.get("type");
  const targetId = params.get("id");

  const validType = ["user", "club"].includes(type);
  const validId = /^[1-9]\d*$/.test(targetId || "");
  const validTarget = validType && validId;

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validTarget || submitting || submitted) return;

    setSubmitting(true);
    setError("");

    try {
      const body = {
        reason,
        description,
        ...(type === "user"
          ? { reportedUserId: targetId }
          : { clubId: targetId })
      };

      await api("/reports", {
        method: "POST",
        body: JSON.stringify(body)
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="role-page">
      <div className="role-topbar">
        <Link to="/dashboard">← Back to Readscape</Link>
        <span>COMMUNITY SAFETY</span>
      </div>

      <header className="role-header">
        <p className="small-label">REPORT CONTENT</p>
        <h1>Submit a Report</h1>
        <p>
          Help keep Readscape a welcoming community
          by reporting inappropriate behavior or content.
        </p>
      </header>

      <section className="role-section">
        <div className="role-card">
          {!validTarget ? (
            <p role="alert">
              Invalid report target. Please start from a
              user's profile or a book club.
            </p>
          ) : submitted ? (
            <div>
              <h2>Report Submitted</h2>
              <p role="status">
                Thank you for submitting your report.
                Our moderation team can now review it.
              </p>
              <Link to="/dashboard">
                Return to Readscape →
              </Link>
            </div>
          ) : (
            <>
              <h2>
                Report {type === "user" ? "User" : "Club"}
              </h2>

              <p>
                Please explain why you're reporting
                this {type}.
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "grid",
                  gap: 18,
                  marginTop: 24
                }}
              >
                <div>
                  <label htmlFor="report-reason">
                    <strong>Reason for reporting *</strong>
                  </label>

                  <select
                    id="report-reason"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    style={{
                      display: "block",
                      width: "100%",
                      padding: 12,
                      marginTop: 8,
                      borderRadius: 8,
                      border: "1px solid #ddd"
                    }}
                  >
                    <option value="">Select a reason</option>
                    <option value="Spam">Spam</option>
                    <option value="Harassment">
                      Harassment or bullying
                    </option>
                    <option value="Inappropriate content">
                      Inappropriate content
                    </option>
                    <option value="Hate speech">
                      Hate speech
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="report-description">
                    <strong>Additional details</strong>
                  </label>

                  <textarea
                    id="report-description"
                    value={description}
                    onChange={e =>
                      setDescription(e.target.value)
                    }
                    maxLength={2000}
                    rows={5}
                    placeholder="Describe what happened..."
                    style={{
                      display: "block",
                      width: "100%",
                      padding: 12,
                      marginTop: 8,
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      boxSizing: "border-box"
                    }}
                  />

                  <p style={{ fontSize: 13 }}>
                    {description.length}/2000 characters
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    style={{ color: "#a43e3e" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!reason || submitting}
                  className="clubs-create-button"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Report"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
