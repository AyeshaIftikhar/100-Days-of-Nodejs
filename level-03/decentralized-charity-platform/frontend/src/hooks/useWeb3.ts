import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '../services/web3';
import type { Charity } from '../types';

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.connectWallet();
      if (result.success && result.account) {
        setIsConnected(true);
        setAccount(result.account);
        
        // Switch to localhost network for development
        await web3Service.switchToLocalhost();
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount('');
    setError(null);
  }, []);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await web3Service.getAccount();
        if (account) {
          setIsConnected(true);
          setAccount(account);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnect]);

  return {
    isConnected,
    account,
    isLoading,
    error,
    connectWallet,
    disconnect
  };
};

export const useCharities = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await web3Service.getActiveCharities();
      setCharities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load charities');
      console.error('Error loading charities:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCharity = useCallback(async (
    name: string,
    description: string,
    category: string,
    imageUrl: string,
    targetAmount: string,
    documents: string[] = []
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.createCharity(
        name,
        description,
        category,
        imageUrl,
        targetAmount,
        documents
      );
      
      if (result.success) {
        await loadCharities(); // Refresh list
        return result;
      } else {
        setError(result.error || 'Failed to create charity');
        return result;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create charity';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [loadCharities]);

  useEffect(() => {
    loadCharities();
  }, [loadCharities]);

  return {
    charities,
    isLoading,
    error,
    loadCharities,
    createCharity
  };
};

export const useDonation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donate = useCallback(async (
    charityId: bigint,
    amount: string,
    message: string = '',
    isAnonymous: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.donate(charityId, amount, message, isAnonymous);
      
      if (!result.success) {
        setError(result.error || 'Failed to donate');
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to donate';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCharityDonations = useCallback(async (charityId: bigint) => {
    try {
      return await web3Service.getCharityDonations(charityId);
    } catch (err: any) {
      setError(err.message || 'Failed to get donations');
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    donate,
    getCharityDonations
  };
};

export const useCharityStats = () => {
  const [totalCharities, setTotalCharities] = useState(0);
  const [totalRaised, setTotalRaised] = useState('0');
  const [totalDonors, setTotalDonors] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [charitiesCount, charities] = await Promise.all([
        web3Service.getTotalCharities(),
        web3Service.getAllCharities()
      ]);
      
      setTotalCharities(charitiesCount);
      
      // Calculate total raised from all charities
      const totalRaisedWei = charities.reduce((sum: bigint, charity: any) => {
        return sum + charity.raisedAmount;
      }, BigInt(0));
      
      setTotalRaised(Number(totalRaisedWei) / 1e18 + ''); // Convert to ETH
      
      // Get total donors (this would need to be implemented in the contract)
      // For now, we'll use a placeholder
      setTotalDonors(Math.floor(Math.random() * 100) + 20);
      
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    totalCharities,
    totalRaised,
    totalDonors,
    isLoading,
    loadStats
  };
};
