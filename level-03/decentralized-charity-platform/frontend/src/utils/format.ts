import { ethers } from 'ethers';

export const formatEthValue = (value: bigint, decimals: number = 4): string => {
  return parseFloat(ethers.formatEther(value)).toFixed(decimals);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

export const calculateProgress = (raised: bigint, target: bigint): number => {
  if (target === BigInt(0)) return 0;
  return Math.min((Number(raised) / Number(target)) * 100, 100);
};
