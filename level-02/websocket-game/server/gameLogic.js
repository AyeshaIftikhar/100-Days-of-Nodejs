class GameLogic {
  constructor(gameId, playerX, playerO) {
    this.gameId = gameId;
    this.playerX = playerX;
    this.playerO = playerO;
    this.board = Array(3).fill().map(() => Array(3).fill(null));
    this.currentPlayer = 'X';
    this.rematchRequested = [];
  }

  makeMove(player, row, col) {
    // Validate move
    if (this.board[row][col] !== null) return null;
    
    const symbol = player === this.playerX ? 'X' : 'O';
    if (symbol !== this.currentPlayer) return null;

    // Make the move
    this.board[row][col] = symbol;
    
    // Check for winner or draw
    const winner = this.checkWinner();
    const isDraw = !winner && this.isBoardFull();
    
    // Switch player if game continues
    if (!winner && !isDraw) {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    return {
      symbol,
      winner,
      isDraw,
      row,
      col
    };
  }

  checkWinner() {
    const lines = [
      // Rows
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      // Columns
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // Diagonals
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (this.board[a[0]][a[1]] &&
          this.board[a[0]][a[1]] === this.board[b[0]][b[1]] &&
          this.board[a[0]][a[1]] === this.board[c[0]][c[1]]) {
        return this.board[a[0]][a[1]];
      }
    }
    return null;
  }

  isBoardFull() {
    return this.board.every(row => row.every(cell => cell !== null));
  }

  reset() {
    this.board = Array(3).fill().map(() => Array(3).fill(null));
    this.currentPlayer = 'X';
  }
}

module.exports = GameLogic;