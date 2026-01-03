# WordGrid TSD - Backend Specifications

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. Backend Architecture Overview

### 1.1 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
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

### 1.2 Service Responsibilities

| Service | Provider | Responsibility |
|---------|----------|----------------|
| Authentication | Firebase Auth | User identity, OAuth |
| User Database | Firestore | Profile, progress, settings |
| Leaderboards | PlayFab | Global rankings, seasonal |
| Matchmaking | PlayFab | PvP queue, ELO matching |
| Cloud Functions | Firebase | Custom logic, validation |
| Analytics | Firebase Analytics | Events, funnels, cohorts |
| Push Notifications | FCM/APNs | Engagement, reminders |
| Remote Config | Firebase | A/B testing, feature flags |

---

## 2. Firebase Configuration

### 2.1 Firestore Data Model

```
/users/{userId}
├── profile
│   ├── displayName: string
│   ├── avatarId: string
│   ├── level: number
│   ├── xp: number
│   ├── coins: number
│   ├── gems: number
│   ├── lastLogin: timestamp
│   ├── streak: number
│   ├── createdAt: timestamp
│   └── settings: map
│
├── progress
│   ├── campaignLevel: number
│   ├── starsCollected: number
│   ├── levelResults: map<levelId, result>
│   └── dailyChallenge: map
│
├── inventory
│   ├── powerUps: map<type, count>
│   ├── themes: array<themeId>
│   └── avatars: array<avatarId>
│
├── dictionary
│   ├── words: map<word, stats>
│   ├── totalWords: number
│   └── categories: map<category, progress>
│
├── achievements
│   └── {achievementId}: { unlocked, progress, timestamp }
│
└── purchases
    └── {purchaseId}: { product, timestamp, receipt }

/leaderboards/{type}_{period}
└── entries/{rank}
    ├── userId: string
    ├── displayName: string
    ├── score: number
    └── timestamp: timestamp

/daily_challenges/{date}
├── config: DailyChallengeConfig
├── leaderboard: map<userId, score>
└── completions: array<userId>

/pvp_matches/{matchId}
├── players: array<userId>
├── grid: string (serialized)
├── status: "pending" | "active" | "completed"
├── scores: map<userId, score>
├── startTime: timestamp
└── endTime: timestamp
```

### 2.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User data - owner only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Validate profile updates
      match /profile {
        allow update: if validateProfileUpdate(request.resource.data);
      }

      // Prevent coin/gem manipulation
      match /inventory {
        allow read: if request.auth.uid == userId;
        allow write: if false; // Server-only
      }
    }

    // Leaderboards - read only for users
    match /leaderboards/{leaderboardId} {
      allow read: if request.auth != null;
      allow write: if false; // Server-only
    }

    // Daily challenges - read for authenticated users
    match /daily_challenges/{date} {
      allow read: if request.auth != null;
      allow write: if false; // Server-only
    }

    // PvP matches - participants only
    match /pvp_matches/{matchId} {
      allow read: if request.auth != null &&
                    request.auth.uid in resource.data.players;
      allow write: if false; // Server-only
    }

    // Helper functions
    function validateProfileUpdate(data) {
      return data.displayName.size() <= 20 &&
             data.displayName.matches('[a-zA-Z0-9_]+');
    }
  }
}
```

### 2.3 Firebase Cloud Functions

```typescript
// functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Score submission with validation
export const submitScore = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { mode, score, gameData } = data;
  const userId = context.auth.uid;

  // Validate score
  if (!validateScore(score, gameData)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid score data');
  }

  // Check for cheating patterns
  if (await detectCheating(userId, score, gameData)) {
    await flagUser(userId, 'suspicious_score');
    throw new functions.https.HttpsError('permission-denied', 'Score rejected');
  }

  // Update leaderboard
  await updateLeaderboard(mode, userId, score);

  // Award XP
  const xpEarned = calculateXP(score, gameData);
  await addXP(userId, xpEarned);

  return { success: true, xpEarned };
});

// Daily challenge generation
export const generateDailyChallenge = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const date = new Date().toISOString().split('T')[0];

    const challenge = {
      config: generateChallengeConfig(),
      leaderboard: {},
      completions: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('daily_challenges')
      .doc(date)
      .set(challenge);

    // Send push notifications
    await sendDailyChallengeNotification();
});

// IAP verification
export const verifyPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { platform, receipt, productId } = data;
  const userId = context.auth.uid;

  // Verify with store
  const isValid = platform === 'ios'
    ? await verifyAppleReceipt(receipt)
    : await verifyGoogleReceipt(receipt);

  if (!isValid) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid receipt');
  }

  // Deliver product
  await deliverProduct(userId, productId);

  // Record purchase
  await recordPurchase(userId, productId, receipt);

  return { success: true };
});

// PvP matchmaking
export const findMatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = context.auth.uid;
  const userElo = await getUserElo(userId);

  // Find matching opponent (±200 ELO, expanding over time)
  const opponent = await findOpponent(userId, userElo);

  if (opponent) {
    // Create match
    const matchId = await createMatch(userId, opponent.id);
    return { matched: true, matchId };
  } else {
    // Add to queue
    await addToMatchQueue(userId, userElo);
    return { matched: false, queued: true };
  }
});
```

---

## 3. PlayFab Integration

### 3.1 PlayFab Configuration

```typescript
// playfab/config.ts

