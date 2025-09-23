// Network configurations
export const NETWORKS = {
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Updated with deployed address
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    contractAddress: '', // To be set after deployment
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    contractAddress: '', // To be set after deployment
  }
};

// Get current network configuration
export const getCurrentNetwork = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? NETWORKS.localhost : NETWORKS.sepolia;
};

// Contract ABI hash for verification
export const CONTRACT_ABI_HASH = 'CHARITY_PLATFORM_V1';

// Default gas limits
export const GAS_LIMITS = {
  createCharity: 300000,
  donate: 150000,
  withdrawFunds: 200000,
  verifyCharity: 100000,
};
