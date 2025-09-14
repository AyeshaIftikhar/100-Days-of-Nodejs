# Zero-Knowledge Proof Authentication Demo

This project demonstrates how zero-knowledge proofs (ZKPs) can be used to create a secure authentication system without revealing sensitive information like passwords.

## What is a Zero-Knowledge Proof?

A zero-knowledge proof is a cryptographic method that allows one party (the prover) to prove to another party (the verifier) that they know a specific piece of information, without revealing the information itself.

For example, in this demo, a user can prove they know their password without ever sending the actual password over the network.

## Real-World Problem Solved

Traditional authentication systems suffer from several security vulnerabilities:

1. **Password Exposure** - Passwords sent over the network can be intercepted
2. **Server-Side Breaches** - If a server database is compromised, hashed passwords may be exposed
3. **Phishing Attacks** - Users may accidentally send credentials to malicious servers

Zero-knowledge proof authentication solves these problems by:

- Never transmitting the actual password over the network
- Proving knowledge of the password without revealing it
- Eliminating the need to store password equivalents (even hashes) on the server

## Project Structure

```
zkp-auth-demo/
├── client/             # React frontend with Vite, TypeScript, shadcn-ui and Tailwind CSS
├── server/             # Node.js Express backend
├── circuits/           # ZKP circuit definitions
├── package.json        # Root package.json for workspace
└── README.md           # This file
```

## Features

- User registration with ZKP-based password protection
- Secure login without transmitting passwords
- Interactive demo explaining how ZKPs work
- Visual representation of the proof verification process

## Technology Stack

- **Frontend**:
  - Vite
  - TypeScript
  - React
  - shadcn-ui components
  - Tailwind CSS

- **Backend**:
  - Node.js
  - Express
  - MongoDB (for storing user data and ZKP verification keys)

- **ZKP Implementation**:
  - snarkjs (Zero-knowledge proof library)
  - circom (Circuit compiler for ZKPs)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup the client:
   ```bash
   cd client
   npm install
   ```
4. Setup the server:
   ```bash
   cd server
   npm install
   ```
5. Generate the ZKP circuits:
   ```bash
   cd circuits
   npm run build
   ```

### Running the Project

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## How it Works

1. **Registration**:
   - User enters a username and password
   - Client generates a commitment to the password (not the password itself)
   - Server stores the username and commitment

2. **Login**:
   - User enters username and password
   - Client generates a zero-knowledge proof that they know the password
   - Server verifies the proof without seeing the password
   - If verified, access is granted

## Future Enhancements

1. **Multi-factor ZKP Authentication**: Combine multiple proofs for enhanced security
2. **Decentralized Identity Integration**: Connect with DIDs for portable identity
3. **Private Information Retrieval**: Implement ZKPs for secure data access
4. **Smart Contract Integration**: Connect with blockchain for trustless verification
5. **Mobile App Support**: Add React Native implementation
6. **Hardware Key Support**: Enable integration with security keys
7. **ZKP-based Authorization**: Fine-grained permissions using ZKPs
8. **Performance Optimizations**: Reduce proof generation time
9. **Federated Authentication**: Cross-domain ZKP verification

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
