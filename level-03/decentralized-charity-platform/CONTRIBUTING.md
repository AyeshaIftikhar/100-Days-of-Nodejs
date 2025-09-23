# Contributing to Decentralized Charity Platform

Thank you for your interest in contributing to the Decentralized Charity Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Be constructive in feedback and discussions
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask browser extension
- Basic knowledge of React, TypeScript, Solidity, and Node.js

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/decentralized-charity-platform.git
   cd decentralized-charity-platform
   ```

### Setup Development Environment
1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Copy environment files:
   ```bash
   cp contracts/.env.example contracts/.env
   cp backend/.env.example backend/.env
   ```

3. Start local blockchain:
   ```bash
   cd contracts
   npx hardhat node
   ```

4. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

## 🔄 Development Process

### Branching Strategy
We use a simplified Git flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes
1. Make your changes in the appropriate directories
2. Follow coding standards (see below)
3. Add tests for new functionality
4. Update documentation as needed
5. Commit your changes with clear messages

### Commit Message Format
We follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(frontend): add donation form validation"
git commit -m "fix(contracts): resolve reentrancy vulnerability"
git commit -m "docs(readme): update installation instructions"
```

## 📝 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new frontend code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional programming patterns
- Use proper error handling

```typescript
// Good
interface DonationFormData {
  amount: string;
  message: string;
  isAnonymous: boolean;
}

const validateDonation = (data: DonationFormData): ValidationResult => {
  // Implementation
};

// Bad
const validateDonation = (data: any) => {
  // Implementation
};
```

### Solidity
- Follow the official Solidity style guide
- Use latest stable version (^0.8.19)
- Include comprehensive NatSpec documentation
- Use OpenZeppelin libraries when possible
- Implement proper access controls
- Add security considerations

```solidity
// Good
/**
 * @notice Creates a new charity campaign
 * @param _name The name of the charity
 * @param _targetAmount The fundraising target in wei
 * @return charityId The ID of the created charity
 */
function createCharity(
    string memory _name,
    uint256 _targetAmount
) external returns (uint256 charityId) {
    require(bytes(_name).length > 0, "Name cannot be empty");
    require(_targetAmount > 0, "Target amount must be positive");
    
    // Implementation
}
```

### React Components
- Use functional components with hooks
- Implement proper TypeScript types
- Follow component composition patterns
- Use proper key props for lists
- Implement error boundaries
- Optimize for performance

```tsx
// Good
interface CharityCardProps {
  charity: Charity;
  onDonate: (charityId: bigint) => void;
}

export const CharityCard: React.FC<CharityCardProps> = ({ 
  charity, 
  onDonate 
}) => {
  // Implementation
};

// Bad
export const CharityCard = (props: any) => {
  // Implementation
};
```

### CSS/Styling
- Use Tailwind CSS classes
- Create reusable component variants
- Follow mobile-first responsive design
- Use semantic class names
- Maintain consistent spacing

## 🧪 Testing

### Running Tests
```bash
# Smart contract tests
cd contracts
npm test

# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# All tests
npm run test:all
```

### Writing Tests

#### Smart Contract Tests
```javascript
describe("CharityPlatform", function () {
  it("should create a charity successfully", async function () {
    const tx = await charityPlatform.createCharity(
      "Test Charity",
      ethers.utils.parseEther("10")
    );
    
    expect(tx).to.emit(charityPlatform, "CharityCreated");
  });
});
```

#### Frontend Tests
```typescript
import { render, screen } from '@testing-library/react';
import { CharityCard } from './CharityCard';

describe('CharityCard', () => {
  it('renders charity information correctly', () => {
    const mockCharity = {
      // Mock data
    };
    
    render(<CharityCard charity={mockCharity} onDonate={jest.fn()} />);
    
    expect(screen.getByText(mockCharity.name)).toBeInTheDocument();
  });
});
```

#### Backend Tests
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('GET /api/charities', () => {
  it('should return list of charities', async () => {
    const response = await request(app)
      .get('/api/charities')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Test Coverage
- Maintain minimum 80% code coverage
- Focus on critical paths and edge cases
- Test both positive and negative scenarios
- Include integration tests for key workflows

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for all public APIs
- Document complex algorithms and business logic
- Include usage examples in documentation
- Keep README files up to date

### API Documentation
- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Maintain OpenAPI/Swagger specifications

### Smart Contract Documentation
- Use NatSpec format for all public functions
- Document security considerations
- Include deployment and upgrade procedures
- Provide interaction examples

## 🔄 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Update documentation
3. Run linting and formatting
4. Rebase your branch on the latest develop
5. Write clear commit messages

### Submitting a Pull Request
1. Push your branch to your fork
2. Create a pull request against the `develop` branch
3. Fill out the pull request template
4. Link related issues
5. Add appropriate labels

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### Review Process
1. Automated checks must pass
2. At least one code review required
3. Address all feedback
4. Maintain clean commit history
5. Squash commits if necessary

## 🐛 Issue Reporting

### Bug Reports
When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, network, etc.)
- Screenshots or logs if applicable

### Feature Requests
For feature requests, please include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Alternative solutions considered

### Security Issues
For security-related issues:
- Do NOT create public issues
- Email security@charityplatform.org
- Include detailed vulnerability information
- Allow time for fixes before disclosure

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority:high` - High priority issues
- `smart-contract` - Contract-related issues
- `frontend` - Frontend-related issues
- `backend` - Backend-related issues

## 🎯 Areas for Contribution

### High Priority
- Security improvements
- Performance optimizations
- Test coverage improvements
- Documentation enhancements

### Good First Issues
- UI/UX improvements
- Additional unit tests
- Documentation updates
- Minor bug fixes

### Advanced Contributions
- Smart contract optimizations
- Architecture improvements
- Integration with new services
- Advanced features implementation

## 🤔 Getting Help

### Channels
- [Discord Server](https://discord.gg/charity-dao) - Real-time chat
- [GitHub Discussions](https://github.com/repo/discussions) - Q&A and ideas
- [GitHub Issues](https://github.com/repo/issues) - Bug reports and features

### Mentorship
- New contributors can request mentorship
- Experienced contributors volunteer as mentors
- Pair programming sessions available
- Code review guidance provided

## 🎉 Recognition

### Contributors
- All contributors listed in CONTRIBUTORS.md
- GitHub contributor statistics
- Special recognition for significant contributions
- Invitation to contributor-only events

### Rewards
- NFT badges for contributors
- Access to exclusive features
- Early access to new releases
- Potential token rewards (when governance token launches)

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making charitable giving more transparent and impactful! 🌟
