const users = [];

const addUser = ({ id, username, room }) => {
  // Allow only two players per room
  if (getUsersInRoom(room).length >= 2) {
    return {
      error: "Only two players allowed per room.",
    };
  }
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required.",
    };
  }

  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use.",
    };
  }

  // Store user
  const otherUser = users.find((user) => user.room === room);
  let letter = "X";
  if (otherUser?.letter === "X") {
    letter = "O";
  }
  const user = { id, username, room, letter };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter(
    (user) => user.room === room.trim().toLowerCase()
  );
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
