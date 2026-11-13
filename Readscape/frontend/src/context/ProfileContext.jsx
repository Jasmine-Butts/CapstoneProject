
import {
  createContext,
  useContext,
  useState,
} from "react";

import { profileData } from "../data/profileData";

const ProfileContext = createContext(null);
const STORAGE_KEY = "readscape-profile";

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (parsed && typeof parsed === "object" &&
          !Array.isArray(parsed)) {
        return { ...profileData, ...parsed };
      }
    }
  } catch (error) {
    console.error("Could not load profile:", error);
  }

  return { ...profileData };
}

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
  const [profile, setProfile] = useState(loadProfile);

  function updateProfile(changes) {
    const updated = {
      ...profile,
      ...changes,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setProfile(updated);
      return true;
    } catch (error) {
      console.error("Could not save profile:", error);
      return false;
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        initials: getInitials(profile.name),
        updateProfile,
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
