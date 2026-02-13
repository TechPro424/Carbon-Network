import hre from "hardhat";
import "dotenv/config"; // Loads your .env file automatically
const { ethers } = hre;

async function main() {
    // 1. Read addresses directly from process.env
    const nftAddress = process.env.GHOST_NFT_ADDRESS;
    const gameLogicAddress = process.env.GAME_LOGIC_ADDRESS;

    // Safety Check
    if (!nftAddress || !gameLogicAddress) {
        throw new Error("❌ STOP! Missing addresses in your .env file.");
    }

    console.log(`📍 NFT Address:       ${nftAddress}`);
    console.log(`📍 GameLogic Address: ${gameLogicAddress}`);

    // 2. Get the NFT Contract
    const nft = await ethers.getContractAt("CarbonGhostNFT", nftAddress);

    // 3. Check if transfer is actually needed
    const currentOwner = await nft.owner();
    if (currentOwner === gameLogicAddress) {
        console.log("✅ GOOD NEWS: GameLogic is ALREADY the owner. No action needed.");
        return;
    }

    // 4. Transfer Ownership
    console.log("🔄 Transferring ownership to GameLogic...");
    const tx = await nft.transferOwnership(gameLogicAddress);

    console.log("⏳ Waiting for confirmation...");
    await tx.wait();

    console.log("✅ DONE! GameLogic is now the owner.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});