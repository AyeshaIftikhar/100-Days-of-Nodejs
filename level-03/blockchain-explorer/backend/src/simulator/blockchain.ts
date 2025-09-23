import * as crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { 
  Block, 
  Transaction, 
  TransactionStatus,
  Address,
  NetworkStats
} from '../models/blockchain';

/**
 * BlockchainSimulator class
 * Simulates a simple blockchain with proof-of-work consensus
 */
export class BlockchainSimulator {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private difficulty: number = 4;
  private miningReward: number = 50;
  private addresses: Map<string, Address> = new Map();
  private minersAddresses: string[] = [];
  
  // Event listeners for real-time updates
  private listeners: { [key: string]: Function[] } = {
    'block': [],
    'transaction': [],
    'mining': []
  };
  
  constructor() {
    // Create some initial miner addresses
    for (let i = 0; i < 5; i++) {
      this.minersAddresses.push(this.createNewAddress());
    }
    
    // Create the genesis block
    this.createGenesisBlock();
  }
  
  /**
   * Creates the first block in the chain (genesis block)
   */
  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '0',
      nonce: 0,
      difficulty: this.difficulty,
      miner: 'Genesis',
      size: 0
    };
    
    // Calculate the hash for the genesis block
    genesisBlock.hash = this.calculateHash(genesisBlock);
    
    // Add the genesis block to the chain
    this.chain.push(genesisBlock);
  }
  
  /**
   * Calculates the hash of a block using SHA256
   */
  private calculateHash(block: Block): string {
    return crypto.SHA256(
      block.index + 
      block.previousHash + 
      block.timestamp + 
      JSON.stringify(block.transactions) + 
      block.nonce
    ).toString();
  }
  
  /**
   * Creates a new random address
   */
  public createNewAddress(): string {
    const address = crypto.SHA256(uuidv4()).toString().substring(0, 40);
    
    // Initialize the address record if it doesn't exist
    if (!this.addresses.has(address)) {
      this.addresses.set(address, {
        address,
        balance: 0,
        transactionCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      });
    }
    
    return address;
  }
  
  /**
   * Gets the latest block in the chain
   */
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  
  /**
   * Mines a new block with pending transactions
   */
  public mineBlock(minerAddress: string): Block {
    // Create a coinbase transaction (mining reward)
    const rewardTx: Transaction = {
      id: uuidv4(),
      timestamp: Date.now(),
      sender: '0x0000000000000000000000000000000000000000', // Coinbase (new coins)
      recipient: minerAddress,
      amount: this.miningReward,
      fee: 0,
      signature: '',
      status: TransactionStatus.CONFIRMED
    };
    
    // Add the coinbase transaction to the list of pending transactions
    this.pendingTransactions.unshift(rewardTx);
    
    // Take up to 10 pending transactions for this block
    const transactions = this.pendingTransactions.slice(0, 10);
    
    // Create a new block
    const newBlock: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions,
      previousHash: this.getLatestBlock().hash,
      hash: '',
      nonce: 0,
      difficulty: this.difficulty,
      miner: minerAddress,
      size: JSON.stringify(transactions).length
    };
    
    // Mine the block (find a valid hash)
    this.proofOfWork(newBlock);
    
    // Add the new block to the chain
    this.chain.push(newBlock);
    
    // Update transaction status and remove them from pending
    transactions.forEach(tx => {
      tx.status = TransactionStatus.CONFIRMED;
      tx.blockId = newBlock.index;
      
      // Update sender balance
      if (tx.sender !== '0x0000000000000000000000000000000000000000') {
        const sender = this.addresses.get(tx.sender);
        if (sender) {
          sender.balance -= (tx.amount + tx.fee);
          sender.transactionCount++;
          sender.lastSeen = tx.timestamp;
        }
      }
      
      // Update recipient balance
      const recipient = this.addresses.get(tx.recipient);
      if (recipient) {
        recipient.balance += tx.amount;
        recipient.transactionCount++;
        recipient.lastSeen = tx.timestamp;
      } else {
        // Create new recipient record if it doesn't exist
        this.addresses.set(tx.recipient, {
          address: tx.recipient,
          balance: tx.amount,
          transactionCount: 1,
          firstSeen: tx.timestamp,
          lastSeen: tx.timestamp
        });
      }
    });
    
    // Remove processed transactions from pending list
    this.pendingTransactions = this.pendingTransactions.filter(
      tx => !transactions.includes(tx)
    );
    
    // Notify listeners about the new block
    this.notifyListeners('block', newBlock);
    
    return newBlock;
  }
  
  /**
   * Proof of work algorithm to find a valid hash
   */
  private proofOfWork(block: Block): void {
    const target = Array(block.difficulty + 1).join('0');
    
    while (true) {
      block.hash = this.calculateHash(block);
      
      // Simulate mining progress updates every 1000 attempts
      if (block.nonce % 1000 === 0) {
        this.notifyListeners('mining', {
          blockIndex: block.index,
          nonce: block.nonce,
          currentHash: block.hash
        });
      }
      
      // Check if the hash meets the difficulty requirement
      if (block.hash.substring(0, block.difficulty) === target) {
        break;
      }
      
      block.nonce++;
    }
    
    // Final mining update
    this.notifyListeners('mining', {
      blockIndex: block.index,
      nonce: block.nonce,
      currentHash: block.hash,
      completed: true
    });
  }
  
  /**
   * Creates a new transaction
   */
  public createTransaction(
    sender: string,
    recipient: string,
    amount: number,
    fee: number = 0.001
  ): Transaction {
    // Simple validation
    if (sender === recipient) {
      throw new Error('Sender and recipient cannot be the same');
    }
    
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Check if sender has enough balance
    const senderAddress = this.addresses.get(sender);
    if (!senderAddress || senderAddress.balance < (amount + fee)) {
      throw new Error('Insufficient balance');
    }
    
    // Create the transaction
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: Date.now(),
      sender,
      recipient,
      amount,
      fee,
      signature: this.generateSignature(sender, recipient, amount),
      status: TransactionStatus.PENDING
    };
    
    // Add to pending transactions
    this.pendingTransactions.push(transaction);
    
    // Sort pending transactions by fee (highest first)
    this.pendingTransactions.sort((a, b) => b.fee - a.fee);
    
    // Notify listeners
    this.notifyListeners('transaction', transaction);
    
    return transaction;
  }
  
  /**
   * Generates a fake signature for demo purposes
   */
  private generateSignature(sender: string, recipient: string, amount: number): string {
    return crypto.HmacSHA256(
      sender + recipient + amount + Date.now(),
      'private-key-would-be-here'
    ).toString();
  }
  
  /**
   * Validates the integrity of the blockchain
   */
  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if the current block's hash is valid
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }
      
      // Check if the current block points to the correct previous hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generates random transactions for simulation
   */
  public generateRandomTransactions(count: number = 1): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Get addresses with positive balances
    const addressesWithBalance = Array.from(this.addresses.values())
      .filter(addr => addr.balance > 0);
    
    // If no addresses have balance, return empty array
    if (addressesWithBalance.length === 0) {
      return transactions;
    }
    
    for (let i = 0; i < count; i++) {
      try {
        // Select random sender with balance
        const sender = addressesWithBalance[Math.floor(Math.random() * addressesWithBalance.length)];
        
        // Select or create random recipient (different from sender)
        let recipient = this.createNewAddress();
        
        // Random amount (up to 90% of sender's balance)
        const maxAmount = sender.balance * 0.9;
        const amount = Math.random() * maxAmount;
        
        // Random fee
        const fee = Math.random() * 0.01;
        
        // Create the transaction
        const tx = this.createTransaction(sender.address, recipient, amount, fee);
        transactions.push(tx);
      } catch (error) {
        // Skip failed transactions
        console.error('Failed to generate random transaction:', error);
      }
    }
    
    return transactions;
  }
  
  /**
   * Simulates mining by randomly selecting a miner
   */
  public simulateMining(): Block {
    const randomMiner = this.minersAddresses[Math.floor(Math.random() * this.minersAddresses.length)];
    return this.mineBlock(randomMiner);
  }
  
  /**
   * Adjusts the mining difficulty based on the time between blocks
   */
  public adjustDifficulty(): void {
    if (this.chain.length > 1) {
      const lastBlock = this.getLatestBlock();
      const prevBlock = this.chain[this.chain.length - 2];
      
      // Target block time: 60 seconds
      const targetBlockTime = 60000; // 60 seconds in milliseconds
      
      // Actual time taken
      const timeTaken = lastBlock.timestamp - prevBlock.timestamp;
      
      // Adjust difficulty
      if (timeTaken < targetBlockTime / 2) {
        // Too fast, increase difficulty
        this.difficulty++;
      } else if (timeTaken > targetBlockTime * 2) {
        // Too slow, decrease difficulty (minimum 1)
        this.difficulty = Math.max(1, this.difficulty - 1);
      }
    }
  }
  
  /**
   * Gets the network statistics
   */
  public getNetworkStats(): NetworkStats {
    const lastBlock = this.getLatestBlock();
    
    // Calculate hash rate based on the last block's nonce and time
    const prevBlock = this.chain.length > 1 ? this.chain[this.chain.length - 2] : null;
    const blockTime = prevBlock ? (lastBlock.timestamp - prevBlock.timestamp) / 1000 : 60; // In seconds
    const hashRate = prevBlock ? lastBlock.nonce / blockTime : 0; // Hashes per second
    
    return {
      blockCount: this.chain.length,
      lastBlockTime: lastBlock.timestamp,
      difficulty: this.difficulty,
      hashRate,
      transactionCount: this.chain.reduce((sum, block) => sum + block.transactions.length, 0),
      pendingTransactions: this.pendingTransactions.length,
      activeAddresses: this.addresses.size
    };
  }
  
  /**
   * Gets all blocks in the chain
   */
  public getBlocks(): Block[] {
    return this.chain;
  }
  
  /**
   * Gets a specific block by index
   */
  public getBlock(index: number): Block | null {
    if (index >= 0 && index < this.chain.length) {
      return this.chain[index];
    }
    return null;
  }
  
  /**
   * Gets all pending transactions
   */
  public getPendingTransactions(): Transaction[] {
    return this.pendingTransactions;
  }
  
  /**
   * Gets all addresses
   */
  public getAddresses(): Address[] {
    return Array.from(this.addresses.values());
  }
  
  /**
   * Gets a specific address by its string
   */
  public getAddress(address: string): Address | null {
    return this.addresses.get(address) || null;
  }
  
  /**
   * Gets a transaction by ID
   */
  public getTransaction(id: string): Transaction | null {
    // Check pending transactions
    const pendingTx = this.pendingTransactions.find(tx => tx.id === id);
    if (pendingTx) {
      return pendingTx;
    }
    
    // Check transactions in blocks
    for (const block of this.chain) {
      const tx = block.transactions.find(tx => tx.id === id);
      if (tx) {
        return tx;
      }
    }
    
    return null;
  }
  
  /**
   * Searches for blocks, transactions, or addresses
   */
  public search(query: string): { blocks: Block[], transactions: Transaction[], addresses: Address[] } {
    const results = {
      blocks: [] as Block[],
      transactions: [] as Transaction[],
      addresses: [] as Address[]
    };
    
    // Search blocks by hash
    results.blocks = this.chain.filter(block => 
      block.hash.includes(query) || 
      block.index.toString() === query ||
      block.miner.includes(query)
    );
    
    // Search transactions by ID, sender, or recipient
    const pendingMatches = this.pendingTransactions.filter(tx => 
      tx.id.includes(query) || 
      tx.sender.includes(query) || 
      tx.recipient.includes(query)
    );
    
    let blockMatches: Transaction[] = [];
    for (const block of this.chain) {
      const matches = block.transactions.filter(tx => 
        tx.id.includes(query) || 
        tx.sender.includes(query) || 
        tx.recipient.includes(query)
      );
      blockMatches = [...blockMatches, ...matches];
    }
    
    results.transactions = [...pendingMatches, ...blockMatches];
    
    // Search addresses
    results.addresses = Array.from(this.addresses.values())
      .filter(addr => addr.address.includes(query));
    
    return results;
  }
  
  /**
   * Adds an event listener
   */
  public on(event: 'block' | 'transaction' | 'mining', callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  /**
   * Removes an event listener
   */
  public off(event: 'block' | 'transaction' | 'mining', callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  /**
   * Notifies all listeners of an event
   */
  private notifyListeners(event: string, data: any): void {
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        callback(data);
      }
    }
  }
}

// Export a singleton instance
export const blockchain = new BlockchainSimulator();
