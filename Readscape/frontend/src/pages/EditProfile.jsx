
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";

function EditProfile() {
  const navigate = useNavigate();

  const {
    profile,
    initials,
    updateProfile,
  } = useSharedProfile();

  const [formData, setFormData] = useState({
    name: profile.name || "",
    username: profile.username || "",
    location: profile.location || "",
    bio: profile.bio || "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    let username = formData.username.trim();

    if (!name || !username) {
      setError("Name and username are required.");
      return;
    }

    if (!username.startsWith("@")) {
      username = `@${username}`;
    }

    if (!/^@[a-zA-Z0-9._]{3,30}$/.test(username)) {
      setError(
        "Username must contain 3–30 letters, numbers, dots, or underscores."
      );
      return;
    }

    const saved = updateProfile({
      name,
      username,
      location: formData.location.trim(),
      bio: formData.bio.trim(),
    });

    if (saved) {
      navigate("/profile");
    } else {
      setError("Unable to save profile. Please try again.");
    }
  }

  return (
    <>
      <main className="edit-profile-page">
        <Link
          to="/profile"
          className="profile-back-link"
        >
          ← Back to profile
        </Link>

        <section className="edit-profile-header">
          <p className="small-label">
            ACCOUNT DETAILS
          </p>

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
                maxLength={31}
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

          {error && (
            <p role="alert" style={{ color: "#a43e3e" }}>
              {error}
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
            >
              Save changes
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default EditProfile;