import { PlayFabClient, PlayFabServer } from 'playfab-sdk';

export const initPlayFab = () => {
  PlayFabClient.settings.titleId = process.env.PLAYFAB_TITLE_ID;
  PlayFabServer.settings.titleId = process.env.PLAYFAB_TITLE_ID;
  PlayFabServer.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;
};
```

### 3.2 Leaderboard Operations

```typescript
// playfab/leaderboards.ts

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  score: number;
  rank: number;
}

export const updateLeaderboard = async (
  playerId: string,
  statName: string,
  value: number
): Promise<void> => {
  await PlayFabServer.UpdatePlayerStatistics({
    PlayFabId: playerId,
    Statistics: [{ StatisticName: statName, Value: value }]
  });
};

export const getLeaderboard = async (
  statName: string,
  maxResults: number = 100
): Promise<LeaderboardEntry[]> => {
  const result = await PlayFabClient.GetLeaderboard({
    StatisticName: statName,
    MaxResultsCount: maxResults
  });

  return result.data.Leaderboard.map(entry => ({
    playerId: entry.PlayFabId,
    displayName: entry.DisplayName,
    score: entry.StatValue,
    rank: entry.Position + 1
  }));
};

export const getLeaderboardAroundPlayer = async (
  playerId: string,
  statName: string,
  maxResults: number = 10
): Promise<LeaderboardEntry[]> => {
  const result = await PlayFabClient.GetLeaderboardAroundPlayer({
    StatisticName: statName,
    PlayFabId: playerId,
    MaxResultsCount: maxResults
  });

  return result.data.Leaderboard.map(entry => ({
    playerId: entry.PlayFabId,
    displayName: entry.DisplayName,
    score: entry.StatValue,
    rank: entry.Position + 1
  }));
};
```

### 3.3 ELO Matchmaking

```typescript
// playfab/matchmaking.ts

const ELO_K_FACTOR = 32;
const INITIAL_ELO = 1000;

export const calculateEloChange = (
  playerElo: number,
  opponentElo: number,
  playerWon: boolean
): number => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = playerWon ? 1 : 0;
  return Math.round(ELO_K_FACTOR * (actualScore - expectedScore));
};

export const updateElo = async (
  winnerId: string,
  loserId: string
): Promise<{ winnerElo: number; loserElo: number }> => {
  const [winnerStats, loserStats] = await Promise.all([
    getPlayerElo(winnerId),
    getPlayerElo(loserId)
  ]);

  const winnerChange = calculateEloChange(winnerStats.elo, loserStats.elo, true);
  const loserChange = calculateEloChange(loserStats.elo, winnerStats.elo, false);

  const newWinnerElo = winnerStats.elo + winnerChange;
  const newLoserElo = Math.max(0, loserStats.elo + loserChange);

  await Promise.all([
    updatePlayerElo(winnerId, newWinnerElo),
    updatePlayerElo(loserId, newLoserElo)
  ]);

  return { winnerElo: newWinnerElo, loserElo: newLoserElo };
};
```

---

## 4. API Specifications

### 4.1 REST API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/login` | POST | Authenticate user | No |
| `/api/v1/auth/refresh` | POST | Refresh token | Yes |
| `/api/v1/user/profile` | GET | Get user profile | Yes |
| `/api/v1/user/profile` | PUT | Update profile | Yes |
| `/api/v1/game/score` | POST | Submit score | Yes |
| `/api/v1/game/daily` | GET | Get daily challenge | Yes |
| `/api/v1/leaderboard/{type}` | GET | Get leaderboard | Yes |
| `/api/v1/pvp/match` | POST | Find/create match | Yes |
| `/api/v1/pvp/result` | POST | Submit match result | Yes |
| `/api/v1/iap/verify` | POST | Verify purchase | Yes |

### 4.2 API Request/Response Formats

```typescript
// Score submission
POST /api/v1/game/score
{
  "mode": "classic" | "campaign" | "daily",
  "score": number,
  "levelId": string?, // For campaign
  "gameData": {
    "wordsFound": string[],
    "timeElapsed": number,
    "combos": number[],
    "powerUpsUsed": string[]
  }
}

Response:
{
  "success": true,
  "xpEarned": number,
  "newLevel": number?,
  "achievements": Achievement[],
  "leaderboardRank": number?
}

// Leaderboard
GET /api/v1/leaderboard/classic?period=daily&limit=100

Response:
{
  "entries": [
    {
      "rank": 1,
      "userId": "abc123",
      "displayName": "Player1",
      "score": 50000,
      "avatarId": "avatar_01"
    }
  ],
  "userEntry": {
    "rank": 1234,
    "score": 15000
  },
  "totalPlayers": 50000
}
```

### 4.3 WebSocket Events (PvP)

