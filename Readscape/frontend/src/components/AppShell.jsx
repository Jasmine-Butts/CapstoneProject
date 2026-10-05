import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
  <Outlet />
</main>
    </div>
  );
}

export default AppShell;