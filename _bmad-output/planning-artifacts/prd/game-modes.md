# WordGrid PRD - Game Modes

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Mode Overview

| Mode | Status | Target Player | Session Length | Monetization Focus |
|------|--------|---------------|----------------|-------------------|
| Classic | v1.0 | Casual | 2-5 min | Ads, power-ups |
| Campaign/Puzzle | v1.0 | All | 3-10 min | IAP, power-ups |
| Daily Challenge | v1.0 | Engaged | 5-10 min | Retention, IAP |
| Word Hunt | v2.0 | Relaxed | 10-20 min | Premium unlock |
| Versus (PvP) | v2.0 | Competitive | 3-5 min | Battle Pass |
| Zen | v2.0 | Relaxed | Unlimited | Premium unlock |

---

## 2. Classic Mode

### 2.1 Overview

The fundamental gameplay mode, optimized for quick casual sessions.

| Parameter | Value |
|-----------|-------|
| **Time Limit** | 2 minutes |
| **Objective** | Maximize score |
| **Grid Size** | 6×6 (fixed) |
| **Lives** | None (time-limited) |

### 2.2 Game Flow

```
START → 2:00 Timer Begins
         ↓
    Find Words → Score Points
         ↓
    Timer Expires
         ↓
    GAME OVER → Show Score + Leaderboard Position
         ↓
    Option: Watch Ad (+30 sec) OR Replay OR Exit
```

### 2.3 Retention Hooks

- **Daily Highscore:** Beat your best score today
- **Weekly Leaderboards:** Compete with friends and global players
- **Personal Best Notification:** Celebrate new records

### 2.4 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CM-01 | Timer shall count down from 2:00 with second precision | P0 |
| FR-CM-02 | Game shall end when timer reaches 0:00 | P0 |
| FR-CM-03 | Continue option shall add +30 seconds for rewarded ad | P1 |
| FR-CM-04 | Leaderboard shall update within 5 seconds of game end | P1 |

---

## 3. Campaign Mode (Puzzle Mode)

### 3.1 Overview

The primary content driver with progression through themed regions.

| Parameter | Value |
|-----------|-------|
| **Total Levels** | 500+ (expandable) |
| **Structure** | World map with themed regions |
| **Level Objectives** | Variable (see below) |
| **Difficulty** | Peak & Valley curve |

### 3.2 Level Objective Types

| Objective Type | Description | Example |
|----------------|-------------|---------|
| **Score Target** | Reach X points | Score 5,000 points |
| **Word Count** | Find X words | Find 15 words |
| **Specific Length** | Find X words of Y letters | Find 5 five-letter words |
| **Clear Tiles** | Remove special tiles | Clear all frozen tiles |
| **Time Trial** | Complete in X seconds | Finish in 60 seconds |
| **Limited Moves** | Complete in X moves | Use only 20 swaps |

### 3.3 Region Structure

| Levels | Region | Theme | Unique Mechanic |
|--------|--------|-------|-----------------|
| 1-35 | Tutorial Island | Tropical | Basic tutorials |
| 36-80 | Frozen Fjords | Arctic | Frozen letters (ice blocks) |
| 81-130 | Desert Dunes | Egyptian | Sand-covered letters |
| 131-200 | Jungle Ruins | Mayan | Vine blockades |
| 201-270 | Volcanic Peaks | Volcanic | Lava tiles (timed) |
| 271-350 | Crystal Caves | Underground | Mirror letters |
| 351-420 | Sky Kingdom | Clouds | Floating grid |
| 421-500 | Shadow Realm | Dark | Hidden letters |

### 3.4 Star Rating System

| Stars | Requirement |
|-------|-------------|
| ⭐ | Complete level objective |
| ⭐⭐ | Complete + score bonus threshold |
| ⭐⭐⭐ | Complete + max score bonus |

### 3.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CP-01 | System shall save progress after each completed level | P0 |
| FR-CP-02 | Region unlock shall require X stars from previous region | P0 |
| FR-CP-03 | Level shall be replayable for better star rating | P1 |
| FR-CP-04 | System shall display objective clearly before level start | P0 |

---

## 4. Daily Challenge

### 4.1 Overview

Critical for D7+ retention with streak mechanics.

| Parameter | Value |
|-----------|-------|
| **Reset Time** | 00:00 UTC daily |
| **Structure** | 3 levels of increasing difficulty |
| **Rewards** | Coins, gems, exclusive items |
| **Streak Bonus** | Escalating rewards |

### 4.2 Challenge Structure

