# 🌟 Decentralized Charity Platform

A transparent, blockchain-based charity donation platform built on Ethereum that ensures accountability and trust in charitable giving.

![Charity Platform](https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop)

## 🚀 Overview

The Decentralized Charity Platform revolutionizes charitable giving by leveraging blockchain technology to provide:

- **Complete Transparency**: Every donation is recorded on the blockchain
- **Verified Charities**: Rigorous verification process ensures legitimacy
- **Direct Impact**: Donors can track exactly how their contributions are used
- **Low Fees**: Minimal platform fees (2.5%) compared to traditional platforms
- **Global Reach**: Accessible worldwide with cryptocurrency donations

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **ethers.js** for blockchain interaction
- **Lucide React** for icons

### Smart Contracts
- **Solidity ^0.8.19**
- **OpenZeppelin** for security standards
- **Hardhat** for development and testing
- **Ethereum** compatible networks

### Backend
- **Node.js** with Express
- **IPFS** for decentralized file storage
- **MongoDB** for off-chain metadata (optional)
- **JWT** for authentication
- **Joi** for validation

### Infrastructure
- **MetaMask** for wallet integration
- **IPFS** for document storage
- **Ethereum** mainnet/testnets support

## 📁 Project Structure

```
decentralized-charity-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── lib/            # Utility functions
│   │   └── contracts/      # Contract ABI and addresses
│   ├── public/             # Static assets
│   └── package.json
├── contracts/               # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/              # Contract tests
│   └── hardhat.config.js
├── backend/                # API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🏗️ Architecture

### Smart Contract Architecture
```
CharityPlatform.sol
├── Charity Management
│   ├── Create charity campaigns
│   ├── Update charity information
│   ├── Verify charities (admin only)
│   └── Manage charity status
├── Donation Processing
│   ├── Accept ETH donations
│   ├── Track donation history
│   ├── Support anonymous donations
│   └── Record donation messages
├── Fund Management
│   ├── Withdraw funds (verified charities only)
│   ├── Calculate platform fees
│   ├── Track withdrawn amounts
│   └── Ensure transparency
└── Transparency Features
    ├── Public charity information
    ├── Donation tracking
    ├── Financial transparency
    └── Verification status
```

### Frontend Architecture
```
React Application
├── Wallet Integration
│   ├── MetaMask connection
│   ├── Account management
│   ├── Network switching
│   └── Transaction signing
├── Contract Interaction
│   ├── Read charity data
│   ├── Submit donations
│   ├── Query donation history
│   └── Real-time updates
├── UI Components
│   ├── Charity cards
│   ├── Donation forms
│   ├── Dashboard views
│   └── Transaction history
└── State Management
    ├── Wallet state
    ├── Contract data
    ├── UI state
    └── Error handling
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd decentralized-charity-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp contracts/.env.example contracts/.env
   cp backend/.env.example backend/.env
   
   # Edit the .env files with your configuration
   ```

4. **Start local blockchain**
   ```bash
   cd contracts
   npx hardhat node
   ```

5. **Deploy smart contracts**
   ```bash
   # In a new terminal
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Start the development servers**
   ```bash
   # From project root
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Blockchain: http://localhost:8545

## 📖 Usage Guide

### For Donors

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Ensure you're on the correct network

2. **Browse Charities**
   - View featured campaigns on homepage
   - Filter by category or search
   - Check verification status

3. **Make a Donation**
   - Click "Donate" on a charity card
   - Enter donation amount in ETH
   - Add optional message
   - Choose anonymous option if desired
   - Confirm transaction in MetaMask

4. **Track Donations**
   - View donation history in dashboard
   - See transaction confirmations
   - Monitor fund usage by charities

### For Charity Organizations

1. **Create Campaign**
   - Connect wallet with organization address
   - Fill out charity information form
   - Upload verification documents to IPFS
   - Submit for platform review

2. **Manage Campaign**
   - Update campaign information
   - Upload progress reports
   - Communicate with donors

3. **Withdraw Funds**
   - Ensure charity is verified
   - Request fund withdrawal
   - Funds transferred after platform fee

### For Platform Administrators

1. **Verify Charities**
   - Review submitted documentation
   - Verify organization legitimacy
   - Approve or reject applications

2. **Monitor Platform**
   - Track total donations
   - Monitor active campaigns
   - Manage platform fees

## 🔧 Configuration

### Smart Contract Configuration

Edit `contracts/hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },
};
```

### Frontend Configuration

Update `frontend/src/config.ts`:

```typescript
export const config = {
  contractAddress: "0x...", // Deployed contract address
  chainId: 1337, // Network chain ID
  rpcUrl: "http://localhost:8545",
  blockExplorer: "https://etherscan.io",
};
```

### Backend Configuration

Edit `backend/.env`:

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CONTRACT_ADDRESS=0x...
ETHEREUM_RPC_URL=http://127.0.0.1:8545
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

Run specific test file:
```bash
npx hardhat test test/CharityPlatform.test.js
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
npm test
```

### Integration Tests

```bash
# Start all services first
npm run dev

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Local Deployment