```typescript
// Client → Server
interface ClientEvents {
  'match:ready': { matchId: string };
  'match:move': { matchId: string; move: Move };
  'match:word': { matchId: string; word: string; positions: Position[] };
}

// Server → Client
interface ServerEvents {
  'match:start': { matchId: string; grid: string; opponent: PlayerInfo };
  'match:update': { matchId: string; scores: Record<string, number> };
  'match:end': { matchId: string; winner: string; eloChange: number };
  'match:opponent_word': { word: string; score: number };
}
```

---

## 5. Analytics Events

### 5.1 Core Events

```typescript
// Event definitions
interface AnalyticsEvents {
  // Session
  session_start: {};
  session_end: { duration: number };

  // Gameplay
  level_start: { levelId: string; mode: string };
  level_complete: { levelId: string; score: number; stars: number; time: number };
  level_fail: { levelId: string; reason: string };
  word_found: { word: string; length: number; score: number; combo: number };

  // Progression
  level_up: { newLevel: number; xpEarned: number };
  achievement_unlock: { achievementId: string };
  daily_streak: { streakDays: number };

  // Monetization
  iap_impression: { productId: string; context: string };
  iap_purchase: { productId: string; price: number; currency: string };
  ad_impression: { adType: string; placement: string };
  ad_completed: { adType: string; reward: string };

  // Social
  pvp_match_start: { opponentElo: number; userElo: number };
  pvp_match_end: { result: string; eloChange: number };
}
```

### 5.2 Custom Dimensions

| Dimension | Values | Purpose |
|-----------|--------|---------|
| player_segment | whale, dolphin, minnow, free | Revenue analysis |
| engagement_level | high, medium, low, churned | Retention |
| skill_tier | bronze, silver, gold, platinum, diamond | Matchmaking |
| platform | ios, android | Platform analysis |
| acquisition_source | organic, paid, referral | Marketing |

---

## 6. Push Notification System

### 6.1 Notification Types

| Type | Trigger | Content |
|------|---------|---------|
| Daily Challenge | 00:00 UTC | "New daily challenge available!" |
| Streak Reminder | 20:00 local | "Don't lose your {X} day streak!" |
| PvP Turn | Opponent plays | "Your opponent made a move!" |
| Friend Challenge | Friend invite | "{Name} challenged you!" |
| Level Up | Milestone | "Congratulations on reaching level {X}!" |
| Offer | Time-limited | "Special offer expires in {X} hours!" |

### 6.2 Notification Configuration

```typescript
// Firebase Cloud Messaging
const sendNotification = async (
  userId: string,
  notification: Notification
): Promise<void> => {
  const userTokens = await getUserFcmTokens(userId);

  const message = {
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: {
      type: notification.type,
      payload: JSON.stringify(notification.payload)
    },
    tokens: userTokens
  };

  await admin.messaging().sendMulticast(message);
};
```

---

## 7. Rate Limiting & Quotas

### 7.1 API Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| Game Data | 60 requests | 1 minute |
| Leaderboards | 30 requests | 1 minute |
| PvP | 120 requests | 1 minute |
| IAP | 10 requests | 1 minute |

### 7.2 User Quotas

| Resource | Daily Limit | Notes |
|----------|-------------|-------|
| Score Submissions | 500 | Per mode |
| Leaderboard Updates | 100 | Deduplicated |
| Cloud Save | 50 | Batched |
| PvP Matches | 50 | Ranked only |

---

## 8. Error Handling

### 8.1 Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1001 | AUTH_EXPIRED | Token expired |
| 1002 | AUTH_INVALID | Invalid credentials |
| 2001 | SCORE_INVALID | Score validation failed |
| 2002 | SCORE_SUSPICIOUS | Possible cheating |
| 3001 | MATCH_NOT_FOUND | PvP match not found |
| 3002 | MATCH_EXPIRED | Match timed out |
| 4001 | PURCHASE_INVALID | Receipt invalid |
| 4002 | PURCHASE_DUPLICATE | Already processed |
| 5001 | RATE_LIMIT | Too many requests |
| 5002 | QUOTA_EXCEEDED | Daily limit reached |

### 8.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": 2001,
    "name": "SCORE_INVALID",
    "message": "Score validation failed: impossible combo sequence",
    "details": {
      "field": "gameData.combos",
      "reason": "combo_count_exceeded_theoretical_max"
    }
  }
}
```

---

## 9. Monitoring & Alerts

### 9.1 Health Checks

| Service | Check | Interval | Alert Threshold |
|---------|-------|----------|-----------------|
| API Gateway | HTTP 200 | 30s | 3 failures |
| Firestore | Read/Write | 1m | >500ms |
| Cloud Functions | Execution | 1m | Error rate >1% |
| PlayFab | API Response | 1m | >1s latency |

### 9.2 Alerting Rules

| Metric | Threshold | Severity | Action |
|--------|-----------|----------|--------|
| Error Rate | >5% | Critical | Page on-call |
| Latency P99 | >2s | High | Notify team |
| CPU Usage | >80% | Medium | Auto-scale |
| Memory | >90% | High | Alert + investigate |

---

*Generated by BMAD PRD Workflow v1.0*
