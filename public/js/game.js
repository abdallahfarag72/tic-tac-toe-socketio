const socket = io();

const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const cells = document.querySelectorAll(".cell");

const statusText = document.querySelector("#statusText");

const restartBtn = document.querySelector("#restartBtn");

let roomUsers = [];

let state = {
  options: Array(9).fill(null), // Represents a  3x3 game options
  currentPlayer: "X", // The current player
  movesCount: 0, // Number of moves made
  status: "ongoing", // Status of the game
};

function makeMove(index, playerMark) {
  if (!state.options[index]) {
    // Emit the 'makeMove' event to the server with the index and player's mark
    socket.emit("makeMove", { index, playerMark });
  }
}

socket.on("init", (gameState) => {
  state = gameState;
  renderBoard();
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    player1: users.length > 0 ? users[0].username : "Player 1",
    player2: users.length > 1 ? users[1].username : "Player 2",
  });
  document.querySelector("#sidebar").innerHTML = html;
  roomUsers = users;
});

socket.on("update", (updatedState) => {
  state = updatedState;
  renderBoard();
});

restartBtn.addEventListener("click", () => {
  state = {
    options: Array(9).fill(null), // Represents a  3x3 game options
    currentPlayer: "X", // The current player
    movesCount: 0, // Number of moves made
    status: "ongoing", // Status of the game
  };
  socket.emit("restartGame");
});

function renderBoard() {
  const activePlayer = roomUsers.find(
    (player) => player.letter === state.currentPlayer
  );
  for (let i = 0; i < state.options.length; i++) {
    cells[i].textContent = state.options[i];
    cells[i].style.pointerEvents = "auto";
    cells[i].style.backgroundColor = "white";

    if (username.toLowerCase() !== activePlayer.username) {
      cells[i].style.pointerEvents = "none";
      cells[i].style.backgroundColor = "grey";
    } else {
      cells[i].style.pointerEvents = "auto";
      cells[i].style.backgroundColor = "white";
      cells[i].addEventListener("click", () =>
        makeMove(i, state.currentPlayer)
      );
    }
  }

  if (state.status == "won") {
    const winningLetter = state.currentPlayer === "X" ? "O" : "X";
    const winningPlayer = roomUsers.find(
      (player) => player.letter === winningLetter
    );
    statusText.textContent = `${winningPlayer.username} (${winningLetter}) Won!`;
    cells.forEach((cell) => {
      cell.style.pointerEvents = "none";
      cell.style.backgroundColor = "#7c5cbf";
    });
  } else if (state.status == "draw") {
    statusText.textContent = "It's a draw! Click reset to try again.";
    cells.forEach((cell) => {
      cell.style.pointerEvents = "none";
      cell.style.backgroundColor = "grey";
    });
  } else if (state.status == "waiting") {
    statusText.textContent = "Waiting for another player to connect...";
    cells.forEach((cell) => {
      cell.style.pointerEvents = "none";
      cell.style.backgroundColor = "grey";
    });
  } else {
    statusText.textContent = `${activePlayer.username}'s (${state.currentPlayer}) turn`;
  }
}

// Bind the renderBoard function to window resize event for responsiveness
window.addEventListener("resize", renderBoard);

// Render the initial game board
renderBoard();
