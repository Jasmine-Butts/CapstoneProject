import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppShell from "./components/AppShell";

import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";
import Statistics from "./pages/Statistics";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

import { AuthProvider } from "./services/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
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

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
          {/* Main application */}
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
                path="/profile"
                element={<Profile />}
              />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;