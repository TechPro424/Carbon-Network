const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Configuration
const RELAY_URL = process.env.RELAY_URL || "http://localhost:3000";
const deviceName = process.argv[2] || "device-1";
const deviceAddress = process.argv[3] || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"; // Example address

const devicePath = path.join(__dirname, "devices", deviceName);
const privateKeyPath = path.join(devicePath, "private.pem");
const publicKeyPath = path.join(devicePath, "public.pem");

// Create device folder if it doesn't exist
if (!fs.existsSync(devicePath)) {
    fs.mkdirSync(devicePath, { recursive: true });
}

let privateKey;
let publicKey;

// Load or generate keys
if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    privateKey = fs.readFileSync(privateKeyPath, "utf8");
    publicKey = fs.readFileSync(publicKeyPath, "utf8");
    console.log(`✓ Loaded keys for ${deviceName}`);
} else {
    const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
    });

    privateKey = keyPair.privateKey.export({
        type: "pkcs1",
        format: "pem",
    });

    publicKey = keyPair.publicKey.export({
        type: "pkcs1",
        format: "pem",
    });

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log(`✓ Generated new keys for ${deviceName}`);
}

// Register device with relay
async function registerDevice() {
    try {
        const response = await axios.post(`${RELAY_URL}/register-device`, {
            deviceAddress,
            publicKey
        });
        console.log('✓ Device registered with relay');
        console.log(`Device address: ${deviceAddress}`);
    } catch (error) {
        console.error('Failed to register device:', error.message);
    }
}

// Send reading to relay
async function sendReading(signedReading) {
    try {
        const response = await axios.post(`${RELAY_URL}/reading`, {
            ...signedReading,
            deviceAddress
        });
        
        console.log('\n📊 RELAY RESPONSE:');
        console.log('Grid Status:', response.data.gridStatus);
        console.log('Carbon Intensity:', response.data.carbonIntensity, 'gCO2/kWh');
        console.log('Ghost Health:', response.data.ghost.health);
        console.log('Ghost Mood:', response.data.ghost.mood);
        console.log('Deposit Balance:', response.data.deposit, 'MATIC');
        console.log('Green Credits:', response.data.greenCredits);
        console.log('Transaction:', response.data.transaction);
        
    } catch (error) {
        if (error.response) {
            console.error('❌ Relay error:', error.response.data.error);
        } else {
            console.error('❌ Network error:', error.message);
        }
    }
}

// Initialize
registerDevice();

// Main loop - send readings every 10 seconds
console.log('\n🔌 Starting power monitoring...\n');

setInterval(() => {
    // Simulate power reading
    const reading = {
        timestamp: new Date().toISOString(),
        powerUsage: Math.floor(Math.random() * 150) + 50 // 50-200W
    };

    const readingString = JSON.stringify(reading);

    // Create hash
    const hash = crypto
        .createHash("sha256")
        .update(readingString)
        .digest("hex");

    // Sign the hash
    const signature = crypto.sign(
        "sha256",
        Buffer.from(hash),
        privateKey
    );

    // Create signed packet
    const signedReading = {
        ...reading,
        hash,
        signature: signature.toString("base64"),
        publicKey
    };

    console.log(`\n⚡ Power Reading: ${reading.powerUsage}W at ${reading.timestamp}`);
    console.log('📝 Sending to relay...');
    
    sendReading(signedReading);

}, 10000); // Every 10 seconds
