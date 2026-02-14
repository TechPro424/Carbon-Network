// relay.js - Off-chain computation for Carbon Ghost

const express = require('express');
const { ethers } = require('ethers');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ghostNFT = new ethers.Contract(
    process.env.GHOST_NFT_ADDRESS,
    [
        "function updateGhost(uint256 tokenId, string appearance, uint256 health, uint256 goodCredits, uint256 badCredits, uint256 alpha, uint256 powerMW) external",
        "function getGhost(uint256 tokenId) external view returns (tuple(uint256 health, string appearance, uint256 lastUpdate, address deviceOwner, bytes32 hardwareId, bool isSoulbound, uint256 goodCredits, uint256 badCredits, uint256 currentAlpha, uint256 currentPowerMW))",
        "function deviceToToken(address device) external view returns (uint256)"
    ],
    wallet
);

const gameLogic = new ethers.Contract(
    process.env.GAME_LOGIC_ADDRESS,
    [
        "function processReading(address device, uint256 tokenId, string gridStatus, uint256 newHealth, uint256 oldHealth) external",
        "function getDeposit(address user) external view returns (uint256)",
        "function shouldCalculateIntegration(address device) external view returns (bool)"
    ],
    wallet
);

const oracle = new ethers.Contract(
    process.env.ORACLE_ADDRESS,
    [
        "function getGridStatus() external view returns (string)",
        "function carbonIntensity() external view returns (uint256)"
    ],
    provider
);

// In-memory credit tracking (persisted to blockchain periodically)
const deviceCredits = new Map();

/**
 * Calculate alpha based on power consumption
 * @param {number} powerWatts - Power in watts
 * @returns {number} Alpha scaled by 1000 (200 = 0.2, 1000 = 1.0)
 */
function calculateAlpha(powerWatts) {
    const powerMW = powerWatts / 1_000_000;
    
    if (powerMW >= 60 && powerMW <= 100) return 1000; // α = 1.0
    if (powerMW >= 20 && powerMW < 60) return 800;    // α = 0.8
    if (powerMW >= 12.5 && powerMW < 20) return 600;  // α = 0.6
    if (powerMW >= 5 && powerMW < 12.5) return 400;   // α = 0.4
    return 200; // α = 0.2 (1-5 MW or below)
}

/**
 * Calculate health using power-weighted formula
 * Health = (α × g(t) × 100) / (g(t) + b(t))
 * @param {number} goodCredits - g(t)
 * @param {number} badCredits - b(t)
 * @param {number} alpha - Alpha value (scaled by 1000)
 * @returns {number} Health percentage (0-100)
 */
function calculateHealth(goodCredits, badCredits, alpha) {
    const g = goodCredits;
    const b = badCredits;
    
    if (g + b === 0) return 50; // Start at neutral
    
    // Health = (α × g × 100) / (g + b)
    // Alpha is scaled by 1000
    const health = Math.floor((alpha * g * 100) / ((g + b) * 1000));
    
    return Math.min(100, Math.max(0, health)); // Clamp to 0-100
}

/**
 * Get ghost appearance based on health
 */
function getAppearance(health) {
    if (health >= 80) return "VeryHealthy"; // 80-100%
    if (health >= 60) return "Healthy";     // 60-80%
    if (health >= 40) return "Neutral";     // 40-60%
    if (health >= 20) return "Bad";         // 20-40%
    return "Dead";                          // 0-20%
}

/**
 * Initialize device credits from blockchain
 */
async function initializeDeviceCredits(deviceAddress) {
    if (deviceCredits.has(deviceAddress)) {
        return deviceCredits.get(deviceAddress);
    }
    
    try {
        const tokenId = await ghostNFT.deviceToToken(deviceAddress);
        
        if (tokenId === 0n) {
            console.log(`⚠️  No ghost found for device ${deviceAddress}`);
            return null;
        }
        
        const ghost = await ghostNFT.getGhost(tokenId);
        
        const credits = {
            good: Number(ghost.goodCredits),
            bad: Number(ghost.badCredits),
            tokenId: Number(tokenId)
        };
        
        deviceCredits.set(deviceAddress, credits);
        console.log(`📊 Initialized credits for ${deviceAddress}:`, credits);
        
        return credits;
        
    } catch (error) {
        console.error('Error initializing device credits:', error);
        return null;
    }
}

/**
 * Process energy reading
 */
