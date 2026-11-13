
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "../services/api";
import { profileData } from "../data/profileData";

const ProfileContext = createContext(null);

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "R";

  return (
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({ ...profileData });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = sessionStorage.getItem("readscapeToken");

      if (!token) {
        if (active) {
          setProfile({ ...profileData });
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await api("/auth/me");

        if (active) {
          setProfile({
            ...profileData,
            ...data.user,
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          console.error("Could not load profile:", err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    window.addEventListener("readscape-auth-changed", loadProfile);

    return () => {
      active = false;
      window.removeEventListener(
        "readscape-auth-changed",
        loadProfile
      );
    };
  }, []);

  async function updateProfile(changes) {
    setError("");

    try {
      const data = await api("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: changes.name ?? profile.name,
          username: changes.username ?? profile.username,
          bio: changes.bio ?? profile.bio ?? "",
          location: changes.location ?? profile.location ?? "",
        }),
      }); 

      setProfile({
        ...profileData,
        ...data.user,
        readerSince: data.user.created_at
          ? new Date(data.user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
            })
          : "",
      });

      return true;
    } catch (err) {
      setError(err.message);
      console.error("Could not update profile:", err);
      return false;
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        initials: getInitials(profile.name),
        updateProfile,
        loading,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useSharedProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useSharedProfile must be used inside ProfileProvider"
    );
  }

  return context;
}
