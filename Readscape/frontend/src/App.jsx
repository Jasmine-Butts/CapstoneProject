import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "./components/AppShell";

import Search from "./pages/Search";

import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";
import Statistics from "./pages/Statistics";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends.jsx";
import Clubs from "./pages/Clubs.jsx";
import EditProfile from "./pages/EditProfile.jsx";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

function RequireLogin() {
  return sessionStorage.getItem("readscapeToken") ? <AppShell /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication pages */}
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

        {/* Main application */}
        <Route element={<RequireLogin />}>
          <Route path="/search" element={<Search />} />
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
