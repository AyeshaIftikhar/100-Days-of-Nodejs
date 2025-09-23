import { blockchain } from '../../simulator/blockchain';
import { config } from '../../config';

/**
 * Controller for managing blockchain simulation
 */
class SimulationController {
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulationRunning: boolean = false;
  
  /**
   * Starts the blockchain simulation
   */
  public startSimulation(): void {
    if (this.isSimulationRunning) {
      return;
    }
    
    this.isSimulationRunning = true;
    
    // Generate some initial transactions
    this.generateRandomTransactions(10);
    
    // Create an initial block
    blockchain.simulateMining();
    
    // Set up simulation interval
    this.simulationInterval = setInterval(() => {
      // Generate random transactions
      this.generateRandomTransactions(config.simulation.transactionsPerBlock);
      
      // Mine a new block
      const newBlock = blockchain.simulateMining();
      console.log(`Mined new block: ${newBlock.index} with ${newBlock.transactions.length} transactions`);
      
      // Adjust difficulty if configured
      if (config.simulation.autoAdjustDifficulty) {
        blockchain.adjustDifficulty();
      }
    }, config.simulation.interval);
  }
  
  /**
   * Stops the blockchain simulation
   */
  public stopSimulation(): void {
    if (!this.isSimulationRunning || !this.simulationInterval) {
      return;
    }
    
    clearInterval(this.simulationInterval);
    this.simulationInterval = null;
    this.isSimulationRunning = false;
  }
  
  /**
   * Generates random transactions for simulation
   */
  private generateRandomTransactions(count: number): void {
    try {
      const transactions = blockchain.generateRandomTransactions(count);
      console.log(`Generated ${transactions.length} random transactions`);
    } catch (error) {
      console.error('Error generating random transactions:', error);
    }
  }
  
  /**
   * Manually mines a new block
   */
  public mineBlock(minerAddress: string): void {
    try {
      const newBlock = blockchain.mineBlock(minerAddress);
      console.log(`Manually mined block: ${newBlock.index} with ${newBlock.transactions.length} transactions`);
    } catch (error) {
      console.error('Error mining block:', error);
      throw error;
    }
  }
  
  /**
   * Creates a new transaction
   */
  public createTransaction(
    sender: string,
    recipient: string,
    amount: number,
    fee: number = 0.001
  ): void {
    try {
      const transaction = blockchain.createTransaction(sender, recipient, amount, fee);
      console.log(`Created transaction: ${transaction.id} | ${sender} -> ${recipient} | Amount: ${amount}`);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
  
  /**
   * Gets the simulation status
   */
  public getStatus(): { running: boolean } {
    return {
      running: this.isSimulationRunning
    };
  }
}

// Export singleton instance
export const simulationController = new SimulationController();
