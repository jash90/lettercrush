# LetterCrush PRD - Game Modes

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Mode Overview

### 1.1 Implementation Status (v1.0)

| Mode | Status | Target Player | Session Length | Monetization |
|------|--------|---------------|----------------|--------------|
| Timer Mode | ✅ Implemented | Casual | 2 min | Interstitial ads |
| Campaign/Puzzle | 📋 v2.0+ | All | 3-10 min | TBD |
| Daily Challenge | 📋 v2.0+ | Engaged | 5-10 min | TBD |
| Word Hunt | 📋 v2.0+ | Relaxed | 10-20 min | TBD |
| Versus (PvP) | 📋 v2.0+ | Competitive | 3-5 min | TBD |
| Zen | 📋 v2.0+ | Relaxed | Unlimited | TBD |

---

## 2. Timer Mode (v1.0 - Implemented)

### 2.1 Overview

The core gameplay mode, optimized for quick casual sessions with tap-to-select word building.

| Parameter | Value |
|-----------|-------|
| **Time Limit** | 120 seconds (2 minutes) |
| **Objective** | Maximize score |
| **Grid Size** | 6×6 (fixed) |
| **Minimum Word Length** | 3 letters |
| **Strike System** | 3 strikes (invalid words) |
| **Languages** | English, Polish |

### 2.2 Game Flow

```
START → 2:00 Timer Begins
         ↓
    TAP LETTERS → Build Word (any order)
         ↓
    SUBMIT WORD
         ↓
    ├── Valid? → Score + Clear + Cascade
    │              ↓
    │           Refill grid
    │              ↓
    │           Continue
    │
    └── Invalid? → Strike added
                     ↓
                  3 Strikes? → GAME OVER
         ↓
    Timer Expires → GAME OVER
         ↓
    Show Score + Highscore
         ↓
    [Interstitial Ad] → Play Again OR Home
```

### 2.3 Core Mechanics

**Tap-to-Select System**:
- Tap any letter on the grid to add to word
- Tap again to deselect
- Letters can be selected in ANY order (not adjacent-only)
- Selection order shows as numbered badges (1, 2, 3...)
- Current word displays in WordBuilder component

**Scoring**:
- Base letter values (language-specific)
- Length bonus (longer words = more points)
- Combo multiplier (cascades)

**Strikes**:
- Invalid word submission = 1 strike
- 3 strikes = Game Over
- Visual feedback with shake animation

### 2.4 Timer Behavior

| Time Remaining | Visual State | Audio |
|----------------|--------------|-------|
| >30s | Normal (white) | None |
| 30s-10s | Warning (yellow) | None |
| <10s | Critical (red, pulse) | Optional tick |
| 0s | Game Over | End sound |

### 2.5 Implementation Files

```
app/
├── game.tsx              # Main game screen

src/
├── stores/
│   └── gameStore.ts      # Timer state, strikes, phase
├── hooks/
│   ├── useTimer.ts       # Countdown logic
│   └── useGame.ts        # Game orchestration
├── components/
│   ├── Grid/             # Letter grid
│   └── WordBuilder/      # Current word display
└── engine/
    ├── ScoreCalculator.ts
    └── WordValidator.ts
```

### 2.6 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-TM-01 | Timer shall count down from 2:00 with second precision | ✅ |
| FR-TM-02 | Game shall end when timer reaches 0:00 | ✅ |
| FR-TM-03 | Invalid word shall add strike (max 3) | ✅ |
| FR-TM-04 | 3 strikes shall end game immediately | ✅ |
| FR-TM-05 | Score shall persist to local highscore database | ✅ |
| FR-TM-06 | Interstitial ad shall show on "Play Again" | ✅ |

---

## 3. Future Game Modes (v2.0+)

The following modes are planned for future releases:

### 3.1 Campaign Mode (Puzzle Mode)

| Parameter | Planned Value |
|-----------|---------------|
| **Total Levels** | 100+ |
| **Structure** | Themed regions with objectives |
| **Objectives** | Score targets, word counts, specific lengths |
| **Star Rating** | 1-3 stars based on performance |

### 3.2 Daily Challenge

| Parameter | Planned Value |
|-----------|---------------|
| **Reset Time** | 00:00 UTC daily |
| **Structure** | 3 levels of increasing difficulty |
| **Rewards** | Streak bonuses |
| **Streak Tracking** | Local persistence |

### 3.3 Zen Mode

| Parameter | Planned Value |
|-----------|---------------|
| **Time Limit** | None |
| **Objective** | Relaxation, word exploration |
| **Features** | Calming colors, ambient music |
| **Ads** | Ad-free (premium unlock) |

### 3.4 Word Hunt Mode

| Parameter | Planned Value |
|-----------|---------------|
| **Grid Size** | 8×8 or 10×10 |
| **Objective** | Find hidden words from list |
| **Content** | Themed word packs (animals, countries, etc.) |

### 3.5 Versus Mode (PvP)

| Parameter | Planned Value |
|-----------|---------------|
| **Format** | Async or real-time |
| **Grid** | Same for both players |
| **Matchmaking** | ELO-based rating |
| **Rewards** | League system with season rewards |

---

## 4. Mode Unlock Progression (Future)

| Mode | Current Status | Planned Unlock |
|------|----------------|----------------|
| Timer Mode | ✅ Available | Always available |
| Campaign | 📋 Not implemented | Complete tutorial |
| Daily Challenge | 📋 Not implemented | Player Level 3 |
| Zen Mode | 📋 Not implemented | Premium unlock |
| Word Hunt | 📋 Not implemented | Player Level 10 |
| Versus | 📋 Not implemented | Player Level 15 |

---

*Updated for LetterCrush v1.0 Timer Mode implementation*
*Generated by BMAD PRD Workflow v2.0*
