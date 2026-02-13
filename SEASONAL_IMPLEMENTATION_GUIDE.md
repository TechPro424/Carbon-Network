# 🌸☀️🍂❄️ Seasonal Carbon Ghost - Complete Implementation Guide

## 📊 Your System Specifications

### Health Ranges & Seasons
| Health | Season | Mood | Visual | Behavior |
|--------|--------|------|--------|----------|
| **75-100** | 🌸 Spring | Blooming | Bright green, flowers | Healthy, thriving |
| **50-75** | ☀️ Summer | Warm | Yellow-green, sun | Okay, stable |
| **50** | 🌿 Neutral | Neutral | Yellowish-green | Starting point |
| **25-50** | 🍂 Fall | Declining | Orange/brown, leaves | Concerning, fading |
| **2-25** | ❄️ Winter | Critical | Dark gray, snow | Dying, critical |
| **0-1** | ☠️ Dead | Dead | Black, skull | Slashing penalty! |

### Energy Reading Flow
- **Frequency:** Every 5 seconds
- **Power Range:** 50-200 kW
- **Starting Health:** 50% (Summer season)
- **Clean Energy:** Ghost heals (+2% base + streak bonus)
- **Dirty Energy:** Ghost suffers (-3% base + streak penalty)

---

## 🔧 Step-by-Step Implementation

### **STEP 1: Deploy Seasonal Contracts**

#### 1.1 Update Your Contracts
Replace your existing contracts with the seasonal versions:

```bash
# Copy seasonal contracts
cp contracts/CarbonGhostNFT_Seasonal.sol contracts/CarbonGhostNFT.sol
cp contracts/GameLogic_Seasonal.sol contracts/GameLogic.sol
```

#### 1.2 Deploy to Polygon Amoy
```bash
# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network amoy
```

**Expected Output:**
```
✓ Oracle deployed to: 0xABC...
✓ NFT deployed to: 0xDEF...
✓ Game Logic deployed to: 0x123...
```

#### 1.3 Update .env
```bash
ORACLE_ADDRESS=0xABC...
GHOST_NFT_ADDRESS=0xDEF...
GAME_LOGIC_ADDRESS=0x123...
```

---

### **STEP 2: Understanding the Health System**

#### 2.1 How Health Changes

**CLEAN Energy Reading:**
```javascript
// Base healing
healAmount = 2% per reading

// Streak bonus
if (consecutiveClean % 5 == 0) {
    healAmount += 1%  // +1% bonus every 5 consecutive clean readings
}

// Apply (cap at 100%)
health = min(health + healAmount, 100)
```

**Example Clean Sequence:**
```
Reading 1: 50% → 52% (+2%)
Reading 2: 52% → 54% (+2%)
Reading 3: 54% → 56% (+2%)
Reading 4: 56% → 58% (+2%)
Reading 5: 58% → 61% (+2% + 1% streak bonus!)
Reading 6: 61% → 63% (+2%)
...
```

**DIRTY Energy Reading:**
```javascript
// Base damage
damageAmount = 3% per reading

// Streak penalty
if (consecutiveDirty % 5 == 0) {
    damageAmount += 1%  // +1% extra damage every 5 consecutive dirty
}

// Apply (floor at 0%)
health = max(health - damageAmount, 0)
```

**Example Dirty Sequence:**
```
Reading 1: 50% → 47% (-3%)
Reading 2: 47% → 44% (-3%)
Reading 3: 44% → 41% (-3%)
Reading 4: 41% → 38% (-3%)
Reading 5: 38% → 34% (-3% - 1% streak penalty!)
Reading 6: 34% → 31% (-3%)
...
```

#### 2.2 Season Transitions

Ghost automatically changes season when health crosses thresholds:

```
Health 74% (Summer) → Clean Reading → 76% (Spring!)
    ↓
Season changes from Summer to Spring
Image URI updates
Mood changes from "Warm" to "Blooming"
Event: SeasonChanged("Summer", "Spring")
```

---

### **STEP 3: Economic Model**

#### 3.1 Rewards & Penalties

