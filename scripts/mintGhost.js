import hre from "hardhat";
import 'dotenv/config';

async function main() {
    console.log("\n Minting Ghost NFT");


    const nftAddress = process.env.GHOST_NFT_ADDRESS;
    const ownerAddress = process.env.WALLET_ADDRESS;
    const deviceAddress = process.env.DEVICE_ADDRESS || ownerAddress;


    if (!nftAddress) {
        console.error("❌ Error: GHOST_NFT_ADDRESS is missing in .env file");
        process.exit(1);
    }
    if (!ownerAddress) {
        console.error("❌ Error: WALLET_ADDRESS is missing in .env file");
        process.exit(1);
    }

    console.log("----------------------------------------------------");
    console.log("Contract:", nftAddress);
    console.log("Owner:   ", ownerAddress);
    console.log("Device:  ", deviceAddress);

    // 3. Generate Random Hardware ID (Critical step!)
    const hardwareId = hre.ethers.hexlify(hre.ethers.randomBytes(32));
    console.log("Chip ID: ", hardwareId);
    console.log("----------------------------------------------------");

    // 4. Connect to Contract
    const nft = await hre.ethers.getContractAt("CarbonGhostNFT", nftAddress);

    try {
        // 5. Mint
        const tx = await nft.mintGhost(ownerAddress, deviceAddress, hardwareId);
        console.log("⏳ Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

        console.log("\n🎉 Ghost minted successfully!");
        console.log("You can now start the simulator!");

    } catch (error) {
        console.error("\n❌ Minting Failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });