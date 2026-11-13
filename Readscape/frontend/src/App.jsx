import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "./components/AppShell";

import AdminGuard from "./components/AdminGuard";

// Main application pages
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";
import Statistics from "./pages/Statistics";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendProfile from "./pages/FriendProfile";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import EditProfile from "./pages/EditProfile";

// Authentication pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin and Moderator pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminClubs from "./pages/AdminClubs";
import AdminModerators from "./pages/AdminModerators";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import ModerationReports from "./pages/ModerationReports";
import SubmitReport from "./pages/SubmitReport";
import AdminActivity from "./pages/AdminActivity";

// Require a login before accessing reader pages
function RequireLogin() {
  return sessionStorage.getItem("readscapeToken")
    ? <AppShell />
    : <Navigate to="/login" replace />;
}

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

        {/* Moderator Dashboard */}
        <Route
          path="/moderator"
          element={<ModeratorDashboard />}
        />


{/* Admin pages - Login and Admin role required */}

<Route element={<RequireLogin />}>
  <Route element={<AdminGuard />}>
    <Route
      path="/admin"
      element={<AdminDashboard />}
    />

    <Route
      path="/admin/users"
      element={<AdminUsers />}
    />

    <Route
      path="/admin/clubs"
      element={<AdminClubs />}
    />

    <Route
      path="/admin/moderators"
      element={<AdminModerators />}
    />

  <Route
    path="/admin/activity"
    element={<AdminActivity />}
  />
  </Route>
</Route>


        {/* Main application - Login required */}
        <Route element={<RequireLogin />}>
          <Route
            path="/search"
            element={<Search />}
          />

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
          path="/friends/:id"
          element={<FriendProfile />}
          />

          <Route
            path="/clubs"
            element={<Clubs />}
          />

          <Route
            path="/clubs/:id"
            element={<ClubDetails />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="/moderation-reports"
            element={<ModerationReports />}
          />

          <Route
            path="/report"
            element={<SubmitReport />}
          />
        </Route>


        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
