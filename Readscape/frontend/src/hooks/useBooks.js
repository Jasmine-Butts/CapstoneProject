
import { useEffect, useState } from "react";
import { libraryBooks } from "../data/libraryData";

const STORAGE_KEY = "readscape-books";

export function useBooks() {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error("Could not load books:", error);
    }

    return libraryBooks;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error("Could not save books:", error);
    }
  }, [books]);

  function addBook(book) {
    const newBook = {
      id: crypto.randomUUID(),
      title: book.title.trim(),
      author: book.author.trim(),
      genre: book.genre.trim() || "Other",
      pages: Number(book.pages),
      addedAt: new Date().toISOString(),
      status: "want",
      progress: 0,
      cover: book.cover.trim() ||
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600",
    };

    setBooks((previous) => [...previous, newBook]);
  }

  function removeBook(id) {
    setBooks((previous) =>
      previous.filter((book) => book.id !== id)
    );
  }

  function updateBook(id, changes) {
    setBooks((previous) =>
      previous.map((book) =>
        book.id === id ? { ...book, ...changes } : book
      )
    );
  }

  function startReading(id) {
  updateBook(id, {
    status: "reading",
    currentPage: 0,
    progress: 0,
  });
}


function updateReadingProgress(id, currentPage) {
  setBooks((previous) =>
    previous.map((book) => {
      if (book.id !== id) return book;

      const totalPages = Number(book.pages);
      const page = Number(currentPage);

      if (
        !Number.isInteger(totalPages) ||
        totalPages <= 0 ||
        !Number.isInteger(page) ||
        page < 0 ||
        page > totalPages
      ) {
        return book;
      }

      const progress = Math.round(
        (page / totalPages) * 100
      );

      const finished = page === totalPages;

      return {
        ...book,
        currentPage: page,
        progress,
        status: finished ? "finished" : "reading",
        finishedDate: finished
          ? new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : undefined,
          finishedAt: finished
  ? (book.finishedAt || new Date().toISOString())
  : null,
      };
    })
  );
}


  return {
    books,
    addBook,
    removeBook,
    updateBook,
    startReading,
    updateReadingProgress,
  };
}
