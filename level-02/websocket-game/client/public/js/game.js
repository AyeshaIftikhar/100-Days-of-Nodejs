class TicTacToeClient {
  constructor() {
    this.socket = new WebSocket(`ws://${window.location.host}`);
    this.gameId = null;
    this.playerSymbol = null;
    this.currentTurn = null;
    this.gameActive = false;
    
    this.statusElement = document.getElementById('status');
    this.gameContainer = document.getElementById('game-container');
    this.waitingElement = document.getElementById('waiting');
    this.playerSymbolElement = document.getElementById('player-symbol');
    this.currentTurnElement = document.getElementById('current-turn');
    this.gameOverElement = document.getElementById('game-over');
    this.gameResultElement = document.getElementById('game-result');
    this.rematchBtn = document.getElementById('rematch-btn');
    this.boardElement = document.getElementById('board');
    
    this.setupEventListeners();
    this.setupSocket();
  }
  
  setupEventListeners() {
    // Cell click handler
    this.boardElement.addEventListener('click', (e) => {
      if (!this.gameActive || this.currentTurn !== this.playerSymbol) return;
      
      const cell = e.target.closest('.cell');
      if (!cell) return;
      
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      
      this.socket.send(JSON.stringify({
        type: 'move',
        gameId: this.gameId,
        row,
        col
      }));
    });
    
    // Rematch button
    this.rematchBtn.addEventListener('click', () => {
      this.socket.send(JSON.stringify({
        type: 'rematch',
        gameId: this.gameId
      }));
    });
  }
  
  setupSocket() {
    this.socket.onopen = () => {
      this.statusElement.textContent = 'Connected to server. Joining game...';
      this.socket.send(JSON.stringify({ type: 'join' }));
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'waiting':
          this.handleWaiting();
          break;
        case 'gameStart':
          this.handleGameStart(data);
          break;
        case 'move':
          this.handleMove(data);
          break;
        case 'rematchRequested':
          this.handleRematchRequested();
          break;
        case 'rematchAccepted':
          this.handleRematchAccepted(data);
          break;
        case 'opponentDisconnected':
          this.handleOpponentDisconnected();
          break;
      }
    };
    
    this.socket.onclose = () => {
      this.statusElement.textContent = 'Disconnected from server. Refresh page to reconnect.';
      this.gameContainer.classList.add('hidden');
      this.waitingElement.classList.add('hidden');
    };
  }
  
  handleWaiting() {
    this.statusElement.textContent = 'Connected to server';
    this.gameContainer.classList.add('hidden');
    this.waitingElement.classList.remove('hidden');
  }
  
  handleGameStart(data) {
    this.gameId = data.gameId;
    this.playerSymbol = data.symbol;
    this.currentTurn = 'X'; // X always starts
    this.gameActive = true;
    
    this.playerSymbolElement.textContent = this.playerSymbol;
    this.currentTurnElement.textContent = this.currentTurn;
    
    this.waitingElement.classList.add('hidden');
    this.gameContainer.classList.remove('hidden');
    this.gameOverElement.classList.add('hidden');
    
    // Clear the board
    document.querySelectorAll('.cell').forEach(cell => {
      cell.textContent = '';
    });
  }
  
  handleMove(data) {
    // Update board
    const cell = document.querySelector(`.cell[data-row="${data.row}"][data-col="${data.col}"]`);
    cell.textContent = data.symbol;
    
    // Update turn
    this.currentTurn = data.currentPlayer;
    this.currentTurnElement.textContent = this.currentTurn;
    
    // Check for game over
    if (data.winner || data.isDraw) {
      this.gameActive = false;
      this.gameOverElement.classList.remove('hidden');
      
      if (data.winner) {
        this.gameResultElement.textContent = data.winner === this.playerSymbol 
          ? 'You won!' 
          : 'You lost!';
      } else {
        this.gameResultElement.textContent = 'Draw!';
      }
    }
  }
  
  handleRematchRequested() {
    this.gameResultElement.textContent = 'Opponent wants a rematch!';
    this.gameOverElement.classList.remove('hidden');
  }
  
  handleRematchAccepted(data) {
    this.playerSymbol = data.symbol;
    this.currentTurn = 'X';
    this.gameActive = true;
    
    this.playerSymbolElement.textContent = this.playerSymbol;
    this.currentTurnElement.textContent = this.currentTurn;
    this.gameOverElement.classList.add('hidden');
    
    // Clear the board
    document.querySelectorAll('.cell').forEach(cell => {
      cell.textContent = '';
    });
  }
  
  handleOpponentDisconnected() {
    this.gameActive = false;
    this.gameResultElement.textContent = 'Opponent disconnected!';
    this.gameOverElement.classList.remove('hidden');
  }
}

// Initialize the game when the page loads
window.onload = () => {
  new TicTacToeClient();
};