import hre from "hardhat";
import 'dotenv/config';

async function main() {
    const gameAddress = process.env.GAME_LOGIC_ADDRESS;
    const amount = process.env.AMOUNT || "1.0"; // Default 1 MATIC

    if (!gameAddress) {
        console.error("❌ GAME_LOGIC_ADDRESS not found in .env");
        process.exit(1);
    }

    console.log("Making deposit to GameLogic contract...");
    console.log("Contract:", gameAddress);
    console.log("Amount:", amount, "MATIC");
    console.log();

    const Game = await hre.ethers.getContractFactory("GameLogic");
    const game = Game.attach(gameAddress);

    const [signer] = await hre.ethers.getSigners();
    console.log("Your address:", signer.address);

    const balanceBefore = await hre.ethers.provider.getBalance(signer.address);
    console.log("Balance before:", hre.ethers.formatEther(balanceBefore), "MATIC");
    console.log();

    const tx = await game.deposit({ 
        value: hre.ethers.parseEther(amount) 
    });
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✓ Transaction confirmed in block:", receipt.blockNumber);

    const balanceAfter = await hre.ethers.provider.getBalance(signer.address);
    console.log("\nBalance after:", hre.ethers.formatEther(balanceAfter), "MATIC");

    const depositBalance = await game.getDeposit(signer.address);
    console.log("Your deposit balance:", hre.ethers.formatEther(depositBalance), "MATIC");
    
    console.log("\n✅ Deposit successful!");
    console.log("You can now start using the hardware simulator");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
