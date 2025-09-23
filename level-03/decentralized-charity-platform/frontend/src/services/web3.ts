import { ethers } from 'ethers';
import { CHARITY_PLATFORM_ABI, CONTRACT_ADDRESS } from '../contracts/abi';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async init(): Promise<boolean> {
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask not installed');
      return false;
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CHARITY_PLATFORM_ABI, this.signer);
      return true;
    } catch (error) {
      console.error('Error initializing Web3:', error);
      return false;
    }
  }

  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    if (!window.ethereum) {
      return { success: false, error: 'MetaMask not installed' };
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.init();
      return { success: true, account: accounts[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAccount(): Promise<string | null> {
    try {
      if (!this.signer) await this.init();
      return this.signer ? await this.signer.getAddress() : null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) await this.init();
      const balance = await this.provider!.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  // Charity functions
  async getAllCharities() {
    try {
      if (!this.contract) await this.init();
      const charities = await this.contract!.getAllCharities();
      return charities.map((charity: any) => ({
        id: charity.id,
        wallet: charity.wallet,
        name: charity.name,
        description: charity.description,
        category: charity.category,
        imageUrl: charity.imageUrl,
        targetAmount: charity.targetAmount,
        raisedAmount: charity.raisedAmount,
        withdrawnAmount: charity.withdrawnAmount,
        isActive: charity.isActive,
        isVerified: charity.isVerified,
        createdAt: charity.createdAt,
        documents: charity.documents
      }));
    } catch (error) {
      console.error('Error getting charities:', error);
      return [];
    }
  }

  async getActiveCharities() {
    try {
      if (!this.contract) await this.init();
      const charities = await this.contract!.getActiveCharities();
      return charities.map((charity: any) => ({
        id: charity.id,
        wallet: charity.wallet,
        name: charity.name,
        description: charity.description,
        category: charity.category,
        imageUrl: charity.imageUrl,
        targetAmount: charity.targetAmount,
        raisedAmount: charity.raisedAmount,
        withdrawnAmount: charity.withdrawnAmount,
        isActive: charity.isActive,
        isVerified: charity.isVerified,
        createdAt: charity.createdAt,
        documents: charity.documents
      }));
    } catch (error) {
      console.error('Error getting active charities:', error);
      return [];
    }
  }

  async createCharity(
    name: string,
    description: string,
    category: string,
    imageUrl: string,
    targetAmount: string,
    documents: string[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) await this.init();
      const targetAmountWei = ethers.parseEther(targetAmount);
      
      const tx = await this.contract!.createCharity(
        name,
        description,
        category,
        imageUrl,
        targetAmountWei,
        documents
      );
      
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error creating charity:', error);
      return { success: false, error: error.message };
    }
  }

  async donate(
    charityId: bigint,
    amount: string,
    message: string,
    isAnonymous: boolean
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) await this.init();
      const amountWei = ethers.parseEther(amount);
      
      const tx = await this.contract!.donate(charityId, message, isAnonymous, {
        value: amountWei
      });
      
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error donating:', error);
      return { success: false, error: error.message };
    }
  }

  async getCharityDonations(charityId: bigint) {
    try {
      if (!this.contract) await this.init();
      const donations = await this.contract!.getCharityDonations(charityId);
      return donations.map((donation: any) => ({
        id: donation.id,
        charityId: donation.charityId,
        donor: donation.donor,
        amount: donation.amount,
        message: donation.message,
        isAnonymous: donation.isAnonymous,
        timestamp: donation.timestamp
      }));
    } catch (error) {
      console.error('Error getting donations:', error);
      return [];
    }
  }

  async withdrawFunds(
    charityId: bigint,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) await this.init();
      const amountWei = ethers.parseEther(amount);
      
      const tx = await this.contract!.withdrawFunds(charityId, amountWei);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      return { success: false, error: error.message };
    }
  }

  async getTotalCharities(): Promise<number> {
    try {
      if (!this.contract) await this.init();
      const total = await this.contract!.getTotalCharities();
      return Number(total);
    } catch (error) {
      console.error('Error getting total charities:', error);
      return 0;
    }
  }

  async getCharityBalance(charityId: bigint): Promise<string> {
    try {
      if (!this.contract) await this.init();
      const balance = await this.contract!.getCharityBalance(charityId);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting charity balance:', error);
      return '0';
    }
  }

  // Network functions
  async switchToLocalhost(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex (localhost)
      });
      return true;
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding localhost network:', addError);
          return false;
        }
      }
      console.error('Error switching to localhost:', error);
      return false;
    }
  }

  // Event listeners
  onCharityCreated(callback: (charityId: bigint, wallet: string, name: string, targetAmount: bigint) => void) {
    if (!this.contract) return;
    this.contract.on('CharityCreated', callback);
  }

  onDonationMade(callback: (charityId: bigint, donationId: bigint, donor: string, amount: bigint, isAnonymous: boolean) => void) {
    if (!this.contract) return;
    this.contract.on('DonationMade', callback);
  }

  onFundsWithdrawn(callback: (charityId: bigint, amount: bigint, fee: bigint) => void) {
    if (!this.contract) return;
    this.contract.on('FundsWithdrawn', callback);
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const web3Service = new Web3Service();
