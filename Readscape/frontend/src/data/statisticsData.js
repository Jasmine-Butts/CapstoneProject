export const statisticsSummary = [
  {
    id: 1,
    value: "26",
    label: "Books finished",
  },
  {
    id: 2,
    value: "7,840",
    label: "Pages read",
  },
  {
    id: 3,
    value: "187",
    label: "Hours reading",
  },
  {
    id: 4,
    value: "12",
    label: "Day streak",
  },
];

export const monthlyStatistics = [
  { month: "Jan", books: 2, pages: 604 },
  { month: "Feb", books: 3, pages: 830 },
  { month: "Mar", books: 1, pages: 298 },
  { month: "Apr", books: 4, pages: 1120 },
  { month: "May", books: 3, pages: 880 },
  { month: "Jun", books: 2, pages: 620 },
  { month: "Jul", books: 5, pages: 1480 },
  { month: "Aug", books: 3, pages: 910 },
  { month: "Sep", books: 2, pages: 680 },
  { month: "Oct", books: 1, pages: 418 },
];

export const genreStatistics = [
  {
    name: "Literary fiction",
    percentage: 38,
  },
  {
    name: "Nature writing",
    percentage: 22,
  },
  {
    name: "Memoir",
    percentage: 16,
  },
  {
    name: "History",
    percentage: 14,
  },
  {
    name: "Poetry",
    percentage: 10,
  },
];

export const readingInsights = [
  {
    id: 1,
    label: "Average book length",
    value: "302 pages",
  },
  {
    id: 2,
    label: "Average rating you give",
    value: "4.1 / 5",
  },
  {
    id: 3,
    label: "Favourite time to read",
    value: "After 9 pm",
  },
];

export function getBestMonth(data) {
  return data.reduce((bestMonth, currentMonth) => {
    if (currentMonth.books > bestMonth.books) {
      return currentMonth;
    }

    return bestMonth;
  }, data[0]);
}