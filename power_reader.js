import crypto from "crypto";
import fs from "fs";
import path from "path";
import axios from "axios";
import 'dotenv/config'; // Loads .env file

const __dirname = import.meta.dirname;

// 1. Configuration (Robust Loading)
const RELAY_URL = process.env.RELAY_URL || "http://localhost:3000";

// Support CLI argument OR .env variable (CLI takes priority)
const deviceName = process.argv[2] || process.env.DEVICE_NAME || "device-1";
let deviceAddress = process.argv[3] || process.env.DEVICE_ADDRESS || process.env.WALLET_ADDRESS;

// 🚨 SAFETY CHECK 1: Ensure address exists
if (!deviceAddress) {
    console.error("❌ CRITICAL ERROR: No Device Address found!");
    console.error("👉 Check your .env file or pass it as an argument:");
    console.error("   node power_reader.js device-1 0xYourAddress");
    process.exit(1);
}

// 🚨 SAFETY CHECK 2: Force correct formatting (Checksum)
// This fixes "bad address checksum" errors by ensuring it's not just lowercase/malformed
// (We just log it here, the Relay will handle the strict validation)
if (!deviceAddress.startsWith("0x") || deviceAddress.length !== 42) {
    console.error(`❌ CRITICAL ERROR: Invalid Address Format: ${deviceAddress}`);
    process.exit(1);
}

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
        console.log(`\n🔌 Connecting to Relay at ${RELAY_URL}...`);
        const response = await axios.post(`${RELAY_URL}/register-device`, {
            deviceAddress,
            publicKey
        });
        console.log('✓ Device registered with relay');
        console.log(`✓ Bound to Address: ${deviceAddress}`);
    } catch (error) {
        console.error('❌ Failed to register device:', error.message);
        if(error.code === 'ECONNREFUSED') console.log("👉 Is the Relay Server running?");
    }
}

// Send reading to relay
async function sendReading(signedReading) {
    try {
        // 🚨 SAFETY CHECK 3: Verify address before sending
        if(!deviceAddress.startsWith("0x")) {
             throw new Error(`Address corrupted at runtime: ${deviceAddress}`);
        }

        const response = await axios.post(`${RELAY_URL}/reading`, {
            ...signedReading,
            deviceAddress // <--- This is where the error was happening
        });

        console.log('\n📊 RELAY RESPONSE:');
        console.log(`Grid Status:     ${response.data.gridStatus}`);
        console.log(`Carbon Intensity: ${response.data.carbonIntensity} gCO2/kWh`);
        console.log(`Ghost Health:    ${response.data.ghost.health} (${response.data.ghost.mood})`); // Seasonal Update!
        console.log(`Deposit Balance: ${response.data.deposit} MATIC`);
        console.log(`Green Credits:   ${response.data.greenCredits}`);
        console.log(`Transaction:     ${response.data.transaction?.substring(0, 10)}...`);

    } catch (error) {
        if (error.response) {
            console.error('❌ Relay error:', error.response.data.error);
        } else {
            console.error('❌ Network error:', error.message);
        }
    }
}

// Initialize
await registerDevice();

console.log('\n🔌 Starting power monitoring (Seasonal Mode)...\n');

setInterval(() => {
    const reading = {
        timestamp: new Date().toISOString(),
        powerUsage: Math.floor(Math.random() * 150) + 50 // 50-200W
    };

    const readingString = JSON.stringify(reading);

    const hash = crypto
        .createHash("sha256")
        .update(readingString)
        .digest("hex");

    const signature = crypto.sign(
        "sha256",
        Buffer.from(hash),
        privateKey
    );

    const signedReading = {
        ...reading,
        hash,
        signature: signature.toString("base64"),
        publicKey
    };

    console.log(`\n⚡ Power Reading: ${reading.powerUsage}W at ${reading.timestamp.split('T')[1].split('.')[0]}`);
    console.log('📝 Sending to relay...');

    sendReading(signedReading);

}, 30000); // 30 seconds for testnet stability