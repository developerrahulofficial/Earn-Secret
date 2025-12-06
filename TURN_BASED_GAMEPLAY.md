# 🎮 Turn-Based Packet Delivery Battle

## Game Overview
A **turn-based multiplayer** cyberpunk game where players take turns deploying packets and attacking each other in real-time with **animated attacks and deliveries**.

## 🎯 How It Works

### Turn Structure
- **Player 1 goes first**, then Player 2, alternating turns
- On **your turn**, you can:
  1. **Deploy a packet** (if you don't have one active)
  2. **Execute an action** (attack or defend)
  3. **End turn** to pass to opponent

### Real-Time Animations
- **Packets move in real-time** across the screen at 60 FPS
  - Fast packets (Raw) arrive quickly
  - Slow packets (Encrypted) take longer
  - Medium packets (Compressed) are balanced

- **Attacks travel toward opponent** with visible progress bars
  - Fast attacks (Corrupt) arrive quickly
  - Slow attacks (Throttle) are telegraphed - opponent can see them coming!
  - Opponent has time to react with Firewall defense

- **Both players see everything happening** simultaneously
  - Watch your packet progress toward delivery
  - See incoming attacks approaching
  - React to opponent's moves

### Strategic Depth
1. **Deploy fast packets** when opponent has no defenses
2. **Deploy encrypted packets** when you have time to defend
3. **Use Firewall** when you see a slow attack coming
4. **Launch Throttle attack** to permanently slow opponent's packet
5. **Time your Checksum** to repair corruption at the right moment
6. **Use Optimize** early to boost all future packet speeds

## 📦 Packet Types

| Type | Cost | Speed | Best When |
|------|------|-------|-----------|
| 📦 Raw | 1 CPU | Fast (3x) | Rushing, opponent has no defense |
| 🔐 Encrypted | 3 CPU | Slow (1.5x) | You need secure delivery |
| 🗜️ Compressed | 2 CPU | Medium (2.5x) | Balanced approach |

## ⚔️ Network Actions

### Offensive (Attack Opponent)
| Action | Cost | Speed | Effect |
|--------|------|-------|--------|
| 🎯 Intercept | 2 CPU | Medium | Pushes packet back 50% |
| 💀 Corrupt | 1 CPU | Fast | Slows packet to 50% speed |
| 🐌 Throttle | 2 CPU | Slow | Severely slows to 30% speed |
| 📦 Inflate | 1 CPU | Medium | Pushes packet back 30% |

### Defensive (Protect Yourself)
| Action | Cost | Effect |
|--------|------|--------|
| 🛡️ Firewall | 3 CPU | Blocks the next incoming attack |
| ✨ Checksum | 2 CPU | Repairs corruption on your packet |
| ⚡ Optimize | 2 CPU | Boosts all packet speeds by 50% |
| 🎭 Decoy | 1 CPU | Distracts opponent (cosmetic) |

## 🎮 Gameplay Flow

### Example Turn Sequence

**Turn 1 - Player 1:**
1. Deploys 📦 Raw packet (costs 1 CPU, 4 CPU remaining)
2. Launches 🛡️ Firewall defense (costs 3 CPU, 1 CPU remaining)
3. Clicks "End Turn"

*During animation phase:*
- Player 1's packet starts moving toward delivery (progress bar fills)

**Turn 2 - Player 2:**
1. Sees Player 1's packet at 35% progress
2. Deploys 🗜️ Compressed packet (costs 2 CPU, 3 CPU remaining)
3. Launches 💀 Corrupt attack (costs 1 CPU, 2 CPU remaining)
4. Clicks "End Turn"

*During animation phase:*
- Player 2's attack travels toward Player 1's packet
- Player 1's Firewall blocks the Corrupt attack! ✅
- Both packets continue progressing
- Player 1's packet delivers! Score: 1-0

**Turn 3 - Player 1:**
1. Deploys 🔐 Encrypted packet
2. Launches 🐌 Throttle attack (slow, but powerful)
3. Clicks "End Turn"

*During animation phase:*
- Player 2 sees the Throttle attack coming (slow progress bar)
- Player 2's packet is still moving
- Player 1's Throttle attack hits - Player 2's packet slows to 30% speed!
- Player 2's packet finally delivers after delay. Score: 1-1

## 🎯 Strategy Tips

1. **Watch the animations** - See what's coming and react
2. **Fast attacks are instant** - Use Corrupt for surprise attacks
3. **Slow attacks are telegraphed** - Use Throttle when opponent can't defend
4. **Save CPU** - Don't use Firewall unless you see an attack coming
5. **Optimize early** - Speed boost affects all future packets
6. **Mix packet types** - Don't be predictable
7. **Read opponent's CPU** - If they're low on CPU, they can't defend

## 🏆 Win Condition
**First player to deliver 10 packets wins!**

CPU regenerates +3 per turn (max 5), so manage your resources carefully.

## 🎨 Visual Feedback
- **Blue progress bars** = Player 1's packets
- **Red progress bars** = Player 2's packets
- **Yellow progress bars** = Incoming attacks
- **🛡️ Badge** = Firewall active
- **⚡ Badge** = Network optimized
- **💀 Badge** = Packet corrupted
- **🐌 Badge** = Packet throttled

---

**This is way more exciting than simultaneous selection!**
Players can see attacks coming and react strategically. Fast attacks create surprise, slow attacks create tension. The real-time animations make every turn dramatic! 🎮✨
