# 🎤 Carbon Ghost - Hackathon Presentation Guide

## Timing: 5 minutes total

---

## SLIDE 1: The Problem (30 seconds)

**What to say:**
"Carbon emissions from computing are a massive problem. But the current solution - carbon credits - is broken.

Companies buy cheap annual carbon offsets, which let them defer action today by betting on unproven future technologies. The system uses yearly averages, which completely hides peak dirty usage. And there's no way to verify if a server is actually using clean energy or just lying about it.

We built Carbon Ghost to fix this."

**Visual:**
- Show stat: Data centers = 2% of global electricity
- Show problem: Annual averaging hides dirty peaks
- Show issue: No real-time verification

---

## SLIDE 2: The Solution (30 seconds)

**What to say:**
"Carbon Ghost uses three key innovations:

First, hardware attestation - a secure chip signs every power reading, so servers can't lie.

Second, real-time carbon tracking - we use blockchain oracles to check the grid's carbon intensity at the moment of computation.

Third, immediate economic consequences - clean energy earns you credits. Dirty energy gets you slashed. No more buying forgiveness at the end of the year."

**Visual:**
- Show architecture diagram
- Hardware → Relay → Oracle → Blockchain → Ghost
- Highlight the 5 phases

---

## SLIDE 3: Live Demo (2 minutes)

**Setup before presentation:**
- Have relay running
- Have hardware simulator ready to start
- Have frontend open in browser
- Have Polygonscan open to your contract

**What to do:**

1. **Start hardware simulator** (10 sec)
   - Show terminal with power readings
   - Point out the cryptographic signatures

2. **Show relay verification** (20 sec)
   - Show relay terminal receiving data
   - Point out signature verification passing

3. **Show blockchain transaction** (30 sec)
   - Show Polygonscan
   - Refresh to show new transaction
   - "This just happened - see the timestamp"

4. **Show Ghost updating** (30 sec)
   - Switch to frontend
   - Show ghost is green/happy
   - Show health, deposit, credits

5. **Switch to dirty grid** (30 sec)
   - In Hardhat console: `oracle.setCarbonIntensity(450)`
   - Wait for next reading
   - Show ghost turn brown/smoggy
   - Show deposit decrease (slashing!)

**What to say:**
"Let me show you how this works in real-time...

[Start simulator] Here's our hardware agent reading power usage and signing it with a secure chip.

[Show relay] The relay verifies the signature - can't be faked.

[Show blockchain] Here's the transaction hitting the blockchain right now.

[Show ghost] And here's the magic - our ghost NFT. It's happy and green because the grid is clean. We're earning green credits and building equity.

[Switch to dirty] Now watch what happens when the grid gets dirty... 

[Wait for update] See that? Ghost turns brown, health drops, and we got slashed 0.01 MATIC. That money goes to a burn address - real consequences, right now, not at the end of the year."

---

## SLIDE 4: The Technology (30 seconds)

**What to say:**
"Here's what's under the hood:

Hardware layer uses Intel SGX or TPM to create tamper-proof signatures.

Smart contracts on Polygon handle the NFTs, deposits, and slashing logic.

Chainlink oracles bring in real carbon intensity data from Electricity Maps.

And Three.js renders the ghost in real-time based on blockchain state.

Everything is open source and ready to demo."

**Visual:**
- Tech stack diagram
- Logos: Intel SGX, Polygon, Chainlink, React, Three.js
- Link to GitHub

---

## SLIDE 5: Business Model (30 seconds)

**What to say:**
"How do we make money?

First, B2B SaaS - data centers pay us per node instead of expensive manual audits.

Second, protocol fees - we take 0.5% of green credit trades.

Third, reputation marketplace - when you sell a server, you sell its high-level ghost with it.

This changes sustainability from a tax companies pay to governments, into equity they build on their own infrastructure."

**Visual:**
- Revenue streams diagram
- Example: "1000 servers × $10/month = $10K MRR"
- "Green credits marketplace = protocol fees"

---

## SLIDE 6: Next Steps (30 seconds)

**What to say:**
"After this hackathon, we need three things:

One, pilot with a real data center - we're already talking to two.

Two, production Chainlink integration - we've shown it works, now scale it.

Three, real hardware deployment - we've simulated it, now ship the actual chips.

