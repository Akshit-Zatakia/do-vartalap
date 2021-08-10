const users = [];

// add user
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the user
  if (!username || !room) {
    return {
      error: "Username and room are required.",
    };
  }

  // check for existing user
  const existingUser = users.find((u) => {
    return u.room === room && u.username === username;
  });

  // validation username
  if (existingUser) {
    return {
      error: "User already exists.",
    };
  }

  // store the user
  const user = { id, username, room };

  users.push(user);
  return { user };
};

// remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  // check for user
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// get User
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// get Users in room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