1. **Start local blockchain**
   ```bash
   cd contracts
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Start services**
   ```bash
   npm run dev
   ```

### Testnet Deployment (Sepolia)

1. **Configure environment**
   ```bash
   # contracts/.env
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. **Deploy to testnet**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Verify contract**
   ```bash
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

### Production Deployment

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to hosting service**
   - Vercel, Netlify, or AWS S3 for frontend
   - Heroku, DigitalOcean, or AWS EC2 for backend

3. **Configure environment variables**
   - Set production RPC URLs
   - Configure IPFS endpoints
   - Set security headers

## 🔐 Security Considerations

### Smart Contract Security
- ✅ ReentrancyGuard for state-changing functions
- ✅ OpenZeppelin's Ownable for access control
- ✅ Input validation and bounds checking
- ✅ Safe math operations (Solidity 0.8+)
- ✅ Emergency pause functionality

### Frontend Security
- ✅ Input sanitization and validation
- ✅ Secure wallet integration
- ✅ HTTPS enforcement in production
- ✅ CSP headers for XSS protection

### Backend Security
- ✅ Rate limiting to prevent abuse
- ✅ CORS configuration
- ✅ Helmet.js for security headers
- ✅ Input validation with Joi
- ✅ Environment variable protection

## 🔄 API Reference

### Charity Endpoints

```http
GET /api/charities
POST /api/charities
GET /api/charities/:id
PUT /api/charities/:id
GET /api/charities/meta/categories
GET /api/charities/meta/stats
```

### Donation Endpoints

```http
GET /api/donations
POST /api/donations
GET /api/donations/:id
GET /api/donations/charity/:charityId/stats
GET /api/donations/donor/:address/stats
GET /api/donations/meta/leaderboard
```

### Metadata Endpoints

```http
POST /api/metadata/upload
GET /api/metadata/file/:hash
POST /api/metadata/json
GET /api/metadata/json/:hash
```

## 🛣️ Roadmap

### Phase 1: Core Features (Completed)
- ✅ Smart contract development
- ✅ Basic frontend interface
- ✅ Wallet integration
- ✅ Donation functionality
- ✅ Backend API

### Phase 2: Enhanced Features (In Progress)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile responsive design
- 🔄 Email notifications
- 🔄 Social media integration

### Phase 3: Advanced Features (Planned)
- ⏳ Multi-token support (ERC-20)
- ⏳ Governance token (DAO)
- ⏳ Staking rewards for donors
- ⏳ Impact measurement tools
- ⏳ Integration with traditional payment methods

### Phase 4: Scaling (Future)
- ⏳ Layer 2 solutions (Polygon, Arbitrum)
- ⏳ Cross-chain compatibility
- ⏳ Mobile applications
- ⏳ Enterprise partnerships
- ⏳ Regulatory compliance tools

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint and Prettier for JavaScript/TypeScript
- Follow Solidity style guide for smart contracts
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Smart Contract Documentation](./contracts/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)

### Community
- [Discord Server](https://discord.gg/charity-dao)
- [Telegram Group](https://t.me/charity_dao)
- [Twitter](https://twitter.com/charity_dao)

### Issues
- [Bug Reports](https://github.com/your-repo/issues/new?template=bug_report.md)
- [Feature Requests](https://github.com/your-repo/issues/new?template=feature_request.md)
- [Questions](https://github.com/your-repo/discussions)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for security standards
- [Hardhat](https://hardhat.org/) for development framework
- [Vite](https://vitejs.dev/) for build tooling
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [IPFS](https://ipfs.io/) for decentralized storage

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Users should conduct their own security audits before using in production. The platform is experimental and may contain bugs or vulnerabilities. Always test thoroughly on testnets before mainnet deployment.

---

**Built with ❤️ for a more transparent and accountable world of charitable giving.**