app.post('/reading', async (req, res) => {
    try {
        const {
            deviceId,
            deviceAddress,
            timestamp,
            powerUsage, // In watts (50,000 - 200,000)
            signature,
            publicKey
        } = req.body;
        
        console.log('\n📡 New reading received');
        console.log('Device:', deviceId);
        console.log('Power:', powerUsage, 'W');
        
        // 1. Verify hardware signature
        const dataString = JSON.stringify({ timestamp, powerUsage });
        const hash = crypto.createHash('sha256').update(dataString).digest();
        
        const isValid = crypto.verify(
            'sha256',
            hash,
            publicKey,
            Buffer.from(signature, 'hex')
        );
        
        if (!isValid) {
            console.log('❌ Invalid signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        console.log('✅ Signature verified');
        
        // 2. Initialize or get device credits
        let credits = await initializeDeviceCredits(deviceAddress);
        
        if (!credits) {
            return res.status(404).json({ error: 'No ghost found for device' });
        }
        
        const tokenId = credits.tokenId;
        
        // 3. Query oracle for grid status
        const gridStatus = await oracle.getGridStatus();
        const carbonIntensity = await oracle.carbonIntensity();
        
        console.log(`🌍 Grid: ${gridStatus} (${carbonIntensity} gCO2/kWh)`);
        
        // 4. Get old health (before update)
        const ghost = await ghostNFT.getGhost(tokenId);
        const oldHealth = Number(ghost.health);
        const oldAppearance = ghost.appearance;
        
        // 5. Update credits based on grid status
        if (gridStatus === "CLEAN") {
            credits.good += 1;
            console.log(`✅ Clean reading! Good credits: ${credits.good}`);
        } else {
            credits.bad += 1;
            console.log(`⚠️  Dirty reading! Bad credits: ${credits.bad}`);
        }
        
        // 6. Calculate alpha based on power consumption
        const alpha = calculateAlpha(powerUsage);
        const powerMW = Math.floor(powerUsage / 1_000_000 * 100) / 100; // Round to 2 decimals
        
        console.log(`⚡ Power: ${powerMW} MW → α = ${alpha / 1000}`);
        
        // 7. Calculate new health OFF-CHAIN
        const newHealth = calculateHealth(credits.good, credits.bad, alpha);
        const newAppearance = getAppearance(newHealth);
        
        console.log(`💚 Health: ${oldHealth}% → ${newHealth}%`);
        console.log(`👻 Appearance: ${oldAppearance} → ${newAppearance}`);
        
        // 8. Check if we should do integration calculation (every ~107 times/month)
        const shouldIntegrate = await gameLogic.shouldCalculateIntegration(deviceAddress);
        
        if (shouldIntegrate) {
            console.log('📈 Integration calculation triggered');
        }
        
        // 9. Update blockchain (NFT contract)
        console.log('📤 Updating blockchain...');
        
        const nftTx = await ghostNFT.updateGhost(
            tokenId,
            newAppearance,
            newHealth,
            credits.good,
            credits.bad,
            alpha,
            Math.floor(powerMW)
        );
        
        await nftTx.wait();
        console.log('✅ NFT updated:', nftTx.hash);
        
        // 10. Update game logic (economic consequences)
        const gameTx = await gameLogic.processReading(
            deviceAddress,
            tokenId,
            gridStatus,
            newHealth,
            oldHealth
        );
        
        await gameTx.wait();
        console.log('✅ Game logic updated:', gameTx.hash);
        
        // 11. Update local cache
        deviceCredits.set(deviceAddress, credits);
        
        // 12. Get updated deposit balance
        const deposit = await gameLogic.getDeposit(deviceAddress);
        
        res.json({
            success: true,
            transactionHash: nftTx.hash,
            gameLogicHash: gameTx.hash,
            health: newHealth,
            oldHealth: oldHealth,
            appearance: newAppearance,
            goodCredits: credits.good,
            badCredits: credits.bad,
            alpha: alpha / 1000,
            powerMW: powerMW,
            gridStatus: gridStatus,
            carbonIntensity: Number(carbonIntensity),
            deposit: ethers.formatEther(deposit),
            integrationTriggered: shouldIntegrate
        });
        
    } catch (error) {
        console.error('❌ Error processing reading:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get ghost data
 */
app.get('/ghost/:deviceAddress', async (req, res) => {
    try {
        const deviceAddress = req.params.deviceAddress;
        const tokenId = await ghostNFT.deviceToToken(deviceAddress);
        
        if (tokenId === 0n) {
            return res.status(404).json({ error: 'No ghost found' });
        }
        
        const ghost = await ghostNFT.getGhost(tokenId);
        const deposit = await gameLogic.getDeposit(deviceAddress);
        const stats = await gameLogic.getLifetimeStats(deviceAddress);
        
        res.json({
            tokenId: Number(tokenId),
            health: Number(ghost.health),
            appearance: ghost.appearance,
            goodCredits: Number(ghost.goodCredits),
            badCredits: Number(ghost.badCredits),
            alpha: Number(ghost.currentAlpha) / 1000,
            powerMW: Number(ghost.currentPowerMW),
            deposit: ethers.formatEther(deposit),
            lifetimeRewards: ethers.formatEther(stats.totalRewards),
            lifetimePenalties: ethers.formatEther(stats.totalPenalties),
            netChange: ethers.formatEther(stats.netChange),
            lastUpdate: Number(ghost.lastUpdate)
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get grid status
 */
app.get('/grid-status', async (req, res) => {
    try {
        const status = await oracle.getGridStatus();
        const intensity = await oracle.carbonIntensity();
        
        res.json({
            status: status,
            carbonIntensity: Number(intensity)
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🔗 Carbon Ghost Relay Server`);
    console.log(`📡 Running on port ${PORT}`);
    console.log(`🧮 Power-weighted health: (α × g × 100) / (g + b)`);
    console.log(`📊 Alpha based on power consumption (CO2 proxy)`);
    console.log(`✅ All computation OFF-CHAIN (cheap!)\n`);
});