# 🚀 Carbon Ghost - Complete Deployment Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] MetaMask wallet set up
- [ ] Polygon Amoy testnet MATIC (get from [faucet](https://faucet.polygon.technology/))
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/command line access

## Part 1: Initial Setup (10 minutes)

### 1. Clone/Download the Project
```bash
# If you have it in a repo:
git clone <your-repo>
cd carbon-ghost

# Or just navigate to your project folder:
cd carbon-ghost
```

### 2. Install Dependencies
```bash
# Install main dependencies
npm install

# Install Hardhat and tooling
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Install Chainlink contracts  
npm install @chainlink/contracts
```

### 3. Create .env File
Create a file named `.env` in the project root:

```bash
# Copy this template and fill in your values:

# Blockchain Configuration
RPC_URL=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=your_private_key_here_without_0x
POLYGONSCAN_API_KEY=optional_for_verification

# These will be filled in after deployment:
ORACLE_ADDRESS=
GHOST_NFT_ADDRESS=
GAME_LOGIC_ADDRESS=

# Relay Server
PORT=3000
```

**⚠️ IMPORTANT:** 
- Never commit your .env file to git!
- Get your private key from MetaMask: Settings → Security & Privacy → Show Private Key
- Remove the "0x" prefix from your private key

### 4. Get Testnet MATIC
1. Go to https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Paste your wallet address
4. Wait for tokens (usually instant)
5. Verify in MetaMask you have ~1 MATIC

## Part 2: Deploy Smart Contracts (5 minutes)

### 1. Initialize Hardhat
```bash
npx hardhat
# Select: "Create a JavaScript project"
# Accept all defaults
```

### 2. Copy Contracts
Make sure all .sol files are in `contracts/` folder:
- CarbonGhostNFT.sol
- GameLogic.sol
- CarbonIntensityOracle.sol

### 3. Compile Contracts
```bash
npx hardhat compile
```

You should see:
```
Compiled 3 Solidity files successfully
```

### 4. Deploy to Amoy Testnet
```bash
npx hardhat run scripts/deploy.js --network amoy
```

**Expected output:**
```
Deploying contracts with account: 0x...
Account balance: 1000000000000000000

Deploying CarbonIntensityOracle...
✓ Oracle deployed to: 0xABC...

Deploying CarbonGhostNFT...
✓ NFT deployed to: 0xDEF...

Deploying GameLogic...
✓ Game Logic deployed to: 0x123...

Add these to your .env file:
ORACLE_ADDRESS=0xABC...
GHOST_NFT_ADDRESS=0xDEF...
GAME_LOGIC_ADDRESS=0x123...
```

### 5. Update .env
Copy the three addresses from the output and paste them into your `.env` file.

## Part 3: Mint Your First Ghost (2 minutes)

### 1. Mint a Ghost NFT
```bash
node scripts/mintGhost.js YOUR_WALLET_ADDRESS DEVICE_ADDRESS
```

**Example:**
```bash
node scripts/mintGhost.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

For testing, you can use the same address for both owner and device.

**Expected output:**
```
Minting Ghost NFT...
Transaction sent: 0x...
✓ Transaction confirmed in block: 12345

🎉 Ghost minted successfully!
Token ID: 0
```

### 2. Make Security Deposit
```bash
node scripts/deposit.js 1.0
```

This deposits 1 MATIC as collateral for the carbon tracking game.

**Expected output:**
```
Making deposit to GameLogic contract...
Transaction sent: 0x...
✓ Transaction confirmed

Your deposit balance: 1.0 MATIC
✅ Deposit successful!
```

## Part 4: Start the System (2 minutes)

### 1. Start Relay Server
In one terminal:
```bash
node relay.js
```

You should see:
```
🔗 Relay server running on port 3000
Connected to Polygon Amoy testnet
Wallet address: 0x...
```

### 2. Start Hardware Simulator
In a **second terminal**:
```bash
node power_reader.js device-1 YOUR_DEVICE_ADDRESS
```

Replace YOUR_DEVICE_ADDRESS with the same address you used when minting the ghost.

**Expected output:**
```
✓ Loaded keys for device-1
✓ Device registered with relay
Device address: 0x...

🔌 Starting power monitoring...

⚡ Power Reading: 127W at 2024-02-12T...
📝 Sending to relay...

📊 RELAY RESPONSE:
Grid Status: CLEAN
Carbon Intensity: 250 gCO2/kWh
Ghost Health: 60
Ghost Mood: Happy
Deposit Balance: 1.0 MATIC
Green Credits: 1
Transaction: 0x...
```

## Part 5: Test the Flow (3 minutes)

### Change Carbon Intensity
In a **third terminal**, open Hardhat console:

```bash
npx hardhat console --network amoy
```

Then run:
```javascript
// Get oracle contract
const Oracle = await ethers.getContractFactory("CarbonIntensityOracle");
const oracle = Oracle.attach("YOUR_ORACLE_ADDRESS");

// Set to clean grid
await oracle.setCarbonIntensity(250);

// Wait 10 seconds, watch your ghost get healthier!

// Set to dirty grid
await oracle.setCarbonIntensity(450);

// Watch your ghost get sick and lose money
```

## Part 6: Frontend (Optional, 10 minutes)

### 1. Set Up React App
```bash
cd frontend
npm install
```

### 2. Create .env for Frontend
In `frontend/` folder, create `.env`:
```
REACT_APP_RELAY_URL=http://localhost:3000
```

### 3. Start Frontend
```bash
npm start
```

Browser should open to http://localhost:3000

### 4. Connect Your Ghost
- Enter your device address in the input field
- Click "Connect Device"
- Watch your ghost appear in 3D!

## 🎯 Hackathon Demo Checklist

Before your presentation:
- [ ] All contracts deployed and verified on Polygonscan
- [ ] Ghost NFT minted and visible
- [ ] Deposit made
- [ ] Relay server running
- [ ] Hardware simulator running and sending data
- [ ] Frontend showing ghost visualization
- [ ] Screenshots/screen recording prepared
- [ ] Slide deck ready

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Make sure you have testnet MATIC
- Try the faucet again: https://faucet.polygon.technology/

### "Ghost does not exist"
- Verify you minted a ghost: `node scripts/mintGhost.js`
- Check the device address matches

### "Invalid signature"
- Device keys should auto-generate
- Check the `devices/` folder exists

### Relay server crashes
- Check .env has all contract addresses
- Verify private key is correct (no "0x" prefix)
- Check you have internet connection to RPC

### Frontend doesn't show ghost
- Check relay server is running
- Open browser console (F12) for errors
- Verify device address is correct

## 📊 Monitoring Your Deployment

### View on Blockchain Explorer
- Go to https://amoy.polygonscan.com/
- Search for your contract addresses
- View transactions in real-time

### Check Ghost State
```javascript
// In hardhat console
const nft = await ethers.getContractAt("CarbonGhostNFT", "YOUR_NFT_ADDRESS");
const ghost = await nft.getGhost(0); // Token ID 0
console.log(ghost);
```

### Check Deposit Balance
```javascript
const game = await ethers.getContractAt("GameLogic", "YOUR_GAME_ADDRESS");
const deposit = await game.getDeposit("YOUR_ADDRESS");
console.log(ethers.formatEther(deposit));
```

## 🎬 Recording Your Demo

### What to Capture
1. Terminal showing hardware simulator
2. Browser with frontend
3. Polygonscan showing live transactions
4. Maybe a split screen showing all three!

### Demo Script
1. Start: "Carbon credits are broken - here's why..."
2. Show architecture diagram
3. Start hardware simulator
4. Show relay receiving and verifying
5. Show transaction on blockchain
6. Show ghost changing on frontend
7. Change grid to dirty
8. Show slash happening
9. "And that's how we solve real-time carbon accountability!"

## 🚀 Next Steps After Hackathon

- Real hardware integration (Raspberry Pi + power sensor)
- Actual Electricity Maps API integration
- Better 3D models
- Mobile app
- Multi-region support
- Scaling to data centers

## ⚡ Quick Commands Reference

```bash
# Deploy everything
npx hardhat run scripts/deploy.js --network amoy

# Mint ghost
node scripts/mintGhost.js <owner> <device>

# Make deposit
node scripts/deposit.js 1.0

# Start relay
node relay.js

# Start hardware simulator
node power_reader.js device-1 <device_address>

# Start frontend
cd frontend && npm start

# Compile contracts
npx hardhat compile

# Test contracts
npx hardhat test

# Open console
npx hardhat console --network amoy
```

Good luck at the hackathon! 🎉👻
