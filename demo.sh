#!/bin/bash

# Carbon Ghost - Quick Demo Script
# Use this if you need to show the concept quickly without full deployment

echo "🎭 Carbon Ghost - Quick Demo Mode"
echo "=================================="
echo ""
echo "This script simulates the full system locally for demo purposes"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create demo device if it doesn't exist
if [ ! -d "devices/demo-device" ]; then
    echo -e "${BLUE}Creating demo device...${NC}"
    mkdir -p devices/demo-device
fi

# Start the demo
echo -e "${GREEN}Starting Carbon Ghost Demo...${NC}"
echo ""

# Simulate a power reading cycle
echo -e "${BLUE}📊 PHASE 1: Hardware Layer${NC}"
echo "⚡ Power Reading: 127W"
echo "🔐 Creating cryptographic signature..."
echo "✓ Signature verified with TPM"
echo ""
sleep 2

echo -e "${BLUE}📊 PHASE 2: Relay Verification${NC}"
echo "🔍 Verifying hardware signature..."
echo "✓ Signature matches public key"
echo "✓ No tampering detected"
echo ""
sleep 2

echo -e "${BLUE}📊 PHASE 3: Oracle Check${NC}"
echo "🌍 Querying carbon intensity for region: IN-KA"
echo "📈 Carbon Intensity: 285 gCO2/kWh"
echo "✅ Grid Status: CLEAN"
echo ""
sleep 2

echo -e "${BLUE}📊 PHASE 4: Blockchain Update${NC}"
echo "⛓️  Submitting transaction to Polygon..."
echo "📝 Transaction Hash: 0x7a3f9d2b8c4e1a5f..."
echo "✓ Transaction confirmed in block 14520394"
echo ""
sleep 2

echo -e "${BLUE}📊 PHASE 5: Ghost Update${NC}"
echo "👻 Updating Ghost NFT..."
echo "  Health: 55 → 65 (+10)"
echo "  Mood: Happy 😊"
echo "  Deposit: 1.0 MATIC → 1.005 MATIC (+0.005 reward)"
echo "  Green Credits: +1 🌿"
echo ""
sleep 2

echo -e "${GREEN}═══════════════════════════════════${NC}"
echo -e "${GREEN}✨ Demo Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════${NC}"
echo ""
echo "Now switching to DIRTY grid scenario..."
echo ""
sleep 2

echo -e "${RED}⚠️  DIRTY GRID SCENARIO${NC}"
echo ""
echo "🌍 Carbon Intensity: 420 gCO2/kWh"
echo "❌ Grid Status: DIRTY"
echo ""
echo "👻 Updating Ghost NFT..."
echo "  Health: 65 → 55 (-10)"
echo "  Mood: Smoggy 😷"
echo "  Deposit: 1.005 → 0.995 MATIC (-0.01 slashed)"
echo "  🔥 Slashed amount sent to burn address"
echo ""
sleep 2

echo ""
echo -e "${GREEN}Demo Complete! Key Takeaways:${NC}"
echo ""
echo "✓ Real-time verification (not annual averages)"
echo "✓ Hardware attestation (can't lie about usage)"
echo "✓ Immediate consequences (slash/reward)"
echo "✓ Visual feedback (ghost changes)"
echo "✓ Economic incentives (build equity in infrastructure)"
echo ""
echo "Traditional carbon credits: Pay once a year, hope it works out"
echo "Carbon Ghost: Every compute cycle is measured and accountable"
echo ""
