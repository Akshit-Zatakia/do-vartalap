const path = require("path");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

let count = 0;

io.on("connection", (s) => {
  console.log("new connection");

  s.on("join", (options, callback) => {
    const { error, user } = addUser({ id: s.id, ...options });

    if (error) {
      return callback(error);
    }

    s.join(user.room);
    s.emit("message", generateMessage("Chatty", "Welcome!"));
    s.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Chatty", `${user.username} has joined`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  s.on("sendMessage", (message, callback) => {
    const user = getUser(s.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("Message sent.");
  });

  s.on("sendLocation", (coords, callback) => {
    const user = getUser(s.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
    callback("Location sent.");
  });

  s.on("disconnect", () => {
    const user = removeUser(s.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Chatty", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
