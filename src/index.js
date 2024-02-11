const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const { checkDrawCondition, checkWinCondition } = require("./utils/logic");
const { addUser, removeUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let gameState = {
  options: Array(9).fill(null), // Represents a  3x3 game options
  currentPlayer: "X", // The current player
  movesCount: 0, // Number of moves made
  status: "waiting", // Status of the game
};

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    if (getUsersInRoom(room).length === 2) {
      gameState.status = "ongoing";
      io.emit("update", gameState);
    }

    if (getUsersInRoom(room).length < 2 || gameState.status !== "ongoing") {
      gameState = {
        options: Array(9).fill(null), // Represents a  3x3 game options
        currentPlayer: "X", // The current player
        movesCount: 0, // Number of moves made
        status: "waiting", // Status of the game
      };
      io.emit("update", gameState);
    }

    callback();
  });

  // Send initial game state to the newly connected player
  socket.emit("init", gameState);

  socket.on("makeMove", ({ index, playerMark }) => {
    if (gameState.status !== "ongoing" || gameState.options[index] !== null) {
      return; // Invalid move
    }

    // Make the move
    gameState.options[index] = playerMark;
    gameState.movesCount++;

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";

    // Check for win or draw
    if (checkWinCondition(gameState.options, playerMark)) {
      gameState.status = "won";
    } else if (checkDrawCondition(gameState.options, gameState.currentPlayer)) {
      gameState.status = "draw";
    }

    // Broadcast the updated game state to all players
    io.emit("update", gameState);
  });

  socket.on("restartGame", () => {
    // Reset the game state
    gameState = {
      options: Array(9).fill(null),
      currentPlayer: "X", // Or randomly decide who goes first
      movesCount: 0,
      status: "ongoing",
    };

    // Broadcast the updated game state to all players
    io.emit("update", gameState);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    gameState.status = "waiting";

    if (user) {
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
