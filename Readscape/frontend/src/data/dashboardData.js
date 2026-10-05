export const dashboardData = {
  userName: "Maya",

  goalCurrent: 24,
  goalTarget: 35,
  aheadOfSchedule: 3,

  currentlyReading: {
    id: 1,
    title: "The Quiet Wood",
    author: "E. Marchetti",
    progress: 64,
    currentPage: 198,
    totalPages: 310,
    quote:
      "The path changed each time she looked away, as if the forest were remembering a different story.",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },

  readingProgress: [
    {
      value: "24",
      label: "Books read",
    },
    {
      value: "42m",
      label: "Daily average",
    },
    {
      value: "18",
      label: "Day streak",
    },
    {
      value: "7,410",
      label: "Pages total",
    },
  ],

  readingNote: {
    quote:
      "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.",
    author: "Malorie Blackman",
  },

  monthlyActivity: [
    {
      month: "Jul",
      pages: 610,
    },
    {
      month: "Aug",
      pages: 720,
    },
    {
      month: "Sep",
      pages: 765,
    },
    {
      month: "Oct",
      pages: 842,
    },
  ],

  readingQueue: [
    {
      id: 1,
      number: "01",
      title: "Salt & Summit",
      author: "R. Adeyemi",
      cover:
        "https://images.unsplash.com/photo-1672928386554-c48b7bba5268?auto=format&fit=crop&w=500&q=85",
    },
    {
      id: 2,
      number: "02",
      title: "Tidewater Letters",
      author: "J. Okafor",
      cover:
        "https://images.unsplash.com/photo-1769490315625-6e669d53e698?auto=format&fit=crop&w=500&q=85",
    },
    {
      id: 3,
      number: "03",
      title: "The Quiet Wood",
      author: "E. Marchetti",
      cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
    },
  ],

  recentBooks: [
    {
      id: 1,
      title: "Field Notes on Growing",
      author: "L. Brennan",
      finished: "Sep 24",
      rating: "5.0",
      cover:
        "https://images.unsplash.com/photo-1769490315625-6e669d53e698?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 2,
      title: "Nightfall Library",
      author: "S. Varga",
      finished: "Sep 12",
      rating: "4.5",
      cover:
        "https://images.unsplash.com/photo-1672928386554-c48b7bba5268?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 3,
      title: "Tidewater Letters",
      author: "J. Okafor",
      finished: "Aug 30",
      rating: "4.0",
      cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85",
    },
  ],
};

export function getMonthlyBarHeight(pages) {
  return pages / 10;
}