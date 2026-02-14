// scripts/deploy.js

const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Carbon Ghost Power-Weighted System...\n");
    
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
    
    // 1. Deploy Oracle
    console.log("1️⃣  Deploying CarbonIntensityOracle...");
    const Oracle = await hre.ethers.getContractFactory("CarbonIntensityOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("✅ Oracle deployed to:", oracleAddress);
    
    // Set initial carbon intensity
    const setIntensityTx = await oracle.setCarbonIntensity(250); // Clean by default
    await setIntensityTx.wait();
    console.log("✅ Initial carbon intensity set to 250 gCO2/kWh (CLEAN)\n");
    
    // 2. Deploy NFT
    console.log("2️⃣  Deploying CarbonGhostNFT...");
    const NFT = await hre.ethers.getContractFactory("CarbonGhostNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ NFT deployed to:", nftAddress, "\n");
    
    // 3. Deploy Game Logic
    // Integration interval: ~107 calculations per month
    // Polygon: ~43,200 blocks/day = ~1,296,000 blocks/month
    // 1,296,000 / 107 ≈ 12,112 blocks between calculations
    const integrationInterval = 12112; // For Polygon
    
    console.log("3️⃣  Deploying GameLogic...");
    console.log("📊 Integration interval:", integrationInterval, "blocks (~107 times/month)");
    const GameLogic = await hre.ethers.getContractFactory("GameLogic");
    const gameLogic = await GameLogic.deploy(nftAddress, integrationInterval);
    await gameLogic.waitForDeployment();
    const gameLogicAddress = await gameLogic.getAddress();
    console.log("✅ GameLogic deployed to:", gameLogicAddress, "\n");
    
    // 4. Set permissions
    console.log("4️⃣  Setting up permissions...");
    const transferOwnershipTx = await nft.transferOwnership(gameLogicAddress);
    await transferOwnershipTx.wait();
    console.log("✅ NFT ownership transferred to GameLogic\n");
    
    // 5. Print summary
    console.log("📋 Deployment Summary");
    console.log("═══════════════════════════════════════");
    console.log("Oracle Address:     ", oracleAddress);
    console.log("NFT Address:        ", nftAddress);
    console.log("GameLogic Address:  ", gameLogicAddress);
    console.log("Integration Interval:", integrationInterval, "blocks");
    console.log("═══════════════════════════════════════\n");
    
    console.log("📝 Add these to your .env file:");
    console.log(`ORACLE_ADDRESS=${oracleAddress}`);
    console.log(`GHOST_NFT_ADDRESS=${nftAddress}`);
    console.log(`GAME_LOGIC_ADDRESS=${gameLogicAddress}\n`);
    
    console.log("✅ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });