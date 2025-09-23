import { WebSocketServer, WebSocket } from 'ws';
import { blockchain } from '../simulator/blockchain';
import { config } from '../config';

// Define message types for WebSocket communication
interface WebSocketMessage {
  type: string;
  data?: any;
}

/**
 * Sets up WebSocket handlers for real-time updates
 */
export function setupWebSocketHandlers(wss: WebSocketServer): void {
  // Track connected clients
  const clients = new Set<WebSocket>();
  
  // Set up ping interval to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, config.websocket.pingInterval);
  
  // Listen for WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    // Add client to tracked set
    clients.add(ws);
    console.log(`Client connected. Total clients: ${clients.size}`);
    
    // Send welcome message with current state
    const welcomeMessage: WebSocketMessage = {
      type: 'welcome',
      data: {
        networkStats: blockchain.getNetworkStats(),
        latestBlock: blockchain.getLatestBlock(),
        pendingTransactions: blockchain.getPendingTransactions()
      }
    };
    ws.send(JSON.stringify(welcomeMessage));
    
    // Set up blockchain event listeners
    const blockListener = (block: any) => {
      const message: WebSocketMessage = {
        type: 'newBlock',
        data: block
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };
    
    const transactionListener = (transaction: any) => {
      const message: WebSocketMessage = {
        type: 'newTransaction',
        data: transaction
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };
    
    const miningListener = (miningUpdate: any) => {
      const message: WebSocketMessage = {
        type: 'miningUpdate',
        data: miningUpdate
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };
    
    // Register listeners
    blockchain.on('block', blockListener);
    blockchain.on('transaction', transactionListener);
    blockchain.on('mining', miningListener);
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as WebSocketMessage;
        
        switch (parsedMessage.type) {
          case 'getNetworkStats':
            const statsMessage: WebSocketMessage = {
              type: 'networkStats',
              data: blockchain.getNetworkStats()
            };
            ws.send(JSON.stringify(statsMessage));
            break;
            
          case 'getBlocks':
            const blocksMessage: WebSocketMessage = {
              type: 'blocks',
              data: blockchain.getBlocks()
            };
            ws.send(JSON.stringify(blocksMessage));
            break;
            
          case 'getBlock':
            if (parsedMessage.data && typeof parsedMessage.data.index === 'number') {
              const block = blockchain.getBlock(parsedMessage.data.index);
              const blockMessage: WebSocketMessage = {
                type: 'block',
                data: block
              };
              ws.send(JSON.stringify(blockMessage));
            }
            break;
            
          case 'getPendingTransactions':
            const pendingTxMessage: WebSocketMessage = {
              type: 'pendingTransactions',
              data: blockchain.getPendingTransactions()
            };
            ws.send(JSON.stringify(pendingTxMessage));
            break;
            
          case 'search':
            if (parsedMessage.data && typeof parsedMessage.data.query === 'string') {
              const results = blockchain.search(parsedMessage.data.query);
              const searchMessage: WebSocketMessage = {
                type: 'searchResults',
                data: results
              };
              ws.send(JSON.stringify(searchMessage));
            }
            break;
            
          default:
            console.log(`Unknown message type: ${parsedMessage.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      // Remove listeners
      blockchain.off('block', blockListener);
      blockchain.off('transaction', transactionListener);
      blockchain.off('mining', miningListener);
      
      // Remove from tracked clients
      clients.delete(ws);
      console.log(`Client disconnected. Total clients: ${clients.size}`);
    });
  });
  
  // Clean up on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
}
