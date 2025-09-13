export interface IUser {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  transactionId: string;
  userId: string;
  productId: string;
  amount: number;
  regionId: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface IShardStatus {
  shardId: string;
  name: string;
  host: string;
  status: 'online' | 'offline' | 'rebalancing';
  documentCount: number;
  tags: string[];
  lastUpdated: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
  }
}

export interface IShardStatistics {
  databaseInfo: any;
  shardInfo: IShardStatus[];
  collectionStats: Record<string, any>;
  shardDistribution: Record<string, Record<string, { count: number, size: number }>>;
}

export interface IPerformanceMetrics {
  collection: string;
  metrics: {
    shardedQueries: {
      findById: number;
      findByRange: number;
      aggregation: number;
    };
    nonShardedQueries: {
      findById: number;
      findByRange: number;
      aggregation: number;
    };
    improvement: {
      findById: number;
      findByRange: number;
      aggregation: number;
    };
  };
}
