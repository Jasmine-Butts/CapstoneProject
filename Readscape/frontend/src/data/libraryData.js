export const libraryBooks = [
  {
    id: 1,
    title: "The Quiet Wood",
    author: "E. Marchetti",
    genre: "Literary fiction",
    pages: 310,
    status: "reading",
    progress: 64,
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 2,
    title: "Salt & Summit",
    author: "R. Adeyemi",
    genre: "Adventure",
    pages: 402,
    status: "reading",
    progress: 22,
    cover:
      "https://images.unsplash.com/photo-1672928386554-c48b7bba5268?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 3,
    title: "Tidewater Letters",
    author: "J. Okafor",
    genre: "Epistolary",
    pages: 288,
    status: "finished",
    rating: 4.0,
    finishedDate: "Aug 30",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 4,
    title: "Field Notes on Growing",
    author: "L. Brennan",
    genre: "Memoir",
    pages: 224,
    status: "finished",
    rating: 5.0,
    finishedDate: "Sep 24",
    cover:
      "https://images.unsplash.com/photo-1769490315625-6e669d53e698?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 5,
    title: "Nightfall Library",
    author: "S. Varga",
    genre: "Fantasy",
    pages: 356,
    status: "finished",
    rating: 4.5,
    finishedDate: "Sep 12",
    cover:
      "https://images.unsplash.com/photo-1672928386554-c48b7bba5268?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 6,
    title: "The Cartographer's Year",
    author: "M. Ellery",
    genre: "Historical fiction",
    pages: 340,
    status: "want",
    cover:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 7,
    title: "A Field Guide to Silence",
    author: "T. Nakamura",
    genre: "Essays",
    pages: 196,
    status: "want",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 8,
    title: "Winter Light on the Fjord",
    author: "I. Solberg",
    genre: "Literary fiction",
    pages: 272,
    status: "want",
    cover:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=600&q=85",
  },
];

export function getLibraryCounts(books) {
  return {
    reading: books.filter(
      (book) => book.status === "reading"
    ).length,

    finished: books.filter(
      (book) => book.status === "finished"
    ).length,

    want: books.filter(
      (book) => book.status === "want"
    ).length,
  };
}

export function filterLibraryBooks(
  books,
  activeFilter,
  searchTerm
) {
  const search = searchTerm.trim().toLowerCase();

  return books.filter((book) => {
    const matchesFilter =
      activeFilter === "all" ||
      book.status === activeFilter;

    const matchesSearch =
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });
}