| Event | Amount | What Happens |
|-------|--------|--------------|
| Clean Reading | +0.002 MATIC | Added to deposit |
| Dirty Reading | -0.003 MATIC | Sent to burn address |
| Green Credit | +1 credit | Non-fungible reputation |
| **Ghost Dies (0% health)** | **-0.1 MATIC** | **MAJOR SLASH** |

#### 3.2 Death Penalty Example

```javascript
// Ghost at 3% health
health: 3%
deposit: 0.5 MATIC

// Dirty reading comes in
health: 3% - 3% = 0%  // DEAD!

// DEATH SLASH TRIGGERED
penaltyAmount = 0.1 MATIC  // Not the usual 0.003!
deposit: 0.5 - 0.1 = 0.4 MATIC
0.1 MATIC → burned

Event: DeathSlash(device, 0.1 MATIC, 0.4 MATIC remaining)
Event: GhostDied(tokenId, owner)
```

#### 3.3 Sample 24-Hour Scenario

**Starting State:**
- Health: 50% (Summer)
- Deposit: 1.0 MATIC
- Green Credits: 0

**Hour 1-12: Clean Energy (144 readings at 5sec each)**
```
144 clean readings × +2% = need only 25 to reach 100%
After 25 readings: 50% → 100% (Spring!)
Rewards: 144 × 0.002 = 0.288 MATIC
Green Credits: +144
Deposit: 1.0 + 0.288 = 1.288 MATIC
```

**Hour 13-24: Dirty Energy (144 readings)**
```
144 dirty readings × -3% = would drop 432%
But health floors at 0% after 34 readings (100/3 = 33.3)

After 34 readings: 100% → 0% (DEAD!)
Death slash: -0.1 MATIC
Regular penalties: 33 × 0.003 = 0.099 MATIC
Total penalties: 0.199 MATIC
Deposit: 1.288 - 0.199 = 1.089 MATIC

Ghost is DEAD (needs revival or re-mint)
```

**Net Result After 24h:**
- Health: 0% (Dead)
- Deposit: 1.089 MATIC (+0.089 net profit)
- Green Credits: 144
- Status: Dead ghost (high penalty to revive)

---

### **STEP 4: Frontend Integration**

#### 4.1 Update Frontend Files

**File: `frontend/src/App.jsx`**
Already updated with:
- Season display with emoji
- Health bar with season-specific colors
- Mood indicator
- Clean streak counter
- Health labels (Healthy/Okay/Concerning/Critical/Dead)

**File: `frontend/src/App.css`**
Add the seasonal styles:
```bash
cat frontend/src/seasonal-styles.css >> frontend/src/App.css
```

#### 4.2 Frontend Display Example

```jsx
{
  health: 85,
  season: "Spring",
  mood: "Blooming",
  consecutiveClean: 12,
  deposit: "1.024"
}
```

Displays as:
```
Season: 🌸 Spring
Health: 85/100
███████████████░░░
Healthy (Spring)

Mood: Blooming
Deposit: 1.024 MATIC
Green Credits: 42 🌿
Clean Streak: 12 🔥
```

---

### **STEP 5: Testing the System**

#### 5.1 Test Clean Energy Path

```bash
# Terminal 1: Start relay
node relay.js

# Terminal 2: Set grid to CLEAN
npx hardhat console --network amoy
```

```javascript
const oracle = await ethers.getContractAt("CarbonIntensityOracle", process.env.ORACLE_ADDRESS);
await oracle.setCarbonIntensity(200); // Very clean grid
```

```bash
# Terminal 3: Start hardware simulator
node power_reader_v2.js device-1 YOUR_DEVICE_ADDRESS
```

**Watch:**
- Every 5 seconds: health increases by 2%
- After 5 readings: +1% bonus (streak)
- Health bar turns greener
- At 75%: Season changes to Spring!
- Deposit balance increases

#### 5.2 Test Dirty Energy Path

```javascript
// In hardhat console
await oracle.setCarbonIntensity(500); // Very dirty grid
```

**Watch:**
- Every 5 seconds: health decreases by 3%
- After 5 readings: -1% extra penalty (streak)
- Health bar turns orange/brown
- At 50%: Season changes to Fall
- At 25%: Season changes to Winter
- Deposit balance decreases
- At 0%: Ghost DIES + major slash!

