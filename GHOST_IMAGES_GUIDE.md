# 👻 Carbon Ghost Images - Complete Guide

## 📁 Where Are the Ghost Images?

Your ghost images are in:
```
/assets/
├── green-ghost.svg      ← Happy/Clean ghost
├── smoggy-ghost.svg     ← Sad/Dirty ghost
└── ghost-preview.html   ← View them in browser
```

---

## 👀 How to See the Ghosts RIGHT NOW

### Option 1: Open in Browser (Recommended)
```bash
# Just open this file in any browser:
assets/ghost-preview.html
```

**Double-click the file** or drag it into Chrome/Firefox/Edge.

You'll see:
- ✅ Both ghosts side by side
- ✅ Animated (they float!)
- ✅ Stats showing what each means
- ✅ Explanation of differences

### Option 2: Open SVG Files Directly
```bash
# Open either SVG file:
assets/green-ghost.svg
assets/smoggy-ghost.svg
```

Just double-click - they'll open in your browser and animate!

---

## 🎨 What the Ghosts Look Like

### 🟢 Green Ghost (Happy/Clean)
**Appearance:**
- Bright green color (#00ff88)
- Happy smile with rosy cheeks
- Big cheerful eyes with shine
- Green glowing aura
- Floating green particles (like leaves)
- Smooth up-and-down animation
- "🌿 CLEAN 🌿" text at bottom

**Meaning:**
- Carbon intensity < 300 gCO2/kWh
- Health increasing (+10 per reading)
- Earning rewards (+0.005 MATIC)
- Building green credits

### 🟤 Smoggy Ghost (Sad/Dirty)
**Appearance:**
- Dark brown/gray color (#654321)
- Sad frown
- Tired eyes with bags under them
- Worried eyebrows
- Brown smog particles (pollution)
- Slower, droopier animation
- "💨 DIRTY 💨" text at bottom

**Meaning:**
- Carbon intensity >= 300 gCO2/kWh
- Health decreasing (-10 per reading)
- Getting slashed (-0.01 MATIC)
- No green credits earned

---

## 🚀 How to Use in Your Project

### Current Setup (Hackathon)
The contract has placeholder URIs:
```solidity
string public greenGhostURI = "ipfs://QmGreenGhost";
string public smoggyGhostURI = "ipfs://QmSmoggyGhost";
```

### For Production: Upload to IPFS

**Step 1: Upload SVGs to IPFS**
```bash
# Install IPFS desktop or use a service like Pinata
# Upload green-ghost.svg
# Upload smoggy-ghost.svg
```

**Step 2: Get IPFS Hashes**
You'll get something like:
```
ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx  (green)
ipfs://QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy  (smoggy)
```

**Step 3: Update Contract**
```solidity
string public greenGhostURI = "ipfs://QmXxXx..."; // Your real hash
string public smoggyGhostURI = "ipfs://QmYyYy..."; // Your real hash
```

Or after deployment:
```javascript
await ghostNFT.setGreenURI("ipfs://QmXxXx...");
await ghostNFT.setSmoggyURI("ipfs://QmYyYy...");
```

### For Hackathon: Use Data URIs (Quick & Dirty)

If you don't want to deal with IPFS right now, you can base64 encode the SVGs:

```bash
# Convert SVG to base64
cat green-ghost.svg | base64
```

Then use:
```solidity
string public greenGhostURI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0...";
```

But the string will be VERY long!

---

## 🎭 The Ghost Transforms!

### How the Change Happens

**In the Smart Contract:**
```solidity
function updateGhost(uint256 tokenId, string memory status) public {
    if (status == "CLEAN") {
        _setTokenURI(tokenId, greenGhostURI);  // ← Changes to green!
    } else if (status == "DIRTY") {
        _setTokenURI(tokenId, smoggyGhostURI); // ← Changes to brown!
    }
}
```

**What Users See:**

```
Grid Status: CLEAN
     ↓
updateGhost() called with "CLEAN"
     ↓
tokenURI now points to green-ghost.svg
     ↓
NFT marketplaces refresh
     ↓
👻 Ghost appears GREEN!
```

```
Grid Status: DIRTY
     ↓
updateGhost() called with "DIRTY"
     ↓
tokenURI now points to smoggy-ghost.svg
     ↓
NFT marketplaces refresh
     ↓
👻 Ghost appears BROWN/SMOGGY!
```

---

## 📱 Where You'll See These Ghosts

### 1. In Your Frontend
The React app will fetch `tokenURI()` and display the SVG:
```javascript
const uri = await ghostNFT.tokenURI(tokenId);
// Shows green-ghost.svg or smoggy-ghost.svg based on health
```

### 2. On OpenSea (if you list it)
- NFT image updates automatically
- Metadata shows current health
- Traits show clean/dirty percentages
- **BUT: Can't be transferred** (soulbound!)

### 3. On Polygon Explorer
- View token details
- See current metadata
- Check change history

### 4. In MetaMask
- NFT tab shows your ghost
- Image changes as health changes

---

## 🎨 Customizing the Ghosts

### Want to Change Colors?

**Green Ghost:**
```svg
<!-- Current green -->
fill="#00ff88"

<!-- Options: -->
fill="#00ff00"  <!-- Brighter green -->
fill="#32CD32"  <!-- Lime green -->
fill="#00ffff"  <!-- Cyan -->
```

**Smoggy Ghost:**
```svg
<!-- Current brown -->
fill="#654321"

<!-- Options: -->
fill="#8B4513"  <!-- Saddle brown -->
fill="#696969"  <!-- Dim gray -->
fill="#4a4a4a"  <!-- Darker gray -->
```

### Want Different Expressions?

**Happy Mouth:**
```svg
<!-- Current smile -->
<path d="M 170 220 Q 200 235 230 220"/>

<!-- Big grin -->
<path d="M 160 220 Q 200 245 240 220"/>

<!-- Slight smile -->
<path d="M 175 220 Q 200 228 225 220"/>
```

**Sad Mouth:**
```svg
<!-- Current frown -->
<path d="M 170 235 Q 200 225 230 235"/>

<!-- Deep frown -->
<path d="M 170 240 Q 200 220 230 240"/>

<!-- Worried mouth -->
<path d="M 175 232 Q 200 230 225 232"/>
```

### Want to Add More Details?

You can add:
- More particles
- Different glow effects
- Animated eyes
- Sparkles
- Smoke trails
- Energy bolts

Just edit the SVG files!

---

## 🔄 Making Them Work with Your 3D Frontend

The frontend uses Three.js for 3D. You have two options:

### Option 1: Keep 3D Ghost (Current)
Use Three.js to render 3D ghost, change color based on health:
```javascript
if (ghostData.mood === "Happy") {
    material.color.setRGB(0, 1, 0.5); // Green
} else {
    material.color.setRGB(0.4, 0.25, 0.1); // Brown
}
```

### Option 2: Use SVG Ghosts in Frontend
Display the actual SVG instead of 3D:
```javascript
<img src={ghostData.health >= 50 ? greenGhostSVG : smoggyGhostSVG} />
```

### Option 3: Hybrid (Best for Demo)
- Show 3D ghost rotating (cool!)
- Show SVG ghost in stats panel (metadata proof!)

---

## 📊 Ghost in Metadata

When someone queries `tokenURI(tokenId)`, they get:

```json
{
  "name": "Carbon Ghost #0",
  "description": "Health: 90/100, Mood: Happy",
  "image": "ipfs://QmGreenGhost",  ← Points to green-ghost.svg
  "attributes": [
    {"trait_type": "Health", "value": 90},
    {"trait_type": "Mood", "value": "Happy"},
    {"trait_type": "Total Clean Readings", "value": 100},
    {"trait_type": "Total Dirty Readings", "value": 10},
    {"trait_type": "Clean Percentage", "value": 90}
  ]
}
```

The `image` field automatically points to the right SVG!

---

## 🎬 For Your Presentation

### Show the Ghosts
1. Open `ghost-preview.html` in browser
2. Keep it open during demo
3. When you change grid status, point to the preview:
   - "See this green ghost? That's what it looks like when clean"
   - "And this brown one? That's what happens with dirty energy"

### Live Demo
1. Start with grid clean → Show green ghost in frontend
2. Change oracle to dirty → Watch it turn brown
3. "The NFT metadata literally changes on-chain"

### Comparison
Split screen:
- Left: Your frontend showing 3D ghost
- Right: ghost-preview.html showing SVG
- Both change color together!

---

## 📁 Quick Reference

| File | Purpose | Open With |
|------|---------|-----------|
| `green-ghost.svg` | Happy ghost image | Browser |
| `smoggy-ghost.svg` | Sad ghost image | Browser |
| `ghost-preview.html` | View both ghosts | Browser |
| Contract URIs | Point to these images | Smart contract |

---

## ✅ Checklist

Before hackathon:
- [ ] Open `ghost-preview.html` - verify ghosts look good
- [ ] If you want changes, edit the SVG files
- [ ] Upload to IPFS (optional but recommended)
- [ ] Update contract URIs with real IPFS hashes
- [ ] Test that metadata changes when health changes
- [ ] Take screenshots for presentation

During presentation:
- [ ] Show `ghost-preview.html` to explain visual changes
- [ ] Demonstrate live transformation in frontend
- [ ] Point out the soulbound + dynamic innovation

---

Your ghosts are ready to haunt some carbon emissions! 👻💚💨
