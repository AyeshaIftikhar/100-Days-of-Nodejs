# Zero-Knowledge Proof Authentication Demo - Installation Guide

This guide will walk you through the steps to install and run the Zero-Knowledge Proof Authentication Demo.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation Steps

### 1. Clone the Repository

If you haven't already, clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>/level-03/zkp-auth-demo
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install Server Dependencies

```bash
cd server
npm install
cd ..
```

### 5. Install Circuit Dependencies

```bash
cd circuits
npm install
cd ..
```

### 6. Set Up MongoDB

Make sure MongoDB is running locally, or you have a MongoDB Atlas connection string.

Create a `.env` file in the server directory by copying the example:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file to include your MongoDB connection string if you're using MongoDB Atlas.

### 7. Build the ZKP Circuits

This step prepares the zero-knowledge proof circuits:

```bash
cd circuits
# Download the Powers of Tau file (needed for setup)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau -O pot15_final.ptau
# Build the circuits
npm run build
cd ..
```

## Running the Application

### 1. Start the Server

In one terminal:

```bash
cd server
npm run dev
```

### 2. Start the Client

In another terminal:

```bash
cd client
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Testing the ZKP Authentication

1. Register a new user using the registration form
2. Log in with the same credentials
3. Observe that authentication happens without sending your password to the server

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection errors:
- Make sure MongoDB is running locally (if using local MongoDB)
- Check that your connection string in `.env` is correct
- Ensure your IP address is whitelisted in MongoDB Atlas (if using Atlas)

### Circuit Generation Issues

If you encounter issues with circuit generation:
- Make sure you've downloaded the Powers of Tau file
- Check that circom is installed correctly
- Verify the circuit file for syntax errors

### Port Conflicts

If ports are already in use:
- Server: Edit the PORT in the `.env` file
- Client: Edit the port in the vite.config.ts file

## Next Steps

After successfully setting up the demo, you can:

1. Explore the code to understand how ZKPs work
2. Modify the circuit to add more features
3. Implement some of the future enhancements mentioned in the README
