# WordGrid PRD - Core Gameplay

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. High Concept

Players operate on a 6×6 grid (or 7×7/8×8 in advanced modes) filled with random letters. They swap adjacent letters to form horizontal or vertical words. Matched words disappear, new letters fall from above, potentially creating cascade combos.

---

## 2. Core Loop

The fundamental gameplay loop consists of these sequential steps:

```
┌─────────────────────────────────────────────────────────────┐
│  1. SCAN → 2. SWAP → 3. MATCH → 4. CLEAR → 5. REFILL      │
│                          ↓                                  │
│                    6. CASCADE                               │
│                          ↓                                  │
│                    7. REPEAT                                │
└─────────────────────────────────────────────────────────────┘
```

| Step | Action | Player/System |
|------|--------|---------------|
| **SCAN** | Analyze board for potential words | Player |
| **SWAP** | Exchange adjacent letters (max 1-2 moves per word) | Player |
| **MATCH** | Validate word against dictionary | System |
| **CLEAR** | Remove letters + award points + animations | System |
| **REFILL** | New letters fall from top | System |
| **CASCADE** | Check for new words formed (bonus combo!) | System |
| **REPEAT** | Return to step 1 | Player |

---

## 3. Word Detection Rules

### 3.1 Minimum Word Length

| Difficulty | Minimum Letters | Hints Available |
|------------|-----------------|-----------------|
| Easy Mode | 3+ letters | Yes |
| Normal Mode | 4+ letters | Yes |
| Hard Mode | 4+ letters | No |

### 3.2 Reading Directions

- **Horizontal:** Left to right only
- **Vertical:** Top to bottom only
- **Diagonal:** Not supported (simplifies UX)

### 3.3 Word Priority Rules

When one word contains another (e.g., 'CAT' in 'CATS'):
1. System automatically selects the **longer word**
2. Player can manually select shorter word via tap
3. Maximum word length: grid dimension (6 letters for 6×6)

### 3.4 Validation Requirements

- Word must exist in language dictionary
- Letters must be adjacent (horizontally or vertically)
- All letters in word must be used exactly once
- No wrapping around grid edges

---

## 4. Scoring System

Designed to reward skill, strategy, and speed:

### 4.1 Base Scoring Components

| Component | Formula | Example |
|-----------|---------|---------|
| **Letter Value** | 1-9 points per letter | Z = 9pts, A = 1pt |
| **Word Length** | n² multiplier | 5 letters = ×25 |
| **Combo Chain** | ×1.5 per cascade | 3rd combo = ×3.375 |
| **Speed Bonus** | ×1.1 to ×2.0 | Fast find = ×2.0 |
| **Special Letters** | ×2 to ×5 | Gold letter = ×2 |

### 4.2 Master Scoring Formula

```
SCORE = (Σ letter_values) × length² × combo_multiplier × speed_bonus × special_multiplier
```

### 4.3 Example Calculation

Finding "WORD" (5 letters) with gold 'O' in 2nd combo within 3 seconds:

```
Letter values: W(4) + O(1) + R(1) + D(2) = 8 base points
Length multiplier: 4² = 16
Combo multiplier: 1.5 × 1.5 = 2.25
Speed bonus: 1.5 (fast)
Special multiplier: 2.0 (gold letter)

FINAL: 8 × 16 × 2.25 × 1.5 × 2.0 = 864 points
```

### 4.4 Letter Point Values (Polish)

| Points | Letters |
|--------|---------|
| 1 | A, E, I, O, N, R, S, W, Z |
| 2 | C, D, K, L, M, P, T, Y |
| 3 | B, G, H, J, Ł, U |
| 5 | Ą, Ę, F, Ó, Ś, Ż |
| 7 | Ć, Ń |
| 9 | Ź |

---

## 5. Grid Mechanics

### 5.1 Grid Specifications

| Parameter | Default | Variants |
|-----------|---------|----------|
| Size | 6×6 | 7×7 (hard), 8×8 (word hunt) |
| Letter Pool | Language-specific | Weighted by frequency |
| Initial State | Random fill | Guaranteed 3+ valid words |
| Minimum Words | 3 findable | Validated on generation |

### 5.2 Letter Distribution

Based on Polish language frequency analysis, optimized for gameplay:

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | A, I, O, E, N | 7-9% each |
| Common | R, Z, S, W, C | 3-5% each |
| Moderate | T, K, Y, D, P, M | 2-3% each |
| Uncommon | L, Ł, U, J, B | 1-2% each |
| Rare | G, H, Ą, Ę, Ó, Ś, Ż | 0.3-1% each |
| Very Rare | Ć, Ń, Ź, F | 0.1-0.2% each |

### 5.3 Letter Refill Algorithm

1. Identify empty cells from top to bottom
2. Shift existing letters downward (gravity)
3. Generate new letters at top from weighted pool
4. Validate at least 1 new word is possible
5. If no words possible, reshuffle (rare)

---

## 6. Power-Ups System

### 6.1 Active Power-Ups

| Power-Up | Icon | Cost | Effect | Unlock Level |
|----------|------|------|--------|--------------|
| **Hint** | 💡 | 50 coins | Highlights one valid word | 2 |
| **Shuffle** | 🔀 | 100 coins | Randomizes all letters | 5 |
| **Time Freeze** | ⏱️ | 150 coins | Adds +15 seconds | 8 |
| **Wildcard** | 🃏 | 200 coins | Replaces any letter | 12 |
| **Bomb** | 💣 | 250 coins | Clears 3×3 area | 15 |

### 6.2 Special Letter Tiles

| Tile Type | Visual | Effect | Spawn Rate |
|-----------|--------|--------|------------|
| **Gold Letter** | Golden glow | ×2 word score | 5% |
| **Rainbow Letter** | Color-shifting | Acts as wildcard | 2% |
| **Frozen Letter** | Ice encased | Needs 2 uses to unlock | Campaign only |
| **Chain Letter** | Linked icons | Auto-triggers cascade check | 3% |
| **Bomb Letter** | Explosive icon | Clears neighbors on use | 2% |
| **Star Letter** | Star sparkle | Bonus XP on use | 4% |

---

## 7. User Input Specifications

### 7.1 Touch Gestures

| Gesture | Action | Feedback |
|---------|--------|----------|
| Tap letter | Select/deselect | Glow + haptic + pop sound |
| Drag to adjacent | Swap letters | 200ms animation + swoosh |
| Swipe across letters | Quick word select | Trail effect |
| Long press | Show letter info | Tooltip + haptic |
| Double tap grid | Use shuffle power-up | Confirmation modal |

### 7.2 Gesture Constraints

- Swap only adjacent letters (no diagonal)
- Maximum 2 consecutive swaps per turn
- 500ms minimum between swaps (prevents spam)
- Cancel swap by returning to original position

---

## 8. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CG-01 | System shall validate words against language dictionary in <50ms | P0 |
| FR-CG-02 | Grid shall always contain at least 3 valid findable words | P0 |
| FR-CG-03 | System shall detect all valid horizontal and vertical words | P0 |
| FR-CG-04 | Letter cascade animation shall complete in <500ms | P1 |
| FR-CG-05 | Combo detection shall trigger automatically on cascade | P0 |
| FR-CG-06 | Score calculation shall apply all multipliers correctly | P0 |
| FR-CG-07 | Power-ups shall be consumable and persistent across sessions | P1 |
| FR-CG-08 | System shall track and display current combo chain | P1 |

---

*Generated by BMAD PRD Workflow v1.0*
