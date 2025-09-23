import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized error by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Strategy API
export const strategyAPI = {
  getStrategies: async () => {
    const response = await api.get('/strategies');
    return response.data;
  },
  getStrategyById: async (id: string) => {
    const response = await api.get(`/strategies/${id}`);
    return response.data;
  },
  createStrategy: async (data: any) => {
    const response = await api.post('/strategies', data);
    return response.data;
  },
  updateStrategy: async (id: string, data: any) => {
    const response = await api.put(`/strategies/${id}`, data);
    return response.data;
  },
  deleteStrategy: async (id: string) => {
    const response = await api.delete(`/strategies/${id}`);
    return response.data;
  },
  toggleStrategyActive: async (id: string) => {
    const response = await api.patch(`/strategies/${id}/toggle-active`);
    return response.data;
  },
};

// Backtest API
export const backtestAPI = {
  runBacktest: async (strategyId: string, startDate: string, endDate: string) => {
    const response = await api.post('/backtests', {
      strategyId,
      startDate,
      endDate,
    });
    return response.data;
  },
  getBacktestResults: async (strategyId: string) => {
    const response = await api.get(`/backtests/${strategyId}`);
    return response.data;
  },
};

// Market Data API
export const marketAPI = {
  getMarkets: async () => {
    const response = await api.get('/markets');
    return response.data;
  },
  getCandles: async (symbol: string, timeframe: string, limit: number) => {
    const response = await api.get(
      `/markets/candles?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
    );
    return response.data;
  },
};

// Trade API
export const tradeAPI = {
  getTrades: async (params: { strategyId?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.strategyId) queryParams.append('strategyId', params.strategyId);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await api.get(`/trades?${queryParams.toString()}`);
    return response.data;
  },
  getTradeById: async (id: string) => {
    const response = await api.get(`/trades/${id}`);
    return response.data;
  },
  closeManualTrade: async (id: string, exitPrice: number) => {
    const response = await api.patch(`/trades/${id}/close`, { exitPrice });
    return response.data;
  },
};

export default api;
