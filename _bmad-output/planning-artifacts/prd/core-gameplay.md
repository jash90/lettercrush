# LetterCrush PRD - Core Gameplay

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. High Concept

Players interact with a 6×6 grid filled with random letters. They tap letters sequentially to build words horizontally or vertically. Valid words are cleared, new letters fall from above, potentially creating cascade combos.

---

## 2. Core Loop

The fundamental gameplay loop consists of these sequential steps:

```
┌─────────────────────────────────────────────────────────────┐
│  1. SCAN → 2. SELECT → 3. BUILD → 4. SUBMIT → 5. VALIDATE  │
│                          ↓                                   │
│                    6. CLEAR/REJECT                           │
│                          ↓                                   │
│                    7. CASCADE                                │
│                          ↓                                   │
│                    8. REPEAT                                 │
└─────────────────────────────────────────────────────────────┘
```

| Step | Action | Player/System |
|------|--------|---------------|
| **SCAN** | Look for potential words on the board | Player |
| **SELECT** | Tap letters to add to word builder | Player |
| **BUILD** | Watch word form in word builder display | Player |
| **SUBMIT** | Confirm word (auto or manual) | Player |
| **VALIDATE** | Check word against dictionary | System |
| **CLEAR** | Remove matched letters + award points | System |
| **CASCADE** | New letters fall, check for combos | System |
| **REPEAT** | Return to step 1 | Player |

---

## 3. Word Building Mechanics

### 3.1 Selection System

- **Tap to Select**: Tap a letter to add it to the current word
- **Tap to Deselect**: Tap a selected letter to remove it
- **Sequential Building**: Letters are added in tap order
- **Clear Selection**: Option to clear all selected letters

### 3.2 Word Requirements

| Rule | Specification |
|------|---------------|
| Minimum Length | 3 letters |
| Maximum Length | 6 letters (grid dimension) |
| Direction | Horizontal or vertical |
| Adjacency | Letters must be adjacent in final word |
| Validation | Must exist in current language dictionary |

### 3.3 Reading Directions

- **Horizontal:** Left to right only
- **Vertical:** Top to bottom only
- **Diagonal:** Not supported

### 3.4 Validation Flow

```
Word Submitted
     │
     ├── Length >= 3?
     │       ├── NO → "Too short" feedback
     │       └── YES → Continue
     │
     ├── Letters adjacent?
     │       ├── NO → "Invalid selection" feedback
     │       └── YES → Continue
     │
     ├── Exists in dictionary?
     │       ├── NO → "Not a word" + Strike
     │       └── YES → Success!
     │
     └── Calculate score, clear tiles
```

---

## 4. Scoring System

### 4.1 Base Scoring Components

| Component | Formula | Example |
|-----------|---------|---------|
| **Letter Value** | 1-10 points per letter | Z = 10pts, A = 1pt |
| **Word Length** | Bonus multiplier | Longer = higher |
| **Combo Chain** | ×1.5 per cascade | 3rd combo = ×3.375 |

### 4.2 Scoring Formula

```
SCORE = (Σ letter_values) × length_bonus × combo_multiplier
```

### 4.3 Letter Point Values

**English (Scrabble-style):**

| Points | Letters |
|--------|---------|
| 1 | E, A, I, O, N, R, T, L, S, U |
| 2 | D, G |
| 3 | B, C, M, P |
| 4 | F, H, V, W, Y |
| 5 | K |
| 8 | J, X |
| 10 | Q, Z |

**Polish:**

| Points | Letters |
|--------|---------|
| 1 | A, E, I, O, N, R, S, W, Z |
| 2 | C, D, K, L, M, P, T, Y |
| 3 | B, G, H, J, U |
| 5 | F |

### 4.4 Example Calculation

Finding "STAR" (4 letters) in 2nd combo:

```
Letter values: S(1) + T(1) + A(1) + R(1) = 4 base points
Length bonus: Standard (4 letters)
Combo multiplier: 1.5 (2nd combo)

FINAL: 4 × 1.5 = 6 points (+ length bonus)
```

---

## 5. Grid Mechanics

### 5.1 Grid Specifications

