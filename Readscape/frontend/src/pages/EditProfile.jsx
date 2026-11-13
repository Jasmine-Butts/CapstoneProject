
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";

function EditProfile() {
  const navigate = useNavigate();

  const {
    profile,
    initials,
    updateProfile,
    loading,
    error: profileError,
  } = useSharedProfile();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    location: "",
    bio: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isDirty) {
      setFormData({
        name: profile.name || "",
        username: (profile.username || "").replace(/^@/, ""),
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [loading, profile, isDirty]);

  function handleChange(event) {
    const { name, value } = event.target;

    setIsDirty(true);

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const name = formData.name.trim();
    const username = formData.username.trim().replace(/^@/, "");
    const location = formData.location.trim();
    const bio = formData.bio.trim();

    if (!name || !username) {
      setError("Name and username are required.");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
      setError(
        "Username must contain 3–40 letters, numbers, dots, underscores, or hyphens."
      );
      return;
    }

    if (bio.length > 500 || location.length > 100) {
      setError("Bio or location is too long.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const saved = await updateProfile({
        name,
        username,
        location,
        bio,
      });

      if (saved) {
        navigate("/profile");
      } else {
        setError(
          "Unable to save profile. Please check your information and try again."
        );
      }
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="edit-profile-page">
        <p>Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <Link to="/profile" className="profile-back-link">
        ← Back to profile
      </Link>

      <section className="edit-profile-header">
        <p className="small-label">ACCOUNT DETAILS</p>

        <h1>Edit profile.</h1>

        <p>
          Update how your name, username, and
          reading profile appear across Readscape.
        </p>
      </section>

      <form
        className="edit-profile-form"
        onSubmit={handleSubmit}
      >
        <div className="edit-avatar-section">
          <div className="profile-avatar-large">
            {initials}
          </div>

          <div>
            <h3>Profile image</h3>
            <p>
              Your initials are generated from
              your display name. Profile photo
              uploads can be added later.
            </p>
          </div>
        </div>

        <div className="edit-profile-fields">
          <div className="edit-profile-field">
            <label htmlFor="name">
              Display name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              maxLength={40}
              required
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="bio">
              Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              rows="5"
              maxLength={500}
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
        </div>

        {(error || profileError) && (
          <p role="alert" style={{ color: "#a43e3e" }}>
            {error || profileError}
          </p>
        )}

        <div className="edit-profile-actions">
          <Link
            to="/profile"
            className="edit-cancel-button"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="edit-save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditProfile;
