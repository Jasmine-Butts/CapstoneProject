import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";
import Statistics from "./pages/Statistics";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;