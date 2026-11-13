export const initialFriendRequests = [
  {
    id: 1,
    initials: "NH",
    name: "Noor Haddad",
    username: "@noor.reads",
  },
];

export const initialFriends = [
  {
    id: 1,
    initials: "JR",
    name: "Jonah Reyes",
    username: "@jonahreads",
    currentBook: "The Quiet Wood",
    booksThisYear: 31,
  },
  {
    id: 2,
    initials: "PS",
    name: "Priya Shah",
    username: "@priya.pages",
    currentBook: "Tidewater Letters",
    booksThisYear: 18,
  },
  {
    id: 3,
    initials: "LO",
    name: "Lena Okafor",
    username: "@lenabooks",
    currentBook: "Salt & Summit",
    booksThisYear: 42,
  },
];

export const suggestedReaders = [
  {
    id: 101,
    initials: "AM",
    name: "Amina Malik",
    username: "@aminareads",
    favoriteGenre: "Literary fiction",
  },
  {
    id: 102,
    initials: "DR",
    name: "Daniel Ross",
    username: "@danielreads",
    favoriteGenre: "History",
  },
  {
    id: 103,
    initials: "SK",
    name: "Sara Khan",
    username: "@sara.books",
    favoriteGenre: "Memoir",
  },
];

export function searchFriends(
  friends,
  searchTerm
) {
  const search =
    searchTerm.trim().toLowerCase();

  if (!search) {
    return friends;
  }

  return friends.filter((friend) => {
    return (
      friend.name
        .toLowerCase()
        .includes(search) ||
      friend.username
        .toLowerCase()
        .includes(search)
    );
  });
}

export function acceptFriendRequest(
  friends,
  requests,
  request
) {
  const newFriend = {
    id: request.id + 1000,
    initials: request.initials,
    name: request.name,
    username: request.username,
    currentBook: "No current book",
    booksThisYear: 0,
  };

  const updatedFriends = [
    ...friends,
    newFriend,
  ];

  const updatedRequests =
    requests.filter(
      (item) => item.id !== request.id
    );

  return {
    updatedFriends,
    updatedRequests,
  };
}

export function removeFriend(
  friends,
  friendId
) {
  return friends.filter(
    (friend) => friend.id !== friendId
  );
}