| Stage | Difficulty | Reward (Base) |
|-------|------------|---------------|
| Stage 1 | Easy | 100 coins |
| Stage 2 | Medium | 150 coins + 5 gems |
| Stage 3 | Hard | 250 coins + 10 gems + power-up |

### 4.3 Streak Rewards

| Streak Days | Bonus Reward |
|-------------|--------------|
| 3 days | +50% coins |
| 7 days | +100% coins + rare power-up |
| 14 days | Exclusive avatar frame |
| 30 days | Exclusive theme unlock |
| 100 days | Legendary badge |
| 365 days | "Wordmaster" title + exclusive rewards |

### 4.4 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DC-01 | Challenge shall reset at 00:00 UTC | P0 |
| FR-DC-02 | Streak counter shall increment on daily completion | P0 |
| FR-DC-03 | Streak shall break if day is missed (grace period: 1 day with ad) | P1 |
| FR-DC-04 | Push notification shall remind 2 hours before daily reset | P2 |
| FR-DC-05 | Challenges shall be cached for offline play (24hr validity) | P1 |

---

## 5. Word Hunt Mode (v2.0)

### 5.1 Overview

Alternative relaxed mode based on classic word search puzzles.

| Parameter | Value |
|-----------|-------|
| **Grid Size** | 8×8 or 10×10 |
| **Objective** | Find all hidden words from list |
| **Time Limit** | None (relaxed) |
| **Word Type** | Pre-defined, not emergent |

### 5.2 Content Packs

| Pack Theme | Word Count | Example Words |
|------------|------------|---------------|
| Animals | 15-20 | Lion, Tiger, Elephant |
| Countries | 20-25 | France, Japan, Brazil |
| Professions | 15-20 | Doctor, Teacher, Pilot |
| Food & Drink | 20-25 | Pizza, Coffee, Apple |
| Sports | 15-20 | Football, Tennis, Golf |

### 5.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-WH-01 | System shall highlight found words in list | P0 |
| FR-WH-02 | Words may be hidden in any direction (8 directions) | P1 |
| FR-WH-03 | Hint shall reveal first letter of random unfound word | P1 |

---

## 6. Versus Mode (PvP) (v2.0)

### 6.1 Overview

Competitive endgame content for hardcore players.

| Parameter | Value |
|-----------|-------|
| **Format** | Async or real-time |
| **Matchmaking** | ELO-based rating |
| **Grid** | Same for both players |
| **Objective** | Higher score wins |

### 6.2 Match Structure

```
MATCHMAKING → Same Grid Generated
                  ↓
     Player A plays ← → Player B plays
                  ↓
         2 minute time limit each
                  ↓
         Higher score wins
                  ↓
     ELO adjustment + Rewards
```

### 6.3 League System

| League | ELO Range | Season Reward |
|--------|-----------|---------------|
| Bronze | 0-999 | 100 gems |
| Silver | 1000-1499 | 250 gems + frame |
| Gold | 1500-1999 | 500 gems + theme |
| Platinum | 2000-2499 | 1000 gems + avatar |
| Diamond | 2500+ | 2000 gems + exclusive badge |

### 6.4 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PVP-01 | Both players shall receive identical grid | P0 |
| FR-PVP-02 | ELO shall update within 30 seconds of match end | P0 |
| FR-PVP-03 | Real-time mode shall require stable connection | P1 |
| FR-PVP-04 | Async match shall allow 24-hour response window | P1 |

---

## 7. Zen Mode (v2.0)

### 7.1 Overview

Premium relaxation mode with no pressure.

| Parameter | Value |
|-----------|-------|
| **Time Limit** | None |
| **Objective** | Relaxation, word exploration |
| **Monetization** | Premium unlock ($2.99) |
| **Ads** | None |

### 7.2 Features

- Ambient background music (3 tracks)
- Calming color palette
- No score pressure
- Endless grid refresh
- Word discovery journaling

### 7.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ZM-01 | Mode shall be ad-free after purchase | P0 |
| FR-ZM-02 | Session shall auto-save on app background | P1 |
| FR-ZM-03 | Grid shall refresh on user request | P1 |

---

## 8. Mode Unlock Progression

| Mode | Unlock Condition |
|------|------------------|
| Classic | Available from start |
| Campaign | Complete tutorial (Level 5) |
| Daily Challenge | Player Level 3 |
| Word Hunt | Player Level 10 (v2.0) |
| Versus Mode | Player Level 15 (v2.0) |
| Zen Mode | Premium purchase (v2.0) |

---

*Generated by BMAD PRD Workflow v1.0*