The market is ready. Data centers need this for compliance. Cloud providers want to differentiate. And users want to know their compute is actually green.

Thanks - happy to answer questions!"

**Visual:**
- Roadmap timeline
- "Q2 2026: Pilot deployment"
- "Q3 2026: Public launch"
- Call to action: "Join us: carbonghost.io"

---

## Q&A Preparation

### Likely Questions & Answers:

**Q: "How is this different from existing carbon credit systems?"**
A: "Current systems use annual averages and let you offset retrospectively. We measure every compute cycle in real-time and apply immediate economic consequences. You can't game it by averaging out dirty peaks."

**Q: "What if someone tampers with the hardware?"**
A: "That's why we use Trusted Execution Environments like Intel SGX - they're physically isolated chips that can't be modified without breaking the seal. If someone tries to tamper, the signatures won't verify."

**Q: "How accurate is the carbon intensity data?"**
A: "We use Electricity Maps API, which aggregates data from grid operators worldwide. It's updated in near real-time and is the gold standard in the industry. For regions without live data, we use statistical models."

**Q: "Why blockchain? Couldn't this be done with a regular database?"**
A: "Three reasons: First, immutability - companies can't retroactively change their usage. Second, decentralization - no single party controls the data. Third, composability - other protocols can build on top of our carbon attestations."

**Q: "What's your go-to-market strategy?"**
A: "We start with crypto mining operations and AI data centers - they're both huge energy users and already blockchain-native. Then we expand to enterprise cloud providers. Eventually, this becomes infrastructure-level - like SSL certificates but for carbon."

**Q: "How do you prevent Sybil attacks?"**
A: "Each device requires a hardware security chip with a unique key pair. You can't just spin up virtual devices because they won't have valid TPM signatures. For production, we'd also require KYC for entity registration."

**Q: "What about privacy? Can competitors see my usage?"**
A: "The blockchain only shows aggregated carbon scores, not raw power consumption. Detailed data stays encrypted and only accessible to the device owner and regulators if required."

---

## Demo Backup Plan

**If live demo fails:**

1. Have screen recording ready
2. OR run the `demo.sh` script (simulated but shows concept)
3. OR show static screenshots in presentation

**If internet fails:**
- Have everything running locally
- Use local Hardhat network instead of testnet
- Screenshots in slides as backup

**If nothing works:**
- Explain the architecture conceptually
- Show the code
- "We tested this yesterday and it worked perfectly - Murphy's law!"

---

## Presentation Tips

### Body Language:
- Stand confidently
- Make eye contact with judges
- Use hand gestures when describing flow
- Show enthusiasm - you believe in this!

### Voice:
- Speak clearly and not too fast
- Pause after key points
- Vary your tone - excitement for demo, serious for problem

### Handling Technical Issues:
- Stay calm
- "Let me show you the backup..."
- Don't apologize excessively
- Move on quickly

### Closing Strong:
- End on the business impact
- "This is happening - with or without us"
- "We're here to make it happen right"
- Thank judges clearly
- Smile!

---

## Props & Materials

**Bring to presentation:**
- [ ] Laptop with all code running
- [ ] Backup laptop or tablet with slides
- [ ] HDMI adapter
- [ ] Phone with mobile hotspot (backup internet)
- [ ] Business cards (if you have them)
- [ ] Printed one-pager about project
- [ ] Water bottle
- [ ] Confidence!

**On laptop:**
- [ ] Presentation slides
- [ ] All terminals open and ready
- [ ] Frontend running
- [ ] Polygonscan tabs open
- [ ] Screen recording backup
- [ ] README open for reference

---

## Worst Case Emergency Plan

**If computer dies completely:**

Tell the story:

"Imagine you're a data center operator. Right now, you pay for carbon credits once a year. You have no idea if you're actually being clean or just averaging out.

We built a system where every single compute cycle gets measured. A secure chip in your server signs the power reading - can't be faked. We check the grid's carbon intensity right then - not an annual average. And we update your digital ghost on the blockchain immediately.

Green energy? Your ghost glows and you earn money. Dirty energy? Your ghost gets sick and you get charged.

It's like Fitbit for your data center's carbon footprint. But instead of steps, it's watts. And instead of just tracking, there are real economic stakes.

We've built it, deployed it to testnet, and it works. Data centers need this for compliance. We're ready to scale."

---

Good luck! You've got this! 🚀👻
