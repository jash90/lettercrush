# LetterCrush PRD - Progression Systems

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Overview

### 1.1 v1.0 Implementation Status

| System | v1.0 Status | Description |
|--------|-------------|-------------|
| Player Level (XP) | 📋 Not implemented | Future feature |
| Personal Dictionary | 📋 Not implemented | Future feature |
| Achievements | 📋 Not implemented | Future feature |
| Battle Pass | 📋 Not implemented | Future feature |
| Leaderboards | ⚠️ Local only | Local highscores implemented |
| Streak System | 📋 Not implemented | Future feature |

### 1.2 v1.0 Progression: Local Highscores

The only progression system in v1.0 is the **local highscore leaderboard**:

```
┌─────────────────────────────────────────────────────────────┐
│                    v1.0 PROGRESSION                          │
│                                                              │
│  Local Highscores (SQLite)                                  │
│  ├── Score                                                  │
│  ├── Words found                                            │
│  ├── Best word                                              │
│  ├── Longest word                                           │
│  └── Date/time                                              │
│                                                              │
│  Stats Screen displays:                                     │
│  ├── Top 10 scores                                          │
│  ├── Total games played                                     │
│  ├── Average score                                          │
│  └── Best score                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Implementation Files (v1.0)

```
src/
├── db/
│   └── highscoreDb.ts    # Highscore operations
├── stores/
│   └── (uses direct DB)  # No progression store in v1.0
└── app/
    └── stats.tsx         # Stats/leaderboard screen
```

---

## 2. Future Progression Systems (v2.0+)

The following systems are planned for future releases:

### 2.1 Player Level System (Planned)

| Aspect | Planned Value |
|--------|---------------|
| **XP Sources** | Words found, games completed, achievements |
| **Level Cap** | 100 (with prestige system) |
| **Unlocks** | Themes, avatars, power-ups |

**XP Earning (Planned)**:

| Activity | XP |
|----------|---|
| 3-letter word | 10 |
| 4-letter word | 25 |
| 5-letter word | 50 |
| 6+ letter word | 100+ |
| Game completion | 50 |
| Daily streak bonus | 100 |

### 2.2 Personal Dictionary (Planned)

Track every unique word the player has ever found:

| Feature | Description |
|---------|-------------|
| **Storage** | All unique words ever found |
| **Statistics** | Usage count, best score with word |
| **Categories** | Words grouped thematically |
| **Discovery %** | Percentage of words found per category |

**Milestones (Planned)**:

| Unique Words | Achievement |
|--------------|-------------|
| 100 | Word Explorer |
| 500 | Word Collector |
| 1,000 | Word Master |
| 5,000 | Word Legend |

### 2.3 Achievement System (Planned)

**Achievement Categories**:

| Category | Examples |
|----------|----------|
| Wordsmith | Find long words (6+, 7+, 8+ letters) |
| Combo Master | Achieve high combos (2×, 3×, 5×, 10×) |
| Speed Demon | Find words quickly |
| Dedication | Maintain daily streaks |
| Explorer | Complete game modes |

### 2.4 Battle Pass / Season Pass (Planned)

| Parameter | Planned Value |
|-----------|---------------|
| **Season Length** | 8 weeks |
| **Free Track** | 30 rewards |
| **Premium Track** | +30 rewards |
| **Premium Price** | $4.99 |

### 2.5 Global Leaderboards (Planned)

Requires backend (Firebase/PlayFab):

| Type | Reset Period |
|------|--------------|
| Daily | 24 hours |
| Weekly | 7 days |
| All-Time | Never |
| Friends | Continuous |

### 2.6 Streak System (Planned)

| Feature | Description |
|---------|-------------|
| **Trigger** | Play at least once per day |
| **Rewards** | Increasing bonuses for longer streaks |
| **Recovery** | Watch ad to preserve streak (1 grace) |

---

## 3. v1.0 Stats Screen

### 3.1 Current Implementation

The Stats screen shows local highscore data:

| Section | Content |
|---------|---------|
| **Leaderboard** | Top 10 local scores with details |
| **Statistics** | Total games, average score, best score |
| **Clear Data** | Option to reset all highscores |

### 3.2 Component Structure

```
app/stats.tsx
└── Uses:
    ├── StatCard         # Individual stat display
    ├── LeaderboardRow   # Highscore entry row
    └── highscoreDb      # Data operations
```

### 3.3 Highscore Data Model

```typescript
interface HighScoreEntry {
  id: number;
  score: number;
  wordsFound: number;
  bestWord: string | null;
  longestWord: string | null;
  createdAt: string;
}
```

### 3.4 Functional Requirements (v1.0)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-HS-01 | Display top 10 highscores | ✅ |
| FR-HS-02 | Show score, words found, best word per entry | ✅ |
| FR-HS-03 | Calculate and display total games | ✅ |
| FR-HS-04 | Calculate and display average score | ✅ |
| FR-HS-05 | Allow clearing all highscore data | ✅ |

---

## 4. Future Requirements (v2.0+)

### 4.1 Player Level Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PL-01 | XP shall accumulate across all game modes | P0 |
| FR-PL-02 | Level up shall trigger celebration animation | P1 |
| FR-PL-03 | Unlocks shall be available immediately upon level up | P0 |
| FR-PL-04 | XP progress shall sync to cloud within 60 seconds | P1 |

### 4.2 Achievement Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AC-01 | Achievements shall track progress incrementally | P0 |
| FR-AC-02 | Completion shall trigger notification | P1 |
| FR-AC-03 | Rewards shall be claimable from achievement screen | P0 |
| FR-AC-04 | Hidden achievements shall reveal on completion | P2 |

### 4.3 Leaderboard Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LB-01 | Leaderboards shall update within 5 minutes | P1 |
| FR-LB-02 | Player shall see their rank and nearby players | P0 |
| FR-LB-03 | Friends leaderboard shall require social login | P2 |

### 4.4 Battle Pass Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BP-01 | XP shall accumulate toward Battle Pass levels | P0 |
| FR-BP-02 | Premium purchase shall unlock all premium rewards up to current level | P0 |
| FR-BP-03 | Season timer shall display remaining time | P1 |
| FR-BP-04 | Unclaimed rewards shall be available until season end +7 days | P1 |

---

## 5. Implementation Roadmap

| Version | Features |
|---------|----------|
| v1.0 | ✅ Local highscores only |
| v2.0 | Player levels, XP system, basic achievements |
| v2.1 | Personal dictionary, more achievements |
| v2.2 | Global leaderboards (requires backend) |
| v2.3 | Streak system, daily rewards |
| v3.0 | Battle Pass, seasonal content |

---

*v1.0 includes local highscores only. All other progression systems are planned for future releases.*
*Updated for LetterCrush v1.0 implementation*
*Generated by BMAD PRD Workflow v2.0*
