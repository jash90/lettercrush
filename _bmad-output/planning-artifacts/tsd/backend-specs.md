# LetterCrush TSD - Backend Specifications

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. v1.0 Backend Architecture

### 1.1 Current State: Fully Offline

LetterCrush v1.0 is a **fully offline game** with no backend services.

```
┌─────────────────────────────────────────────────────────────┐
│                 v1.0 ARCHITECTURE (OFFLINE)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   CLIENT (React Native)                  ││
│  │                                                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ││
│  │  │   Zustand   │  │  expo-sql   │  │   AdMob     │     ││
│  │  │   (State)   │  │ (SQLite DB) │  │   (Ads)     │     ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘     ││
│  │                                                          ││
│  │  All data stored locally:                               ││
│  │  • Dictionary (SQLite)                                  ││
│  │  • Highscores (SQLite)                                  ││
│  │  • Settings (SecureStore)                               ││
│  │  • Language preference (AsyncStorage)                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  External Services:                                          │
│  • Google AdMob - Interstitial ads                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 v1.0 Implementation Status

| Feature | Backend Required | v1.0 Status |
|---------|-----------------|-------------|
| Gameplay | ❌ No | ✅ Local only |
| Dictionary | ❌ No | ✅ SQLite |
| Highscores | ❌ No | ✅ SQLite (local only) |
| Settings | ❌ No | ✅ SecureStore/AsyncStorage |
| Ads | ⚠️ External | ✅ Google AdMob |
| User Accounts | ✅ Yes | 📋 Not implemented |
| Cloud Sync | ✅ Yes | 📋 Not implemented |
| Leaderboards | ✅ Yes | 📋 Not implemented |
| PvP | ✅ Yes | 📋 Not implemented |
| IAP | ✅ Yes | 📋 Not implemented |
| Push Notifications | ✅ Yes | 📋 Not implemented |

### 1.3 v1.0 Data Storage

All data is stored locally on the device:

```typescript
// Local SQLite Database
src/db/
├── database.ts       # SQLite initialization
├── dictionaryDb.ts   # Dictionary operations
└── highscoreDb.ts    # Highscore operations

// SQLite Schema
CREATE TABLE dictionary_en (
  id INTEGER PRIMARY KEY,
  word TEXT UNIQUE,
  length INTEGER
);

CREATE TABLE highscores (
  id INTEGER PRIMARY KEY,
  score INTEGER,
  words_found INTEGER,
  best_word TEXT,
  longest_word TEXT,
  created_at TEXT
);
```

---

## 2. Future Backend Architecture (v2.0+)

The following backend services are planned for future releases when cloud features are needed.

### 2.1 Planned Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  v2.0+ BACKEND SERVICES                       │
│                       (PLANNED)                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    API GATEWAY                           ││
│  │              (Firebase Hosting + Functions)              ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│      ┌───────────────────┼───────────────────┐              │
│      ▼                   ▼                   ▼              │
│  ┌─────────┐       ┌─────────┐        ┌─────────┐          │
│  │Firebase │       │ PlayFab │        │ Custom  │          │
│  │ Suite   │       │ Backend │        │Functions│          │
│  │         │       │         │        │         │          │
│  │- Auth   │       │- Leaders│        │- Score  │          │
│  │- Firestore│     │- Match  │        │- Daily  │          │
│  │- Storage │      │- Economy│        │- PvP    │          │
│  │- Analytics│     │         │        │         │          │
│  └─────────┘       └─────────┘        └─────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Planned Features by Release

| Release | Backend Features |
|---------|-----------------|
| v2.0 | Firebase Auth, Cloud Save, Global Leaderboards |
| v2.1 | Daily Challenges (server-generated), Achievements sync |
| v2.2 | PvP Matchmaking, Real-time multiplayer |
| v2.3 | IAP backend validation, Economy system |
| v3.0 | Social features, Friends system, Push notifications |

### 2.3 Planned Service Responsibilities

| Service | Provider | Responsibility |
|---------|----------|----------------|
| Authentication | Firebase Auth | User identity, OAuth, anonymous accounts |
| User Database | Firestore | Profile, progress, settings sync |
| Leaderboards | PlayFab | Global rankings, seasonal competitions |
| Matchmaking | PlayFab | PvP queue, ELO-based matching |
| Cloud Functions | Firebase | Custom logic, score validation |
| Analytics | Firebase Analytics | Events, funnels, cohorts |
| Push Notifications | FCM/APNs | Engagement, reminders |
| Remote Config | Firebase | A/B testing, feature flags |

---

## 3. Migration Path: Local → Cloud

### 3.1 Data Migration Strategy

When cloud features are introduced, existing local data will need to migrate:

```
┌─────────────────────────────────────────────────────────────┐
│               LOCAL → CLOUD MIGRATION                         │
│                                                              │
│  Phase 1: Account Creation (v2.0)                           │
│  • User creates/links Firebase account                      │
│  • Local highscores uploaded to cloud                       │
│  • Settings synced to Firestore                             │
│                                                              │
│  Phase 2: Ongoing Sync (v2.0+)                              │
│  • New scores sync to cloud automatically                   │
│  • Offline play → queue for upload on reconnect             │
│  • Conflict resolution: highest score wins                  │
│                                                              │
│  Phase 3: Cross-Device (v2.1+)                              │
│  • Progress synced across devices                           │
│  • Dictionary discoveries merged                            │
│  • Achievements unified                                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| Existing users, no account | Continue playing locally, prompt to create account |
| Existing users, create account | Local data uploaded, account linked |
| New users | Can play offline or create account immediately |
| Offline mode | Full gameplay, sync when online |

