/**
 * Status of a transaction
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

/**
 * Represents a transaction in the blockchain
 */
export interface Transaction {
  id: string;
  timestamp: number;
  sender: string;
  recipient: string;
  amount: number;
  fee: number;
  signature: string;
  status: TransactionStatus;
  blockId?: number;
}

/**
 * Represents a block in the blockchain
 */
export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  size: number;
}

/**
 * Represents an address/wallet in the blockchain
 */
export interface Address {
  address: string;
  balance: number;
  transactionCount: number;
  firstSeen: number;
  lastSeen: number;
}

/**
 * Represents overall network statistics
 */
export interface NetworkStats {
  blockCount: number;
  lastBlockTime: number;
  difficulty: number;
  hashRate: number;
  transactionCount: number;
  pendingTransactions: number;
  activeAddresses: number;
}

/**
 * Mining update information
 */
export interface MiningUpdate {
  blockIndex: number;
  nonce: number;
  currentHash: string;
  completed?: boolean;
}

/**
 * WebSocket message types
 */
export interface WebSocketMessage {
  type: string;
  data?: any;
}
