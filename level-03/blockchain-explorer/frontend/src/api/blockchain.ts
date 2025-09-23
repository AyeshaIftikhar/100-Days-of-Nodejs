import axios from 'axios';
import { Block, Transaction, Address, NetworkStats } from '../types/blockchain';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service with type-safe methods
export const BlockchainAPI = {
  // Block methods
  getBlocks: async (): Promise<Block[]> => {
    const response = await api.get('/blocks');
    return response.data.data;
  },
  
  getBlockByIndex: async (index: number): Promise<Block> => {
    const response = await api.get(`/blocks/${index}`);
    return response.data.data;
  },
  
  // Transaction methods
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data.data;
  },
  
  getPendingTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/pending');
    return response.data.data;
  },
  
  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },
  
  createTransaction: async (
    sender: string,
    recipient: string,
    amount: number,
    fee: number = 0.001
  ): Promise<Transaction> => {
    const response = await api.post('/transactions', {
      sender,
      recipient,
      amount,
      fee,
    });
    return response.data.data;
  },
  
  // Address methods
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data.data;
  },
  
  getAddressInfo: async (address: string): Promise<Address & { 
    transactions: Transaction[],
    pendingTransactions: Transaction[] 
  }> => {
    const response = await api.get(`/addresses/${address}`);
    return response.data.data;
  },
  
  // Network methods
  getNetworkStats: async (): Promise<NetworkStats> => {
    const response = await api.get('/network/stats');
    return response.data.data;
  },
  
  search: async (query: string): Promise<{
    blocks: Block[],
    transactions: Transaction[],
    addresses: Address[]
  }> => {
    const response = await api.get('/search', { params: { q: query } });
    return response.data.data;
  },
  
  // Simulation methods
  getSimulationStatus: async (): Promise<{ running: boolean }> => {
    const response = await api.get('/simulation/status');
    return response.data.data;
  },
  
  startSimulation: async (): Promise<void> => {
    await api.post('/simulation/start');
  },
  
  stopSimulation: async (): Promise<void> => {
    await api.post('/simulation/stop');
  },
  
  mineBlock: async (minerAddress: string): Promise<void> => {
    await api.post('/simulation/mine', { minerAddress });
  }
};
