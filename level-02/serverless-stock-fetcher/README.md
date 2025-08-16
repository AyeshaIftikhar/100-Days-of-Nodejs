# Serverless Stock Price Fetcher

A serverless function for fetching stock market data using Alpha Vantage API, deployable to AWS Lambda or Vercel.

## Features

### Core Functionality

- **Stock Quote Endpoint**: Get current price and market data
- **Caching Layer**: Reduce API calls and improve performance
- **Validation**: Input validation for stock symbols
- **Multi-Platform**: Supports both AWS Lambda and Vercel

### Technical Highlights

- **Modular Design**: Separate business logic from handlers
- **Environment Aware**: Different cache implementations for different platforms
- **Error Handling**: Comprehensive error management
- **Testing Ready**: Jest test setup included

## Architecture

### Components

1. **Handler Layer**: Platform-specific entry points
2. **Service Layer**: Alpha Vantage API client
3. **Cache Layer**: Memory (Vercel) or DynamoDB (AWS) caching
4. **Validation Layer**: Input sanitization and validation

### Design Patterns

- **Adapter Pattern**: Different cache implementations for different platforms
- **Facade Pattern**: Simplified Alpha Vantage API interface
- **Strategy Pattern**: Different deployment strategies

## Deployment

### AWS Lambda

1. Install AWS CLI and configure credentials
2. Install Serverless Framework
3. Deploy:

```bash
npm install
export ALPHA_VANTAGE_API_KEY=your_key
serverless deploy
```

## Vercel

1. Install Vercel CLI
2. Deploy:

```bash
npm i -g vercel
vercel 
vercel --prod
```
If the above does not work use the following

```bash
npm i -g vercel
npx vercel
npx vercel --prod
```

## API Endpoint

GET /api/quote?symbol=IBM

**Returns:**

```json
{
  "success": true,
  "data": {
    "symbol": "IBM",
    "open": 125.05,
    "high": 125.78,
    "low": 124.77,
    "price": 125.34,
    "volume": 4234567,
    "latestTradingDay": "2023-11-15",
    "previousClose": 124.89,
    "change": 0.45,
    "changePercent": "0.36%",
    "cached": false
  }
}
```

## Local Development

```bash
npm install
serverless offline
# or
vercel dev
```

## Testing

```bash
npm test
npm run test:watch
```