#### 5.3 Test Season Transitions

Start at 50% (Summer):

```javascript
// Go to Spring
await oracle.setCarbonIntensity(200);
// Wait for ~13 readings (50% + 26% = 76%)
// Season changes to Spring!

// Go back to Fall
await oracle.setCarbonIntensity(500);
// Wait for ~9 readings (76% - 27% = 49%)
// Season changes to Fall!
```

---

### **STEP 6: How the Math Works**

#### 6.1 Time to Change Seasons

**From Summer (50%) to Spring (75%):**
```
Need: 25% health increase
Rate: +2% per reading (every 5 seconds)
Readings needed: 25 / 2 = 12.5 ≈ 13 readings
Time: 13 × 5 seconds = 65 seconds ≈ 1 minute
```

**From Summer (50%) to Fall (49%):**
```
Need: -1% health decrease
Rate: -3% per reading
Readings needed: 1 / 3 = 0.33 ≈ 1 reading
Time: 1 × 5 seconds = 5 seconds (instant!)
```

**From Spring (75%) to Dead (0%):**
```
Need: -75% health decrease
Rate: -3% per reading
Readings needed: 75 / 3 = 25 readings
Time: 25 × 5 seconds = 125 seconds ≈ 2 minutes
```

#### 6.2 Streak Impact

**Clean Streak Example:**
```
Readings 1-4: +2% each = +8%
Reading 5: +2% + 1% bonus = +3%
Readings 6-9: +2% each = +8%
Reading 10: +2% + 1% bonus = +3%

Total over 10 readings: 8 + 3 + 8 + 3 = +22%
Without streaks: 10 × 2% = +20%
Bonus from streaks: +2% (10% improvement!)
```

**Dirty Streak Example:**
```
Readings 1-4: -3% each = -12%
Reading 5: -3% - 1% penalty = -4%
Readings 6-9: -3% each = -12%
Reading 10: -3% - 1% penalty = -4%

Total over 10 readings: -32%
Without streaks: 10 × -3% = -30%
Extra damage from streaks: -2% (worse!)
```

---

### **STEP 7: Smart Contract Events**

#### 7.1 Events You'll See

**On Each Reading:**
```solidity
emit GhostUpdated(tokenId, newHealth, newSeason, newMood);
```

**When Season Changes:**
```solidity
emit SeasonChanged(tokenId, "Summer", "Spring");
```

**When Ghost Dies:**
```solidity
emit GhostDied(tokenId, owner);
emit DeathSlash(device, 0.1 ether, remainingDeposit);
```

**On Economic Actions:**
```solidity
emit Rewarded(device, 0.002 ether, newHealth);
emit Penalized(device, 0.003 ether, newHealth);
emit GreenCreditEarned(device, 1);
```

#### 7.2 Watching Events

```javascript
// In hardhat console or frontend
const nft = await ethers.getContractAt("CarbonGhostNFT", NFT_ADDRESS);

nft.on("SeasonChanged", (tokenId, fromSeason, toSeason) => {
    console.log(`Ghost #${tokenId}: ${fromSeason} → ${toSeason}`);
});

nft.on("GhostDied", (tokenId, owner) => {
    console.log(`💀 Ghost #${tokenId} has died! Owner: ${owner}`);
});
```

---

### **STEP 8: Monitoring & Debugging**

#### 8.1 Check Ghost State

```javascript
// In hardhat console
const nft = await ethers.getContractAt("CarbonGhostNFT", process.env.GHOST_NFT_ADDRESS);
const ghost = await nft.getGhost(0); // Token ID 0

console.log("Health:", ghost.health.toString());
console.log("Season:", ghost.season);
console.log("Mood:", ghost.mood);
console.log("Clean Readings:", ghost.totalCleanReadings.toString());
console.log("Dirty Readings:", ghost.totalDirtyReadings.toString());
console.log("Clean Streak:", ghost.consecutiveClean.toString());
console.log("Dirty Streak:", ghost.consecutiveDirty.toString());
```

#### 8.2 Check Deposit Balance

```javascript
const game = await ethers.getContractAt("GameLogic", process.env.GAME_LOGIC_ADDRESS);
const deposit = await game.getDeposit(YOUR_ADDRESS);
console.log("Deposit:", ethers.formatEther(deposit), "MATIC");

