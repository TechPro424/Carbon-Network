import express from 'express';
import crypto from 'node:crypto';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const GHOST_NFT_ABI = [
    "function updateGhost(uint256 tokenId, string memory status) public",
    "function deviceToToken(address) public view returns (uint256)",
    "function getGhost(uint256 tokenId) public view returns (tuple(uint256 health, string mood, uint256 lastUpdate, address deviceOwner))"
];

const GAME_LOGIC_ABI = [
    "function processReading(address device, uint256 tokenId, string memory gridStatus) public",
    "function getDeposit(address user) public view returns (uint256)",
    "function getGreenCredits(address user) public view returns (uint256)"
];

const ORACLE_ABI = [
    "function getGridStatus() public view returns (string memory)",
    "function carbonIntensity() public view returns (uint256)",
    "function setCarbonIntensity(uint256 _intensity) public"
];

// Contract instances
const ghostNFT = new ethers.Contract(
    process.env.GHOST_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    GHOST_NFT_ABI,
    wallet
);

const gameLogic = new ethers.Contract(
    process.env.GAME_LOGIC_ADDRESS || '0x0000000000000000000000000000000000000000',
    GAME_LOGIC_ABI,
    wallet
);

const oracle = new ethers.Contract(
    process.env.ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
    ORACLE_ABI,
    wallet
);

// Store public keys for devices
const devicePublicKeys = new Map();

app.post('/register-device', async (req, res) => {
    try {
        const { deviceAddress, publicKey } = req.body;
        devicePublicKeys.set(deviceAddress, publicKey);
        
        res.json({ 
            success: true, 
            message: 'Device registered',
            deviceAddress 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/reading', async (req, res) => {
    try {
        const { timestamp, powerUsage, hash, signature, publicKey, deviceAddress } = req.body;
        
        console.log('Received reading from:', deviceAddress);
        console.log('Power usage:', powerUsage, 'W');
        
        // 1. Verify signature
        const dataString = JSON.stringify({ timestamp, powerUsage });
        const verifier = crypto.createVerify('SHA256');
        verifier.update(hash);
        
        const isValid = verifier.verify(publicKey, signature, 'base64');
        
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid signature - possible tampering detected!' });
        }
        
        console.log('✓ Signature verified');
        
        // 2. Get carbon intensity from oracle
        const gridStatus = await oracle.getGridStatus();
        const carbonIntensity = await oracle.carbonIntensity();
        
        console.log(`Grid status: ${gridStatus} (${carbonIntensity} gCO2/kWh)`);
        
        // 3. Get token ID for this device
        const tokenId = await ghostNFT.deviceToToken(deviceAddress);
        
        if (tokenId.toString() === '0') {
            return res.status(404).json({ error: 'No ghost NFT found for this device' });
        }
        
        console.log('Ghost NFT ID:', tokenId.toString());
        
        // 4. Process the reading on-chain
        const tx = await gameLogic.processReading(
            deviceAddress,
            tokenId,
            gridStatus
        );
        
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('✓ Transaction confirmed');
        
        // 5. Get updated ghost state
        const ghost = await ghostNFT.getGhost(tokenId);
        const deposit = await gameLogic.getDeposit(deviceAddress);
        const credits = await gameLogic.getGreenCredits(deviceAddress);
        
        res.json({
            success: true,
            verified: true,
            gridStatus,
            carbonIntensity: carbonIntensity.toString(),
            transaction: tx.hash,
            ghost: {
                health: ghost.health.toString(),
                mood: ghost.mood,
                lastUpdate: new Date(Number(ghost.lastUpdate) * 1000)
            },
            deposit: ethers.formatEther(deposit),
            greenCredits: credits.toString()
        });
        
    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/ghost/:deviceAddress', async (req, res) => {
    try {
        const { deviceAddress } = req.params;
        
        const tokenId = await ghostNFT.deviceToToken(deviceAddress);
        
        if (tokenId.toString() === '0') {
            return res.status(404).json({ error: 'No ghost found' });
        }
        
        const ghost = await ghostNFT.getGhost(tokenId);
        const deposit = await gameLogic.getDeposit(deviceAddress);
        const credits = await gameLogic.getGreenCredits(deviceAddress);
        
        res.json({
            tokenId: tokenId.toString(),
            health: ghost.health.toString(),
            mood: ghost.mood,
            lastUpdate: new Date(Number(ghost.lastUpdate) * 1000),
            deposit: ethers.formatEther(deposit),
            greenCredits: credits.toString()
        });
        
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/grid-status', async (req, res) => {
    try {
        const status = await oracle.getGridStatus();
        const intensity = await oracle.carbonIntensity();
        
        res.json({
            status,
            carbonIntensity: intensity.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔗 Relay server running on port ${PORT}`);
    console.log('Connected to Polygon Amoy testnet');
    console.log('Wallet address:', wallet.address);
});