| Parameter | Value |
|-----------|-------|
| Size | 6×6 (36 tiles) |
| Letter Pool | Language-specific weighted distribution |
| Initial State | Random fill with weighted letters |

### 5.2 Letter Distribution (English)

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | E, A, R, I, O, T, N | 6-12% each |
| Common | S, L, C, U, D | 3-5% each |
| Moderate | P, M, H, G, B | 2-3% each |
| Uncommon | F, Y, W, K, V | 1-2% each |
| Rare | X, Z, J, Q | 0.1-0.5% each |

### 5.3 Letter Distribution (Polish)

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | A, I, O, E, N | 7-9% each |
| Common | R, Z, S, W, C | 3-5% each |
| Moderate | T, K, Y, D, P, M | 2-3% each |
| Uncommon | L, U, J, B | 1-2% each |
| Rare | G, H, F | 0.3-1% each |

### 5.4 Cascade/Refill Algorithm

1. Identify cleared cells
2. Shift existing letters downward (gravity)
3. Generate new letters at top from weighted pool
4. Animate falling letters
5. Check for automatic word matches (cascade)
6. If cascade found, repeat from step 1

---

## 6. Game Phases

### 6.1 Phase Definitions

| Phase | Description | User Input |
|-------|-------------|------------|
| `idle` | Waiting for player action | Enabled |
| `selecting` | Player is building a word | Enabled |
| `validating` | Checking word against dictionary | Disabled |
| `matching` | Word accepted, showing animation | Disabled |
| `cascading` | Clearing and refilling | Disabled |
| `refilling` | New letters falling | Disabled |
| `paused` | Game paused | Modal open |
| `gameOver` | Game ended | Modal open |

### 6.2 Phase Transitions

```
idle ──(tap letter)──► selecting
                            │
selecting ──(submit)──► validating
                            │
          ┌─(invalid)───────┤
          │                 │
          ▼                 ▼
       idle ◄──         matching
                            │
                            ▼
                       cascading
                            │
                      ┌─────┴─────┐
                      ▼           ▼
                (cascade)     (no match)
                      │           │
                      ▼           ▼
                 matching      idle
```

---

## 7. Timer Mode Specifics

### 7.1 Timer Configuration

| Parameter | Value |
|-----------|-------|
| Duration | 120 seconds (2 minutes) |
| Warning | Visual at 30 seconds |
| Critical | Visual + audio at 10 seconds |

### 7.2 Strike System

| Parameter | Value |
|-----------|-------|
| Max Strikes | 3 |
| Strike Trigger | Invalid word submission |
| Game Over | 3 strikes OR timer expires |

### 7.3 End Conditions

- **Timer Expiry**: Game ends, show results
- **3 Strikes**: Game ends, show results
- **Manual Exit**: Confirm dialog, then home

---

## 8. User Input Specifications

### 8.1 Touch Gestures

| Gesture | Action | Feedback |
|---------|--------|----------|
| Tap letter | Select/deselect | Highlight + haptic |
| Tap submit | Submit word | Validation animation |
| Tap clear | Clear selection | Reset animation |
| Long press (optional) | Letter info | Tooltip |

### 8.2 Visual Feedback

| State | Visual |
|-------|--------|
| Selected | Highlighted border, selection number |
| Valid word | Green glow on submission |
| Invalid word | Red flash, shake animation |
| Cascade | Letters falling animation |

---

## 9. Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-CG-01 | System shall validate words against language dictionary in <50ms | P0 | ✅ |
| FR-CG-02 | Grid shall display 6×6 letter tiles with touch interaction | P0 | ✅ |
| FR-CG-03 | System shall detect valid horizontal and vertical words | P0 | ✅ |
| FR-CG-04 | Letter cascade animation shall complete in <500ms | P1 | ✅ |
| FR-CG-05 | Combo detection shall trigger automatically on cascade | P0 | ✅ |
| FR-CG-06 | Score calculation shall apply all multipliers correctly | P0 | ✅ |
| FR-CG-07 | Timer shall countdown from 120 seconds | P0 | ✅ |
| FR-CG-08 | Strike system shall track invalid submissions (max 3) | P0 | ✅ |

---

*Updated for LetterCrush tap-to-select implementation*
*Generated by BMAD PRD Workflow v2.0*
