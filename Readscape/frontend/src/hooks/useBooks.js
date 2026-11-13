
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

function normalizeBook(book) {
  const pages = Number(book.pages) || 0;
  const currentPage = Number(book.currentPage ?? book.current_page ?? 0);

  return {
    ...book,
    author: book.author || (book.authors || []).join(", "),
    genre: book.genre || (book.categories || []).join(", ") || "Other",
    pages,
    currentPage,
    progress: pages > 0
      ? Math.round((currentPage / pages) * 100)
      : 0,
    addedAt: book.addedAt || book.added_at || new Date().toISOString(),
    finishedAt: book.finishedAt || book.finished_at || null,
    cover: book.cover || "",
  };
}

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const booksRef = useRef([]);
  const requestIdRef = useRef(0);

  const saveBooks = useCallback((next) => {
    booksRef.current = next;
    setBooks(next);
  }, []);

  const loadBooks = useCallback(async () => {
  const requestId = ++requestIdRef.current;
  const token = sessionStorage.getItem("readscapeToken");

  // Clear books from the previous account immediately.
  saveBooks([]);
  setError("");

  if (!token) {
    setLoading(false);
    return;
  }

  setLoading(true);

  try {
    const data = await api("/library");

    // Ignore responses belonging to an old session.
    if (
      requestId !== requestIdRef.current ||
      sessionStorage.getItem("readscapeToken") !== token
    ) {
      return;
    }

    saveBooks((data.books || []).map(normalizeBook));
  } catch (err) {
    if (
      requestId !== requestIdRef.current ||
      sessionStorage.getItem("readscapeToken") !== token
    ) {
      return;
    }

    setError(err.message);
    console.error("Could not load library:", err);
  } finally {
    if (
      requestId === requestIdRef.current &&
      sessionStorage.getItem("readscapeToken") === token
    ) {
      setLoading(false);
    }
  }
}, [saveBooks]);

 useEffect(() => {
    loadBooks();

    const handleAuthChange = () => {
      loadBooks();
    };

    window.addEventListener(
      "readscape:auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "readscape:auth-changed",
        handleAuthChange
      );

      requestIdRef.current += 1;
    };
  }, [loadBooks]);


  async function addBook(book) {
    setError("");

    try {
      const data = await api("/library", {
        method: "POST",
        body: JSON.stringify({
          title: book.title.trim(),
          author: book.author.trim(),
          genre: (book.genre || "Other").trim() || "Other",
          pages: Number(book.pages),
          cover: (book.cover || "").trim(),
        }),
      });

      const newBook = normalizeBook(data.book);

      saveBooks([...booksRef.current, newBook]);

      return newBook;
    } catch (err) {
      setError(err.message);
      console.error("Could not add book:", err);
      return null;
    }
  }

  async function removeBook(id) {
    setError("");

    try {
      await api(`/library/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      saveBooks(booksRef.current.filter(book => book.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Could not remove book:", err);
      return false;
    }
  }

  
  async function updateBook(id, changes) {
    setError("");

    const book = booksRef.current.find(
      item => item.id === id
    );

    if (!book) {
      setError("Book not found.");
      return false;
    }

    const detailFields = [
      "title",
      "author",
      "genre",
      "pages",
      "cover"
    ];

    const isEditingDetails = detailFields.some(
      field => Object.hasOwn(changes, field)
    );

    try {
      // Edit title, author, genre, pages, or cover
      if (isEditingDetails) {
        const updatedDetails = {
          title: changes.title ?? book.title,
          author: changes.author ?? book.author,
          genre: changes.genre ?? book.genre ?? "Other",
          pages: Number(changes.pages ?? book.pages),
          cover: changes.cover ?? book.cover ?? ""
        };

        if (
          !updatedDetails.title.trim() ||
          !updatedDetails.author.trim() ||
          !Number.isSafeInteger(updatedDetails.pages) ||
          updatedDetails.pages <= 0 ||
          updatedDetails.pages < book.currentPage
        ) {
          setError("Enter valid book details.");
          return false;
        }

        await api(
          `/library/${encodeURIComponent(id)}/details`,
          {
            method: "PATCH",
            body: JSON.stringify(updatedDetails)
          }
        );

        const progress = Math.round(
          (book.currentPage / updatedDetails.pages) * 100
        );

        saveBooks(
          booksRef.current.map(item =>
            item.id === id
              ? {
                  ...item,
                  ...updatedDetails,
                  progress
                }
              : item
          )
        );

        return true;
      }

      // Update reading status or progress
      const status = changes.status ?? book.status;

      const currentPage = Number(
        changes.currentPage ?? book.currentPage ?? 0
      );

      if (
        !["want", "reading", "finished"].includes(status) ||
        !Number.isSafeInteger(currentPage) ||
        currentPage < 0 ||
        (book.pages > 0 && currentPage > book.pages)
      ) {
        setError("Invalid reading status or page number.");
        return false;
      }

      const data = await api(
        `/library/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status, currentPage })
        }
      );

      const progress = book.pages > 0
        ? Math.round((currentPage / book.pages) * 100)
        : 0;

      const finishedAt = status === "finished"
        ? data.finishedAt || null
        : null;

      saveBooks(
        booksRef.current.map(item =>
          item.id === id
            ? {
                ...item,
                status,
                currentPage,
                progress,
                finishedAt,
                finishedDate: finishedAt
                  ? new Date(finishedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric"
                      }
                    )
                  : undefined
              }
            : item
        )
      );

      return true;
    } catch (err) {
      setError(err.message);
      console.error("Could not update book:", err);
      return false;
    }
  }


  function startReading(id) {
    return updateBook(id, {
      status: "reading",
      currentPage: 0,
    });
  }

  function updateReadingProgress(id, currentPage) {
    const book = booksRef.current.find(book => book.id === id);
    if (!book) {
      setError("Book not found.");
      return Promise.resolve(false);
    }

    const page = Number(currentPage);

    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page > book.pages
    ) {
      setError("Enter a valid page number.");
      return Promise.resolve(false);
    }

    return updateBook(id, {
      currentPage: page,
      status: page === book.pages ? "finished" : "reading",
    });
  }

  return {
    books,
    loading,
    error,
    loadBooks,
    addBook,
    removeBook,
    updateBook,
    startReading,
    updateReadingProgress,
  };
}
