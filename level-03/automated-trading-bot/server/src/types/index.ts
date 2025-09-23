// User model types
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  apiKeys: {
    exchange: string;
    apiKey: string;
    apiSecret: string;
    description?: string;
    isActive: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Strategy types
export enum StrategyType {
  TREND_FOLLOWING = 'trend_following',
  MEAN_REVERSION = 'mean_reversion',
  BREAKOUT = 'breakout',
  CUSTOM = 'custom',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LOSS = 'stop_loss',
  STOP_LIMIT = 'stop_limit',
  TAKE_PROFIT = 'take_profit',
}

export enum TimeFrame {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
}

export enum SignalDirection {
  BUY = 'buy',
  SELL = 'sell',
  NEUTRAL = 'neutral',
}

export interface ITechnicalIndicator {
  type: string;
  params: Record<string, any>;
}

export interface IStrategyCondition {
  indicatorIndex: number;
  comparator: 'greater_than' | 'less_than' | 'equal_to' | 'crosses_above' | 'crosses_below';
  value: number | string | { indicatorIndex: number; property?: string };
  property?: string;
}

export interface IRiskManagement {
  stopLossPercentage?: number;
  takeProfitPercentage?: number;
  maxPositionSize?: number;
  trailingStopPercentage?: number;
}

export interface IStrategy {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  type: StrategyType;
  market: string;
  timeframe: TimeFrame;
  indicators: ITechnicalIndicator[];
  entryConditions: IStrategyCondition[];
  exitConditions: IStrategyCondition[];
  riskManagement: IRiskManagement;
  isActive: boolean;
  isBacktested: boolean;
  paperTrading: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Trade types
export enum TradeStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface ITrade {
  _id?: string;
  userId: string;
  strategyId: string;
  exchange: string;
  symbol: string;
  direction: SignalDirection;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryTime: Date;
  exitTime?: Date;
  status: TradeStatus;
  pnl?: number;
  pnlPercentage?: number;
  fees?: number;
  notes?: string;
  orderId?: string;
  paperTrade: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Backtest types
export interface IBacktestResult {
  _id?: string;
  userId: string;
  strategyId: string;
  startDate: Date;
  endDate: Date;
  market: string;
  timeframe: TimeFrame;
  trades: {
    entryTime: Date;
    exitTime?: Date;
    entryPrice: number;
    exitPrice?: number;
    direction: SignalDirection;
    pnl?: number;
    pnlPercentage?: number;
  }[];
  metrics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    averageReturn: number;
    averageWin: number;
    averageLoss: number;
  };
  createdAt?: Date;
}

// Market data types
export interface IOHLCV {
  time: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

// Exchange types
export interface IExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface IExchangeBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

// API response types
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

// JWT payload type
export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

// Request with authenticated user
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}
