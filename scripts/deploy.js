import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n🚀 Deploying Seasonal Contracts...");
  console.log("-----------------------------------");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy Oracle (Chainlink Functions Version)
  console.log("\n📄 Deploying CarbonIntensityOracle...");

  // POLYGON AMOY CONSTANTS
  const routerAddress = "0xC22a79eBA640940ABB6dF0f7982cc119578E11De";
  const donId = "0x66756e2d706f6c79676f6e2d616d6f792d310000000000000000000000000000";
  const subscriptionId = 0; // We use 0 for now (you can set a real one later)

  const Oracle = await hre.ethers.getContractFactory("CarbonIntensityOracle");

  // Pass the 3 required arguments to the constructor
  const oracle = await Oracle.deploy(routerAddress, subscriptionId, donId);

  await oracle.waitForDeployment();
  const oracleAddress = oracle.target || oracle.address;
  console.log("✓ Oracle deployed to:", oracleAddress);

  // 2. Deploy NFT
  console.log("\n👻 Deploying CarbonGhostNFT...");
  const NFT = await hre.ethers.getContractFactory("CarbonGhostNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = nft.target || nft.address;
  console.log("✓ NFT deployed to:", nftAddress);

  // 3. Deploy GameLogic (Linked to NFT)
  console.log("\n🎮 Deploying GameLogic...");
  const GameLogic = await hre.ethers.getContractFactory("GameLogic");
  const gameLogic = await GameLogic.deploy(nftAddress);
  await gameLogic.waitForDeployment();
  const gameLogicAddress = gameLogic.target || gameLogic.address;
  console.log("✓ Game Logic deployed to:", gameLogicAddress);

  // // 4. THE FIX: Automatic Ownership Transfer
  // console.log("\n🔐 Setting up permissions...");
  // try {
  //     // The GameLogic contract must own the NFT contract to update its stats
  //     const tx = await nft.transferOwnership(gameLogicAddress);
  //     console.log("⏳ Waiting for ownership transfer...");
  //     await tx.wait();
  //
  //     // Verify it worked
  //     const newOwner = await nft.owner();
  //     if (newOwner === gameLogicAddress) {
  //         console.log("✅ SUCCESS: Ownership transferred to GameLogic");
  //     } else {
  //         console.log("❌ FAILED: Owner is still", newOwner);
  //     }
  // } catch (error) {
  //     console.error("❌ CRITICAL ERROR during ownership transfer:");
  //     console.error(error);
  // }

  // 5. Print Final Config for .env
  console.log("\n📝 UPDATE YOUR .ENV FILE WITH THESE VALUES:");
  console.log("-----------------------------------");
  console.log(`ORACLE_ADDRESS=${oracleAddress}`);
  console.log(`GHOST_NFT_ADDRESS=${nftAddress}`);
  console.log(`GAME_LOGIC_ADDRESS=${gameLogicAddress}`);
  console.log("-----------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});