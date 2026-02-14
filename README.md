For the frontend, see https://github.com/SJay-47/Carbon-Network-Frontend

# 👻 Carbon Ghost - Hackathon Implementation Guide

## 🎯 What This Is
A blockchain-based system that tracks real-time energy consumption and ties it to carbon intensity data, creating a visual "ghost" NFT that evolves based on how clean your energy usage is.

## 🏗️ Architecture

```
Hardware Layer (Phase 1)
    ↓ (signed power data)
Backend Relay (Phase 4)
    ↓ (verified + oracle data)
Smart Contracts (Phases 2 & 3)
    ↓ (state updates)
Frontend (Phase 5)
```

## 📁 Project Structure

```
carbon-ghost/
├── contracts/
│   ├── CarbonGhostNFT.sol       # Dynamic NFT
│   ├── GameLogic.sol             # Deposits & slashing
│   └── CarbonIntensityOracle.sol # Chainlink oracle
├── power_reader.js            # Hardware simulator
├── relay.js                      # Backend bridge
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/GhostViewer.jsx
        └── App.css
```

## 🚀 Quick Start for Hackathon

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Some Polygon Amoy testnet MATIC (get from faucet)

### Step 1: Deploy Contracts

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init

# Copy contracts to contracts/ folder
# Edit hardhat.config.cjs to add Polygon Amoy network

# Deploy
npx hardhat run scripts/deploy.js --network amoy
```

**Deployment Script** (`scripts/deploy.js`):
```javascript
async function main() {
    // Deploy Oracle
    const Oracle = await ethers.getContractFactory("CarbonIntensityOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
    console.log("Oracle deployed to:", await oracle.getAddress());
    
    // Deploy NFT
    const NFT = await ethers.getContractFactory("CarbonGhostNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    console.log("NFT deployed to:", await nft.getAddress());
    
    // Deploy Game Logic
    const Game = await ethers.getContractFactory("GameLogic");
    const game = await Game.deploy(await nft.getAddress());
    await game.waitForDeployment();
    console.log("Game deployed to:", await game.getAddress());
    
    // Set up permissions
    // NFT contract needs to allow Game contract to update ghosts
}

main();
```

### Step 2: Configure Environment

Create `.env`:
```bash
# Blockchain
RPC_URL=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=your_wallet_private_key
GHOST_NFT_ADDRESS=deployed_nft_address
GAME_LOGIC_ADDRESS=deployed_game_address
ORACLE_ADDRESS=deployed_oracle_address

# Relay
PORT=3000
RELAY_URL=http://localhost:3000
```

### Step 3: Start the Relay Server

```bash
npm install express ethers dotenv axios
node relay.js
```

### Step 4: Mint a Ghost NFT

Use Remix or Hardhat console:
```javascript
// Mint ghost for your device
await nft.mintGhost(
    "YOUR_WALLET_ADDRESS",
    "DEVICE_ADDRESS" // Can be any address for testing
);
```

### Step 5: Make a Deposit

```javascript
// Deposit 1 MATIC as security
await game.deposit({ value: ethers.parseEther("1.0") });
```

### Step 6: Set Carbon Intensity (For Testing)

```javascript
// Set to "clean" grid (< 300 gCO2/kWh)
await oracle.setCarbonIntensity(250);

// Or "dirty" grid (> 300 gCO2/kWh)
await oracle.setCarbonIntensity(400);
```

### Step 7: Run Hardware Simulator

```bash
node power_reader.js device-1 YOUR_DEVICE_ADDRESS
```

You should see:
- Power readings being generated
- Signatures being created
- Data being sent to relay
- Blockchain transactions being confirmed
- Ghost health/mood updates

### Step 8: Start Frontend

```bash
cd frontend
npm install react react-dom three ethers
npm install -g create-react-app  # if needed
npm start
```

## 🎮 How to Demo

1. **Show the Problem**: Explain current carbon credit system flaws
2. **Hardware Layer**: Run the power_reader, show signed data
3. **Smart Contracts**: Show contracts on Polygonscan
4. **Live Updates**: 
   - Set oracle to CLEAN → watch ghost turn green
   - Set oracle to DIRTY → watch ghost turn brown/smoggy
5. **Show the Flow**: 
   - Power reading → Relay verification → Oracle check → Contract update → Frontend

## 🎯 Hackathon Presentation Tips

### What to Emphasize:
1. **Novel Architecture**: Hardware enclaves + Blockchain + Oracles
2. **Real-time Accountability**: Not annual averages, actual compute-time carbon
3. **Economic Incentives**: Deposits and slashing > carbon offsets
4. **Visual Engagement**: Ghost evolves based on behavior

### Demo Flow (5 min):
1. (30s) Problem statement - carbon credits are broken
2. (1m) Architecture walkthrough
3. (2m) Live demo:
   - Show hardware signing
   - Show relay verification
   - Show ghost changing color
   - Show deposits being slashed/rewarded
4. (1m) Business model
5. (30s) Next steps

## 🐛 Common Issues

**Oracle not working?**
- For hackathon, use `setCarbonIntensity()` manually
- Real Chainlink integration needs API key

**Transactions failing?**
- Check you have MATIC for gas
- Verify contract addresses in .env
- Make sure you've minted a ghost first

**Ghost not appearing?**
- Device address must match the one registered
- Check browser console for errors
- Verify contract has been called successfully

## 📝 Improvements for Production

1. **Real Hardware**: Actually interface with power sensors
2. **Real TEE**: Use Intel SGX or TPM instead of simulation
3. **Chainlink Functions**: Use real Electricity Maps API
4. **Better Ghost Models**: Commission 3D artist
5. **Mobile App**: React Native version
6. **Multi-region**: Support for different grid zones

## 🎓 Learning Resources

- [Polygon Docs](https://docs.polygon.technology/)
- [Chainlink Functions](https://docs.chain.link/chainlink-functions)
- [Three.js](https://threejs.org/docs/)
- [Electricity Maps API](https://static.electricitymaps.com/api/docs/index.html)

## 👥 Team

Add your team info here!

## 📜 License

MIT - Built for [Hackathon Name]
