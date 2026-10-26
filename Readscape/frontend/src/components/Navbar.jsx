
import { NavLink } from "react-router-dom";
import { useSharedProfile } from "../context/ProfileContext";

function Navbar() {
  const { initials } = useSharedProfile();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="brand">
          Readscape
        </NavLink>

        <div className="nav-right">
          <div className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/library">Library</NavLink>
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/statistics">Statistics</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/friends">Friends</NavLink>
            <NavLink to="/clubs">Clubs</NavLink>
          </div>

          <NavLink
            to="/profile"
            className="profile-avatar"
            title="Profile"
          >
            {initials}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
