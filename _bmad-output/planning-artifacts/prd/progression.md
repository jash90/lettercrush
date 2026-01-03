# WordGrid PRD - Progression Systems

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Player Level System

### 1.1 Overview

The primary indicator of player progress and engagement.

| Aspect | Details |
|--------|---------|
| **XP Sources** | Words found, levels completed, challenges, achievements |
| **Level Cap** | 100 (with prestige system) |
| **Unlock Mechanism** | Features, power-ups, modes tied to levels |

### 1.2 XP Earning

| Activity | Base XP | Notes |
|----------|---------|-------|
| 3-letter word | 10 XP | Easy mode only |
| 4-letter word | 25 XP | |
| 5-letter word | 50 XP | |
| 6-letter word | 100 XP | |
| 7+ letter word | 200 XP | Rare achievement |
| Campaign level complete | 100-500 XP | Based on stars |
| Daily Challenge complete | 300 XP | Per stage |
| Achievement unlock | 50-500 XP | Based on difficulty |
| First win of day | 100 XP | Bonus |

### 1.3 Level Progression Table

| Level Range | XP per Level | Cumulative XP | Major Unlocks |
|-------------|--------------|---------------|---------------|
| 1-5 | 100-500 | 1,500 | Hints, basic power-ups |
| 6-15 | 500-1,500 | 15,000 | Daily Challenge, Shuffle, Time Freeze |
| 16-30 | 1,500-3,000 | 60,000 | PvP Mode, custom themes |
| 31-50 | 3,000-5,000 | 165,000 | Leagues, exclusive avatars |
| 51-75 | 5,000-7,000 | 330,000 | Advanced power-ups |
| 76-100 | 7,000-10,000 | 550,000 | Prestige unlock |

### 1.4 Prestige System (Level 100+)

After reaching level 100, players can prestige:

- Reset to level 1 with prestige badge
- +5% permanent XP bonus per prestige
- Exclusive prestige-only rewards
- Prestige leaderboard

### 1.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PL-01 | XP shall accumulate across all game modes | P0 |
| FR-PL-02 | Level up shall trigger celebration animation | P1 |
| FR-PL-03 | Unlocks shall be available immediately upon level up | P0 |
| FR-PL-04 | XP progress shall sync to cloud within 60 seconds | P1 |

---

## 2. Personal Dictionary

### 2.1 Overview

A collectible element where every found word is permanently recorded.

| Feature | Description |
|---------|-------------|
| **Storage** | All unique words ever found |
| **Statistics** | Usage count, best score with word |
| **Categories** | Words grouped thematically |
| **Discovery** | Percentage of words found per category |

### 2.2 Word Statistics

For each word in dictionary:

```
┌─────────────────────────────────────┐
│  EXAMPLE                            │
│  ────────────────────────────       │
│  Times Used: 47                     │
│  Best Score: 1,284 points           │
│  First Found: Jan 15, 2025          │
│  Category: Objects                  │
│  Rarity: Common                     │
└─────────────────────────────────────┘
```

### 2.3 Category System

| Category | Example Words | Total in Dictionary |
|----------|---------------|---------------------|
| Animals | Cat, Dog, Lion | ~500 |
| Nature | Tree, River, Mountain | ~400 |
| Professions | Doctor, Teacher | ~300 |
| Objects | Table, Chair, Book | ~600 |
| Actions | Run, Jump, Swim | ~400 |
| Adjectives | Big, Small, Fast | ~350 |
| Places | City, School, Park | ~300 |
| Food | Apple, Bread, Water | ~350 |

### 2.4 Milestones

| Unique Words | Achievement | Reward |
|--------------|-------------|--------|
| 100 | Word Explorer | 500 coins |
| 500 | Word Collector | 2,000 coins + avatar |
| 1,000 | Word Master | 5,000 coins + theme |
| 5,000 | Word Legend | 10,000 coins + exclusive badge |
| 10,000 | Wordsmith Supreme | Legendary title |

### 2.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PD-01 | Each unique word shall be recorded only once | P0 |
| FR-PD-02 | Statistics shall update in real-time | P1 |
| FR-PD-03 | Dictionary shall be searchable | P2 |
| FR-PD-04 | Category discovery % shall calculate accurately | P1 |

---

## 3. Achievement System

### 3.1 Overview

Multi-dimensional achievements rewarding different play styles.

### 3.2 Achievement Categories

#### 3.2.1 Wordsmith Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Word | Find your first word | 50 coins |
| Six Pack | Find a 6-letter word | 100 coins |
| Seven Heaven | Find a 7-letter word | 250 coins |
| Eight is Great | Find an 8-letter word | 500 coins |
| Vocabulary Master | Find 100 unique long words (6+) | 1,000 coins |

