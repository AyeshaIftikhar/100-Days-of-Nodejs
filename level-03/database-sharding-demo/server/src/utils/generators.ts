import { v4 as uuidv4 } from 'uuid';

// Generate unique IDs for various entities
export const generateUserId = (): string => {
  return `usr_${uuidv4().slice(0, 8)}`;
};

export const generateProductId = (): string => {
  return `prd_${uuidv4().slice(0, 8)}`;
};

export const generateTransactionId = (): string => {
  return `txn_${uuidv4().slice(0, 8)}`;
};

// Helper to generate random data for testing
export const generateRandomData = (count: number, type: 'user' | 'product' | 'transaction') => {
  const results = [];

  for (let i = 0; i < count; i++) {
    if (type === 'user') {
      results.push({
        userId: generateUserId(),
        name: `User ${i}`,
        email: `user${i}@example.com`,
      });
    } else if (type === 'product') {
      const categoryId = Math.floor(Math.random() * 5) + 1; // 1-5
      results.push({
        productId: generateProductId(),
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: parseFloat((Math.random() * 100 + 1).toFixed(2)),
        categoryId,
        stock: Math.floor(Math.random() * 100),
      });
    } else if (type === 'transaction') {
      // For transactions, we generate regionId to distribute across shards
      // RegionId ranges: 1-100 (US), 101-200 (EU), 201-300 (Asia)
      const regionBuckets = [
        [1, 100],   // US
        [101, 200], // EU
        [201, 300]  // Asia
      ];
      
      const bucketIndex = Math.floor(Math.random() * 3);
      const [min, max] = regionBuckets[bucketIndex];
      const regionId = Math.floor(Math.random() * (max - min + 1)) + min;
      
      results.push({
        transactionId: generateTransactionId(),
        userId: generateUserId(),
        productId: generateProductId(),
        amount: parseFloat((Math.random() * 200 + 10).toFixed(2)),
        regionId,
        status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
      });
    }
  }

  return results;
};
