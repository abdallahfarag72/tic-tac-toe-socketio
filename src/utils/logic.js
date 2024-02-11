// Function to check if a player has won
function checkWinCondition(board, mark) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return lines.some((line) => line.every((i) => board[i] === mark));
}

// Function to check if the game is a draw
function checkDrawCondition(board, currentPlayer) {
  return (
    board.every((cell) => cell !== null) &&
    !checkWinCondition(board, currentPlayer)
  );
}

module.exports = {
  checkWinCondition,
  checkDrawCondition,
};