---

## 4. Planned API Specifications (v2.0+)

### 4.1 REST API Endpoints (Planned)

| Endpoint | Method | Description | Priority |
|----------|--------|-------------|----------|
| `/api/v1/auth/login` | POST | Authenticate user | P0 |
| `/api/v1/auth/refresh` | POST | Refresh token | P0 |
| `/api/v1/user/profile` | GET/PUT | User profile | P0 |
| `/api/v1/game/score` | POST | Submit score | P0 |
| `/api/v1/leaderboard/{type}` | GET | Get leaderboard | P1 |
| `/api/v1/game/daily` | GET | Get daily challenge | P2 |
| `/api/v1/pvp/match` | POST | Find/create match | P3 |
| `/api/v1/iap/verify` | POST | Verify purchase | P2 |

### 4.2 Score Submission (Planned)

```typescript
// POST /api/v1/game/score
interface ScoreSubmission {
  mode: 'timer';
  score: number;
  gameData: {
    wordsFound: string[];
    timeElapsed: number;
    combos: number[];
    strikes: number;
  };
}

// Response
interface ScoreResponse {
  success: boolean;
  rank?: number;
  isNewHighscore: boolean;
}
```

---

## 5. Security Considerations (v2.0+)

### 5.1 Score Validation

| Check | Description |
|-------|-------------|
| Time validation | Score must be achievable in game time |
| Word validation | All words must exist in dictionary |
| Statistical analysis | Flag impossible scores |
| Rate limiting | Max submissions per hour |

### 5.2 Planned Security Measures

| Measure | Implementation |
|---------|----------------|
| Authentication | Firebase Auth with JWT |
| Data encryption | TLS 1.3 for transit, AES for storage |
| Rate limiting | 60 requests/minute per user |
| Input validation | Server-side validation of all inputs |
| Receipt validation | Server-side IAP receipt verification |

---

## 6. Analytics Events (Planned)

### 6.1 Core Events (v2.0+)

| Event | Parameters | Purpose |
|-------|------------|---------|
| `session_start` | - | Track DAU |
| `game_complete` | score, words, time | Gameplay metrics |
| `word_found` | word, length, score | Word analytics |
| `ad_viewed` | ad_type | Ad revenue |
| `iap_purchase` | product_id, price | Revenue tracking |
| `level_up` | new_level | Progression |

---

## 7. Cost Estimates (v2.0+)

### 7.1 Firebase Pricing (Estimated)

| Service | Free Tier | Estimated Cost @ 10K DAU |
|---------|-----------|--------------------------|
| Auth | 10K verifications/month | Free |
| Firestore | 1GB storage | ~$5/month |
| Functions | 2M invocations/month | ~$10/month |
| Hosting | 10GB/month | Free |
| **Total** | - | **~$15-30/month** |

### 7.2 PlayFab Pricing (Estimated)

| Tier | MAU Limit | Cost |
|------|-----------|------|
| Free | 10K | $0 |
| Standard | 100K | $99/month |
| Pro | Unlimited | Custom |

---

## 8. Implementation Timeline (Tentative)

| Phase | Features | Estimated Effort |
|-------|----------|------------------|
| v2.0 | Firebase Auth, Cloud Save | 2-3 weeks |
| v2.1 | Leaderboards, Achievements | 2 weeks |
| v2.2 | Daily Challenges, Analytics | 2 weeks |
| v2.3 | PvP Basic | 4 weeks |
| v3.0 | Social, Push | 3 weeks |

---

*This document describes future backend plans. LetterCrush v1.0 is fully offline.*
*Updated for LetterCrush v1.0 (offline-first architecture)*
*Generated by BMAD TSD Workflow v2.0*
