const GameLogic = require('./gameLogic');

class WSServer {
  constructor(wss) {
    this.wss = wss;
    this.games = new Map(); // Store active games
    this.waitingPlayer = null; // Player waiting for an opponent

    this.wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'join':
          this.handleJoin(ws);
          break;
        case 'move':
          this.handleMove(ws, data);
          break;
        case 'rematch':
          this.handleRematch(ws, data.gameId);
          break;
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  }

  handleJoin(ws) {
    if (this.waitingPlayer) {
      // Start a new game with the waiting player
      const gameId = Date.now().toString();
      const game = new GameLogic(gameId, this.waitingPlayer, ws);
      
      this.games.set(gameId, game);
      this.waitingPlayer = null;
      
      // Notify both players
      game.playerX.send(JSON.stringify({
        type: 'gameStart',
        gameId,
        symbol: 'X',
        opponent: 'Player O'
      }));
      
      game.playerO.send(JSON.stringify({
        type: 'gameStart',
        gameId,
        symbol: 'O',
        opponent: 'Player X'
      }));
    } else {
      // No waiting player, become the waiting player
      this.waitingPlayer = ws;
      ws.send(JSON.stringify({
        type: 'waiting',
        message: 'Waiting for an opponent...'
      }));
    }
  }

  handleMove(ws, data) {
    const game = this.games.get(data.gameId);
    if (!game) return;

    const result = game.makeMove(ws, data.row, data.col);
    if (result) {
      // Broadcast move to both players
      game.playerX.send(JSON.stringify({
        type: 'move',
        gameId: data.gameId,
        row: data.row,
        col: data.col,
        symbol: result.symbol,
        currentPlayer: game.currentPlayer,
        winner: result.winner,
        isDraw: result.isDraw
      }));

      game.playerO.send(JSON.stringify({
        type: 'move',
        gameId: data.gameId,
        row: data.row,
        col: data.col,
        symbol: result.symbol,
        currentPlayer: game.currentPlayer,
        winner: result.winner,
        isDraw: result.isDraw
      }));
    }
  }

  handleRematch(ws, gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.rematchRequested = game.rematchRequested || [];
    game.rematchRequested.push(ws);

    // If both players requested rematch, start new game
    if (game.rematchRequested.length === 2) {
      game.reset();
      game.rematchRequested = [];
      
      game.playerX.send(JSON.stringify({
        type: 'rematchAccepted',
        gameId,
        symbol: 'X'
      }));
      
      game.playerO.send(JSON.stringify({
        type: 'rematchAccepted',
        gameId,
        symbol: 'O'
      }));
    } else {
      // Notify other player about rematch request
      const otherPlayer = ws === game.playerX ? game.playerO : game.playerX;
      otherPlayer.send(JSON.stringify({
        type: 'rematchRequested',
        gameId
      }));
    }
  }

  handleDisconnect(ws) {
    console.log('Client disconnected');
    
    // Remove from waiting player if needed
    if (this.waitingPlayer === ws) {
      this.waitingPlayer = null;
    }
    
    // Find and end any games this player was in
    for (const [gameId, game] of this.games) {
      if (game.playerX === ws || game.playerO === ws) {
        const otherPlayer = game.playerX === ws ? game.playerO : game.playerX;
        if (otherPlayer) {
          otherPlayer.send(JSON.stringify({
            type: 'opponentDisconnected',
            gameId
          }));
        }
        this.games.delete(gameId);
        break;
      }
    }
  }
}

module.exports = WSServer;