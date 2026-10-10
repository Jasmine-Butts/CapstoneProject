import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="brand">
          Readscape
        </NavLink>

        <div className="nav-right">
          <div className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/search">Search</NavLink>
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
            MA
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
