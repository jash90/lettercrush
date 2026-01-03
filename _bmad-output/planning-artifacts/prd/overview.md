---
stepsCompleted: ["overview", "features", "requirements"]
inputDocuments: ["docs/wordgrid-gdd.md"]
workflowType: 'prd'
project_name: 'LetterCrush'
---

# Product Requirements Document - LetterCrush

**Author:** BMAD Product Manager
**Date:** 2026-01-03
**Version:** 1.1
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Vision

LetterCrush is an innovative mobile word puzzle game that combines the addictive match-3 mechanics with word-building gameplay. Players swap adjacent letters on a grid to form valid words, creating a unique hybrid experience that appeals to both casual puzzle fans and word game enthusiasts.

### 1.2 Elevator Pitch

LetterCrush combines the satisfying cascade mechanics of Candy Crush with the intellectual challenge of Scrabble. Players swap letters on a 6×6 grid to form words - the longer the word and better the combination, the higher the score. It's the first true hybrid of match-3 and word games.

### 1.3 Unique Selling Points (USPs)

| USP | Description | Market Differentiator |
|-----|-------------|----------------------|
| **Hybrid Mechanics** | Match-3 + Word Game in one package | Creates new genre hybrid |
| **Emergent Gameplay** | Players discover words they didn't plan | Surprise & delight moments |
| **Dual Language** | Polish and English dictionaries | Bilingual market reach |
| **Simple Monetization** | Interstitial ads on replay | Non-intrusive UX |
| **Offline First** | Full gameplay without internet | Reliable experience |

### 1.4 Target Audience

**Primary:** Casual mobile gamers aged 25-45
- Word game enthusiasts (Wordscapes, Word Cookies players)
- Match-3 fans seeking cognitive challenge (Candy Crush graduates)
- Polish and English speaking markets

**Secondary:** Casual puzzle fans aged 18-35
- Quick session players (commuters, break-time gaming)
- Achievement seekers

### 1.5 Success Criteria

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| D1 Retention | **35%+** | 26-28% (top 25%) |
| D7 Retention | **15%+** | ~8% (median) |
| Avg Session Length | **5-8 min** | 5-6 min (median) |
| Crash Rate | **<0.5%** | <2% (acceptable) |
| Tutorial Completion | **85%+** | 70% (average) |

---

## 2. Product Scope

### 2.1 In Scope (v1.0) - Current Implementation

- ✅ Core grid-based word gameplay (6×6 grid)
- ✅ Timer Mode (countdown gameplay with 3 strikes)
- ✅ Player highscore tracking (SQLite persistence)
- ✅ Polish and English dictionary support
- ✅ Language switching (settings + onboarding)
- ✅ Scoring system (Scrabble-style letter values + combos)
- ✅ Cascade mechanics (gravity + refill)
- ✅ Sound and haptic feedback settings
- ✅ Tutorial/How to Play screen
- ✅ Statistics and leaderboard
- ✅ Interstitial ads on game replay
- ✅ iOS and Android platforms (via Expo)

### 2.2 Out of Scope (v1.0)

- Campaign/Puzzle Mode with levels
- Power-ups system
- Daily Challenges
- PvP Versus Mode
- Cloud save/sync
- Battle Pass system
- Subscription model
- Additional languages (German, Spanish, French)
- Tablet-optimized layouts

### 2.3 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React Native | 0.81.5 |
| Platform | Expo | 54.0.30 |
| Language | TypeScript | 5.3 |
| State | Zustand | 5.0 |
| Database | expo-sqlite | 16.x |
| Ads | react-native-google-mobile-ads | Latest |
| Animation | react-native-reanimated | 3.x |

---

## 3. Core Features

### 3.1 Gameplay

- **6×6 Letter Grid**: Dynamic grid with language-specific letter distribution
- **Word Formation**: Horizontal and vertical word detection (3+ letters)
- **Swap Mechanics**: Adjacent tile swapping via tap or swipe gestures
- **Cascade System**: Matched letters removed, new letters fall from above
- **Combo System**: Sequential matches multiply score

### 3.2 Game Modes

| Mode | Description | Status |
|------|-------------|--------|
| Timer Mode | 2-minute countdown with 3 strikes for invalid words | ✅ Implemented |
| Zen Mode | Relaxed gameplay without timer | 📋 Planned |
| Campaign | Level-based progression | 📋 Planned |

### 3.3 Progression & Statistics

- **Highscore Tracking**: Top 10 scores with date
- **Game Statistics**: Best score, games played, average score
- **Per-Game Stats**: Words found, longest word, best combo

---

## 4. Screens & Navigation

### 4.1 Screen Map

```
┌─────────────────────────────────────────────────────────────┐
│                    APP NAVIGATION                            │
│                                                              │
│  ┌──────────────────┐                                       │
│  │ Language Select  │ ← First run only                      │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │      Home        │ ← Main menu                           │
│  │   (index.tsx)    │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│   ┌───────┼───────┬───────┬───────┐                        │
│   │       │       │       │       │                        │
│   ▼       ▼       ▼       ▼       ▼                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│ │Game │ │Stats│ │Tutor│ │Setti│ │Lang │                   │
│ │     │ │     │ │ial  │ │ngs  │ │Sel. │                   │
│ └──┬──┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
│    │                                                        │
│    ▼                                                        │
│ ┌──────────────────┐                                       │
│ │   Game Screen    │                                       │
│ │   - Grid         │                                       │
│ │   - Score/Timer  │                                       │
│ │   - Word Builder │                                       │
│ └────────┬─────────┘                                       │
│          │                                                  │
│    ┌─────┴─────┐                                           │
│    ▼           ▼                                           │
│ ┌──────┐  ┌──────────┐                                     │
│ │Pause │  │Game Over │                                     │
│ │Modal │  │Modal     │                                     │
│ └──────┘  └──────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Screen Details

| Screen | File | Purpose |
|--------|------|---------|
| Home | `app/index.tsx` | Main menu, navigation hub |
| Game | `app/game.tsx` | Core gameplay |
| Settings | `app/settings.tsx` | Language, sound, data management |
| Stats | `app/stats.tsx` | Leaderboard, statistics |
| Tutorial | `app/tutorial.tsx` | How to play guide |
| Language Select | `app/language-select.tsx` | First-run onboarding |

---

## 5. Monetization

### 5.1 Current Model (v1.0)

| Type | Implementation | Placement |
|------|----------------|-----------|
| Interstitial Ads | Google AdMob | After "Play Again" button |

### 5.2 Future Monetization (v2.0+)

- Rewarded video ads for power-ups
- Remove ads IAP
- Cosmetic purchases (themes)

---

## 6. Document Structure

This PRD is organized into sharded documents for maintainability:

| Document | Content |
|----------|---------|
| `overview.md` | This document - executive summary, scope, stakeholders |
| `core-gameplay.md` | Core loop, mechanics, scoring system |
| `game-modes.md` | All game modes specifications |
| `progression.md` | XP, levels, achievements, dictionary |
| `monetization.md` | IAP, ads, subscription, currencies |
| `requirements.md` | Functional & non-functional requirements |

---

*Updated for LetterCrush React Native + Expo implementation*
*Generated by BMAD PRD Workflow v2.0*
