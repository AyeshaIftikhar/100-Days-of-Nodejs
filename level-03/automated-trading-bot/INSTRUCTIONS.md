# Automated Trading Bot Project

A full-stack application for creating, backtesting, and deploying algorithmic trading strategies. This project allows users to build custom trading strategies with a no-code interface, visualize historical performance, and execute trades on various cryptocurrency exchanges.

## Project Structure

```
automated-trading-bot/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── components/   # UI components
│       ├── layouts/      # Page layouts
│       ├── lib/          # Utility functions
│       ├── pages/        # Page components
│       └── services/     # API services
└── server/               # Backend Node.js application
    ├── src/              # Source code
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Route controllers
    │   ├── middleware/   # Express middleware
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── strategies/   # Trading strategies
    │   ├── exchanges/    # Exchange API integrations
    │   ├── types/        # TypeScript type definitions
    │   └── utils/        # Utility functions
    └── .env.example      # Environment variables example
```

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. MongoDB running locally or a MongoDB Atlas account
3. API keys for supported cryptocurrency exchanges (optional for paper trading)

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and other configurations.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file for the client:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## Usage Guide

### User Registration and Login

1. Create an account on the registration page.
2. Log in with your credentials.

### Creating a Trading Strategy

1. Go to the "Strategies" page and click "Create Strategy".
2. Enter a name and description for your strategy.
3. Select the market (cryptocurrency pair) and timeframe.
4. Add technical indicators (e.g., Moving Averages, RSI, MACD).
5. Define entry and exit conditions using the no-code interface.
6. Set risk management parameters like stop-loss and take-profit.
7. Save your strategy.

### Backtesting

1. Go to the "Backtest" page.
2. Select a strategy from your saved strategies.
3. Choose a date range for the backtest.
4. Run the backtest and view the results.
5. Analyze performance metrics like win rate, profit factor, and drawdown.

### Deploying a Strategy

1. Go to the "Strategies" page and select a strategy.
2. Toggle the "Active" switch to activate the strategy.
3. Choose between paper trading and live trading modes.
4. Monitor active strategies on the dashboard.

### Monitoring Trades

1. View active and historical trades on the "Trades" page.
2. Filter trades by strategy, status, and date range.
3. Analyze performance metrics for each trade.

## Development

### Building for Production

#### Server
```bash
cd server
npm run build
```

#### Client
```bash
cd client
npm run build
```

### Deployment Options

1. **Docker**: Use the provided Dockerfile to build and deploy the application.
2. **Traditional Hosting**: Deploy the built client to a static hosting service and the server to a Node.js hosting platform.
3. **Cloud Providers**: Deploy to AWS, Google Cloud, or Azure using their respective services.

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Technical Analysis Library](https://github.com/anandanand84/technicalindicators)

## License

This project is licensed under the MIT License.

## Disclaimer

Trading cryptocurrencies involves significant risk. This software is provided for educational and informational purposes only. Always consult a financial advisor before making investment decisions.
