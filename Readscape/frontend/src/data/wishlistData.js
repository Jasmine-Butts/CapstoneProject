export const wishlistBooks = [
  {
    id: 1,
    order: "01",
    title: "The Cartographer's Year",
    author: "M. Ellery",
    genre: "Historical fiction",
    pages: 340,
    note: "The one I keep walking past without buying.",
    waitingSince: "Aug 12",
    source: "the bookshop on Hill Street",
    nextUp: true,
    addedMonth: "August",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 2,
    order: "02",
    title: "A Field Guide to Silence",
    author: "T. Nakamura",
    genre: "Essays",
    pages: 196,
    note: "Short essays — good for the train.",
    waitingSince: "Sep 02",
    source: "Rania's recommendation",
    nextUp: true,
    addedMonth: "September",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 3,
    order: "03",
    title: "Small Hours in Lisbon",
    author: "A. Duarte",
    genre: "Memoir",
    pages: 232,
    note: "Saved the first chapter; want the whole thing.",
    waitingSince: "Oct 01",
    source: "the Sunday newsletter",
    nextUp: true,
    addedMonth: "October",
    cover:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 4,
    order: "04",
    title: "Winter Light on the Fjord",
    author: "I. Solberg",
    genre: "Literary fiction",
    pages: 272,
    note: "Slow, cold, beautiful — save it for November.",
    waitingSince: "Sep 21",
    source: "the library shelf",
    nextUp: false,
    addedMonth: "September",
    cover:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 5,
    order: "05",
    title: "The Orchard Ledger",
    author: "H. Vasquez",
    genre: "Family saga",
    pages: 418,
    note: "Three generations, one orchard, forty years.",
    waitingSince: "Oct 02",
    source: "a bookseller's note",
    nextUp: false,
    addedMonth: "October",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 6,
    order: "06",
    title: "Letters to a Young Gardener",
    author: "P. Whelan",
    genre: "Letters",
    pages: 184,
    note: "One letter a night before bed.",
    waitingSince: "Oct 04",
    source: "the Sunday newsletter",
    nextUp: false,
    addedMonth: "October",
    cover:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=85",
  },
];

export const recommendedBooks = [
  {
    id: 101,
    title: "Harbour Lights",
    author: "D. Ferreira",
    genre: "Novel",
    pages: 264,
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 102,
    title: "Notes from a Small Garden",
    author: "K. Ilves",
    genre: "Nature writing",
    pages: 208,
    cover:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 103,
    title: "The Night Ferry",
    author: "O. Brandt",
    genre: "Travel writing",
    pages: 302,
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=85",
  },
];

export const savedSources = [
  {
    name: "the Sunday newsletter",
    count: 2,
  },
  {
    name: "the bookshop on Hill Street",
    count: 1,
  },
  {
    name: "Rania's recommendation",
    count: 1,
  },
  {
    name: "the library shelf",
    count: 1,
  },
  {
    name: "a bookseller's note",
    count: 1,
  },
];

export function filterWishlistBooks(
  books,
  filter,
  searchTerm
) {
  const search = searchTerm.trim().toLowerCase();

  return books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search);

    let matchesFilter = true;

    if (filter === "next") {
      matchesFilter = book.nextUp;
    }

    if (filter === "october") {
      matchesFilter =
        book.addedMonth === "October";
    }

    return matchesSearch && matchesFilter;
  });
}

export function getWishlistStats(books) {
  return {
    waiting: books.length,

    pagesQueued: books.reduce(
      (total, book) => total + book.pages,
      0
    ),

    nextUp: books.filter(
      (book) => book.nextUp
    ).length,
  };
}