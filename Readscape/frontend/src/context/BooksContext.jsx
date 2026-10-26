
import { createContext, useContext } from "react";
import { useBooks } from "../hooks/useBooks";

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const booksState = useBooks();

  return (
    <BooksContext.Provider value={booksState}>
      {children}
    </BooksContext.Provider>
  );
}

export function useSharedBooks() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error(
      "useSharedBooks must be used inside BooksProvider"
    );
  }

  return context;
}
