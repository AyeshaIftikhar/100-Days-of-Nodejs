/**
 * Block model - the core structure of the blockchain
 */
export interface Block {
  index: number;           // Position of the block in the chain
  timestamp: number;       // When the block was created
  transactions: Transaction[]; // List of transactions in this block
  previousHash: string;    // Hash of the previous block
  hash: string;            // Hash of this block
  nonce: number;           // Value used in mining (proof of work)
  difficulty: number;      // Mining difficulty
  miner: string;           // Address of the miner who created this block
  size: number;            // Size of the block in bytes
}

/**
 * Transaction model - records transfers between addresses
 */
export interface Transaction {
  id: string;              // Unique identifier for the transaction
  timestamp: number;       // When the transaction was created
  sender: string;          // Address of the sender
  recipient: string;       // Address of the recipient
  amount: number;          // Amount being transferred
  fee: number;             // Transaction fee
  signature: string;       // Digital signature to verify authenticity
  status: TransactionStatus; // Current status of the transaction
  blockId?: number;        // ID of the block containing this transaction (if mined)
}

/**
 * Status of a transaction
 */
export enum TransactionStatus {
  PENDING = 'pending',     // Not yet included in a block
  CONFIRMED = 'confirmed', // Included in a block
  FAILED = 'failed'        // Failed to be included
}

/**
 * Wallet/Address model - represents an account on the blockchain
 */
export interface Address {
  address: string;         // The address (public key hash)
  balance: number;         // Current balance
  transactionCount: number; // Number of transactions
  firstSeen: number;       // Timestamp when first seen on the blockchain
  lastSeen: number;        // Timestamp when last seen on the blockchain
}

/**
 * Network statistics
 */
export interface NetworkStats {
  blockCount: number;      // Total number of blocks
  lastBlockTime: number;   // Timestamp of the last block
  difficulty: number;      // Current mining difficulty
  hashRate: number;        // Estimated network hash rate
  transactionCount: number; // Total number of transactions
  pendingTransactions: number; // Number of unconfirmed transactions
  activeAddresses: number; // Number of active addresses
}