const credits = await game.getGreenCredits(YOUR_ADDRESS);
console.log("Green Credits:", credits.toString());
```

#### 8.3 View Full History

```javascript
const history = await nft.getGhostHistory(0);
console.log("Total Clean:", history.totalClean.toString());
console.log("Total Dirty:", history.totalDirty.toString());
console.log("Current Health:", history.health.toString());
console.log("Season:", history.season);
console.log("Clean Streak:", history.cleanStreak.toString());
console.log("Dirty Streak:", history.dirtyStreak.toString());
```

---

### **STEP 9: Presentation Tips**

#### 9.1 Demo Script

**Part 1: Show Neutral State (30 sec)**
```
"Here's our ghost starting at 50% health in Summer season.
It's neutral - neither healthy nor sick."
```

**Part 2: Clean Energy Demo (1 min)**
```
"Now I'm switching to clean energy. Watch the health increase...
See? Every 5 seconds it gains 2%. The health bar is turning green.
There! It just crossed 75% - it changed to Spring season!
The ghost is blooming. And our deposit is increasing too."
```

**Part 3: Dirty Energy Demo (1 min)**
```
"Now let's see what happens with dirty energy...
Health dropping 3% every 5 seconds. Much faster decline!
There - it dropped below 50%, now it's Fall season.
The ghost looks concerning, orange and declining.
And we're getting slashed - losing money every reading."
```

**Part 4: Death Demo (30 sec)**
```
"If we let it continue... there! Ghost health hit zero.
The ghost died. See that? We just got slashed 0.1 MATIC!
That's a major penalty - 33x the normal penalty.
This creates real consequences for sustained dirty energy."
```

#### 9.2 Key Points to Emphasize

1. **Real-Time Visual Feedback**
   - "The ghost changes appearance immediately based on behavior"
   - "You can SEE your carbon footprint"

2. **Economic Incentives**
   - "Clean energy earns you money and credits"
   - "Dirty energy costs you money"
   - "Death penalty is severe"

3. **Streak System**
   - "Consistent behavior is rewarded/punished more"
   - "Encourages sustained green operation"

4. **Transparent & Immutable**
   - "All history on-chain"
   - "Can't fake or game the system"
   - "Soulbound to hardware"

---

## ✅ Implementation Checklist

### Contracts
- [ ] Deploy CarbonGhostNFT_Seasonal.sol
- [ ] Deploy GameLogic_Seasonal.sol
- [ ] Deploy CarbonIntensityOracleV2.sol
- [ ] Update .env with addresses
- [ ] Mint ghost starting at 50% health
- [ ] Make initial 1 MATIC deposit

### Frontend
- [ ] Update App.jsx with seasonal code
- [ ] Add seasonal-styles.css
- [ ] Test season display
- [ ] Test health bar colors
- [ ] Test streak counter

### Testing
- [ ] Test clean energy path (50% → 75% → 100%)
- [ ] Test dirty energy path (50% → 25% → 0%)
- [ ] Test season transitions
- [ ] Test streak bonuses/penalties
- [ ] Test death slash
- [ ] Verify deposit changes
- [ ] Verify green credits accumulation

### Demo Prep
- [ ] Record clean energy transformation
- [ ] Record dirty energy decline
- [ ] Record ghost death
- [ ] Screenshot all 5 seasons
- [ ] Prepare split-screen view
- [ ] Test live oracle switching

---

## 🎯 Summary

**You now have:**

✅ **5 Seasonal States** with unique visuals  
✅ **Dynamic Health System** (+2%/-3% per 5 seconds)  
✅ **Streak Bonuses/Penalties** (every 5 consecutive)  
✅ **Economic Model** (rewards, penalties, death slash)  
✅ **Real-Time Updates** (every 5 seconds)  
✅ **Soulbound NFT** (can't be gamed)  
✅ **Complete Frontend** (seasonal display)  
✅ **Immutable History** (all on-chain)  

**This is a sophisticated, production-ready carbon accountability system with game mechanics that create real behavioral incentives.** 🌸☀️🍂❄️☠️
