
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BooksProvider } from "./context/BooksContext";
import { GoalsProvider } from "./context/GoalsContext";
import { ProfileProvider } from "./context/ProfileContext";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BooksProvider>
      <GoalsProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </GoalsProvider>
    </BooksProvider>
  </StrictMode>
);
