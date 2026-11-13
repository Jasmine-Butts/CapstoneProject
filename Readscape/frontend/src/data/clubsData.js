export const initialClubs = [
  {
    id: 1,
    name: "Quiet Readers",
    members: 18,
    description:
      "A small reading circle for literary fiction, reflective essays, and slow reading.",
    currentBook: "The Quiet Wood",
    nextMeeting: "Oct 12",
    joined: true,
  },
  {
    id: 2,
    name: "Pages & Coffee",
    members: 26,
    description:
      "Monthly conversations about contemporary fiction, memoirs, and books worth recommending.",
    currentBook: "Tidewater Letters",
    nextMeeting: "Oct 18",
    joined: true,
  },
  {
    id: 3,
    name: "History After Hours",
    members: 34,
    description:
      "For readers interested in history, biography, and the stories behind major events.",
    currentBook: "The Orchard Ledger",
    nextMeeting: "Oct 24",
    joined: false,
  },
  {
    id: 4,
    name: "Poetry at Dusk",
    members: 12,
    description:
      "A relaxed group for reading and discussing one poetry collection at a time.",
    currentBook: "Collected Light",
    nextMeeting: "Oct 28",
    joined: false,
  },
];

export const suggestedClubs = [
  {
    id: 101,
    name: "Around the World",
    category: "World literature",
    members: 29,
    description:
      "One book each month from a different country, language, or culture.",
  },
  {
    id: 102,
    name: "The Long Read",
    category: "Classics",
    members: 17,
    description:
      "A slower reading club for long novels and books that deserve extra time.",
  },
  {
    id: 103,
    name: "Notes in the Margin",
    category: "Essays",
    members: 21,
    description:
      "Essays, annotations, and conversations about the ideas that stay with us.",
  },
];

export function searchClubs(clubs, searchTerm) {
  const search = searchTerm.trim().toLowerCase();

  if (!search) {
    return clubs;
  }

  return clubs.filter((club) => {
    return (
      club.name.toLowerCase().includes(search) ||
      club.description.toLowerCase().includes(search) ||
      club.currentBook.toLowerCase().includes(search)
    );
  });
}

export function getClubStats(clubs) {
  return {
    joined: clubs.filter((club) => club.joined).length,

    readersNearby: clubs.reduce(
      (total, club) => total + club.members,
      0
    ),

    discover: clubs.filter(
      (club) => !club.joined
    ).length,
  };
}

export function joinClub(clubs, clubId) {
  return clubs.map((club) =>
    club.id === clubId
      ? { ...club, joined: true }
      : club
  );
}

export function leaveClub(clubs, clubId) {
  return clubs.map((club) =>
    club.id === clubId
      ? { ...club, joined: false }
      : club
  );
}