#### 3.2.2 Combo Master Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Double Trouble | Achieve 2× combo | 100 coins |
| Triple Threat | Achieve 3× combo | 200 coins |
| Combo King | Achieve 5× combo | 500 coins |
| Chain Reaction | Achieve 10× combo | 1,000 coins |

#### 3.2.3 Speed Demon Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Quick Draw | Find word in <2 seconds | 100 coins |
| Speed Freak | Find 10 words in 1 minute | 250 coins |
| Lightning Fingers | Find 20 words in 2 minutes | 500 coins |

#### 3.2.4 Dedication Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Week Warrior | 7-day streak | 500 coins |
| Month Master | 30-day streak | 2,000 coins |
| Century Club | 100-day streak | 5,000 coins |
| Year of Words | 365-day streak | 10,000 coins + exclusive |

#### 3.2.5 Social Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Friend Finder | Invite 1 friend | 100 coins |
| Social Butterfly | Invite 10 friends | 500 coins |
| PvP Debut | Win first PvP match | 200 coins |
| Champion | Win 100 PvP matches | 2,000 coins |

#### 3.2.6 Explorer Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Island Hopper | Complete Tutorial Island | 200 coins |
| Frost Walker | Complete Frozen Fjords | 500 coins |
| Desert Wanderer | Complete Desert Dunes | 500 coins |
| Jungle Explorer | Complete Jungle Ruins | 500 coins |
| World Traveler | Complete all regions | 5,000 coins |

### 3.3 Achievement Rarity

| Rarity | Color | % of Players |
|--------|-------|--------------|
| Common | Bronze | >50% |
| Uncommon | Silver | 25-50% |
| Rare | Gold | 10-25% |
| Epic | Purple | 1-10% |
| Legendary | Orange | <1% |

### 3.4 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AC-01 | Achievements shall track progress incrementally | P0 |
| FR-AC-02 | Completion shall trigger notification | P1 |
| FR-AC-03 | Rewards shall be claimable from achievement screen | P0 |
| FR-AC-04 | Hidden achievements shall reveal on completion | P2 |

---

## 4. Battle Pass (Season Pass) - v2.0

### 4.1 Overview

Primary long-term retention driver with seasonal content.

| Parameter | Value |
|-----------|-------|
| **Season Length** | 8 weeks |
| **Free Track** | 30 rewards |
| **Premium Track** | +30 rewards |
| **Premium Price** | $4.99 |
| **Total Levels** | 60 |

### 4.2 Progression

| Level Method | XP per Level |
|--------------|--------------|
| Weekly Missions | 3,000 XP each (5 missions) |
| Daily Missions | 500 XP each (3 missions) |
| Regular Gameplay | ~200-500 XP/session |

### 4.3 Free Track Rewards (Sample)

| Level | Reward |
|-------|--------|
| 5 | 500 coins |
| 10 | 1 Hint pack (3) |
| 15 | 100 gems |
| 20 | Basic avatar |
| 25 | 1,000 coins |
| 30 | Season theme (basic) |

### 4.4 Premium Track Rewards (Sample)

| Level | Reward |
|-------|--------|
| 5 | 1,000 coins |
| 10 | Exclusive avatar |
| 15 | 200 gems |
| 20 | Exclusive theme |
| 25 | Power-up bundle |
| 30 | Season badge |
| 45 | Legendary avatar |
| 60 | Exclusive title |

### 4.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BP-01 | XP shall accumulate toward Battle Pass levels | P0 |
| FR-BP-02 | Premium purchase shall unlock all premium rewards up to current level | P0 |
| FR-BP-03 | Season timer shall display remaining time | P1 |
| FR-BP-04 | Unclaimed rewards shall be available until season end +7 days | P1 |

---

## 5. Leaderboards

### 5.1 Leaderboard Types

| Type | Reset Period | Scope |
|------|--------------|-------|
| Daily | 24 hours | Global |
| Weekly | 7 days | Global |
| All-Time | Never | Global |
| Friends | Continuous | Social |
| League | Season | Tier |

### 5.2 Ranking Metrics

| Leaderboard | Metric |
|-------------|--------|
| Classic | Highest single-game score |
| Campaign | Total stars collected |
| Daily Challenge | Streak length |
| PvP | ELO rating |
| Words | Unique words found |

### 5.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LB-01 | Leaderboards shall update within 5 minutes | P1 |
| FR-LB-02 | Player shall see their rank and nearby players | P0 |
| FR-LB-03 | Friends leaderboard shall require social login | P2 |

---

*Generated by BMAD PRD Workflow v1.0*
