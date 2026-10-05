import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { profileData } from "../data/profileData";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: profileData.name,
    username: profileData.username,
    location: profileData.location,
    bio: profileData.bio,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Later this can be replaced with a backend API call.
    console.log("Updated profile:", formData);

    navigate("/profile");
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
            reading profile appear across
            Readscape.
          </p>
        </section>

        <form
          className="edit-profile-form"
          onSubmit={handleSubmit}
        >
          <div className="edit-avatar-section">
            <div className="profile-avatar-large">
              {profileData.initials}
            </div>

            <div>
              <h3>Profile image</h3>

              <p>
                Initials are shown for now.
                Profile photos can be added later.
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
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>

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