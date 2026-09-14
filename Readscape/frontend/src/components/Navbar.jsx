import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        Readscape
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>
        <NavLink to="/statistics">Statistics</NavLink>
        <NavLink to="/goals">Goals</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;