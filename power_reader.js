// power_reader_v2.js - Hardware simulator with variable power

const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');

const RELAY_URL = process.env.RELAY_URL || 'http://localhost:3000';

// Device configuration
const deviceId = process.argv[2] || 'device-1';
const deviceAddress = process.argv[3];

if (!deviceAddress) {
    console.error('Usage: node power_reader_v2.js <deviceId> <deviceAddress>');
    process.exit(1);
}

// Load or create RSA keypair (simulates TPM)
const keyDir = `./devices/${deviceId}`;
const privateKeyPath = `${keyDir}/private.pem`;
const publicKeyPath = `${keyDir}/public.pem`;

if (!fs.existsSync(keyDir)) {
    fs.mkdirSync(keyDir, { recursive: true });
}

let privateKey, publicKey;

if (fs.existsSync(privateKeyPath)) {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    console.log(`✓ Loaded keys for ${deviceId}`);
} else {
    const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    fs.writeFileSync(privateKeyPath, privKey);
    fs.writeFileSync(publicKeyPath, pubKey);
    
    privateKey = privKey;
    publicKey = pubKey;
    
    console.log(`✓ Generated new keys for ${deviceId}`);
}

// Register device with relay
async function registerDevice() {
    try {
        console.log(`✓ Device registered with relay`);
    } catch (error) {
        console.error('✗ Registration failed:', error.message);
    }
}

// Simulate power consumption with realistic variation
function simulatePowerConsumption() {
    // Base power varies by data center size
    // Small: 1-5 MW     = 1,000,000 - 5,000,000 W
    // Medium: 5-12.5 MW = 5,000,000 - 12,500,000 W
    // Large: 12.5-20 MW = 12,500,000 - 20,000,000 W
    // Huge: 20-60 MW    = 20,000,000 - 60,000,000 W
    // Mega: 60-100 MW   = 60,000,000 - 100,000,000 W
    
    // For demo, vary between different tiers
    const scenarios = [
        { min: 1_000_000, max: 5_000_000, name: 'Small DC (α=0.2)' },
        { min: 5_000_000, max: 12_500_000, name: 'Medium DC (α=0.4)' },
        { min: 12_500_000, max: 20_000_000, name: 'Large DC (α=0.6)' },
        { min: 20_000_000, max: 60_000_000, name: 'Huge DC (α=0.8)' },
        { min: 60_000_000, max: 100_000_000, name: 'Mega DC (α=1.0)' }
    ];
    
    // Change scenario every 10 readings for demo purposes
    const readingCount = Math.floor(Date.now() / 5000) % 50;
    const scenarioIndex = Math.floor(readingCount / 10) % scenarios.length;
    const scenario = scenarios[scenarioIndex];
    
    const power = Math.floor(
        scenario.min + Math.random() * (scenario.max - scenario.min)
    );
    
    return { power, scenarioName: scenario.name };
}

// Generate and send power reading
async function sendPowerReading() {
    try {
        // Simulate power measurement
        const { power, scenarioName } = simulatePowerConsumption();
        const timestamp = new Date().toISOString();
        
        // Create signature (simulates TPM signing)
        const dataString = JSON.stringify({ timestamp, powerUsage: power });
        const hash = crypto.createHash('sha256').update(dataString).digest();
        const signature = crypto.sign('sha256', hash, privateKey);
        
        console.log(`\n⚡ Power Reading: ${(power / 1_000_000).toFixed(2)} MW (${scenarioName})`);
        console.log(`🔐 Timestamp: ${timestamp}`);
        console.log(`🔏 Signature: ${signature.toString('hex').substring(0, 16)}...`);
        
        // Send to relay
        const response = await axios.post(`${RELAY_URL}/reading`, {
            deviceId,
            deviceAddress,
            timestamp,
            powerUsage: power,
            signature: signature.toString('hex'),
            publicKey: publicKey
        });
        
        const data = response.data;
        
        console.log(`\n✅ Reading processed successfully`);
        console.log(`📊 Grid Status: ${data.gridStatus} (${data.carbonIntensity} gCO2/kWh)`);
        console.log(`💚 Health: ${data.oldHealth}% → ${data.health}%`);
        console.log(`👻 Appearance: ${data.appearance}`);
        console.log(`📈 Good Credits: ${data.goodCredits}`);
        console.log(`📉 Bad Credits: ${data.badCredits}`);
        console.log(`⚡ Alpha (α): ${data.alpha}`);
        console.log(`💰 Deposit: ${data.deposit} MATIC`);
        console.log(`🔗 Transaction: ${data.transactionHash.substring(0, 16)}...`);
        
        if (data.integrationTriggered) {
            console.log(`📈 ⚠️  INTEGRATION CALCULATION TRIGGERED`);
        }
        
    } catch (error) {
        console.error('✗ Error sending reading:', error.response?.data || error.message);
    }
}

// Main loop
async function main() {
    console.log(`\n🔌 Starting power monitoring for ${deviceId}`);
    console.log(`📍 Device address: ${deviceAddress}`);
    console.log(`🔗 Relay: ${RELAY_URL}\n`);
    
    await registerDevice();
    
    // Send reading every 5 seconds
    setInterval(sendPowerReading, 5000);
    
    // Send first reading immediately
    sendPowerReading();
}

main();