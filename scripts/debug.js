import hre from 'hardhat';
import "dotenv/config";

async function main() {
    // 1. Get Setup
    const nftAddress = process.env.GHOST_NFT_ADDRESS;
    // Get your wallet address (the one you are trying to use)
    const [signer] = await hre.ethers.getSigners();

    console.log("\n🕵️‍♂️ DEBUGGING GHOST STATE");
    console.log("-----------------------------------------");
    console.log("My Wallet:    ", signer.address);
    console.log("NFT Contract: ", nftAddress);

    // 2. Check Contract
    const nft = await hre.ethers.getContractAt("CarbonGhostNFT", nftAddress);

    // 3. Check if this address has a Ghost ID
    console.log("\nChecking blockchain...");
    const tokenId = await nft.deviceToToken(signer.address);
    console.log("Token ID found:", tokenId.toString());

    if (tokenId.toString() === "0") {
        console.log("❌ PROBLEM FOUND: This address is NOT registered as a device.");
        console.log("👉 FIX: You need to run 'node scripts/mintGhost.js " + signer.address + " " + signer.address + "'");
    } else {
        console.log("✅ SUCCESS: The blockchain knows you!");
        console.log("👉 FIX: Your Relay server is stale. Stop it (Ctrl+C) and restart 'node relay.js'");
    }
    console.log("-----------------------------------------");
}

main().catch(console.error);