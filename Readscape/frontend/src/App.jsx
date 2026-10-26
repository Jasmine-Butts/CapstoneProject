import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "./components/AppShell";

// Main application pages
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";
import Statistics from "./pages/Statistics";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Clubs from "./pages/Clubs";
import EditProfile from "./pages/EditProfile";

// Authentication pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin and Moderator pages
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Pages */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* Moderator Dashboard */}
        <Route
          path="/moderator"
          element={<ModeratorDashboard />}
        />

        {/* Main Reader Application */}
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/library"
            element={<Library />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/books/:id"
            element={<BookDetails />}
          />

          <Route
            path="/statistics"
            element={<Statistics />}
          />

          <Route
            path="/goals"
            element={<Goals />}
          />

          <Route
            path="/friends"
            element={<Friends />}
          />

          <Route
            path="/clubs"
            element={<Clubs />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfile />}
          />
        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
