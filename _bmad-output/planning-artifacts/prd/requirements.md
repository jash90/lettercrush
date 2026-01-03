# WordGrid PRD - Requirements Specification

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Functional Requirements Summary

### 1.1 Core Gameplay (FR-CG)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-CG-01 | Word validation | P0 | <50ms lookup time |
| FR-CG-02 | Grid generation | P0 | Always 3+ valid words |
| FR-CG-03 | Word detection | P0 | All H/V words detected |
| FR-CG-04 | Cascade animation | P1 | <500ms completion |
| FR-CG-05 | Combo detection | P0 | Auto-trigger on cascade |
| FR-CG-06 | Score calculation | P0 | All multipliers applied |
| FR-CG-07 | Power-ups persistence | P1 | Cross-session storage |
| FR-CG-08 | Combo display | P1 | Real-time chain counter |

### 1.2 Game Modes (FR-GM)

| ID | Requirement | Priority | Mode |
|----|-------------|----------|------|
| FR-GM-01 | Classic 2-min timer | P0 | Classic |
| FR-GM-02 | Continue via ad | P1 | Classic |
| FR-GM-03 | Level save | P0 | Campaign |
| FR-GM-04 | Star rating | P1 | Campaign |
| FR-GM-05 | Daily reset 00:00 UTC | P0 | Daily |
| FR-GM-06 | Streak tracking | P0 | Daily |
| FR-GM-07 | Identical grids PvP | P0 | Versus |
| FR-GM-08 | ELO calculation | P0 | Versus |

### 1.3 Progression (FR-PR)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PR-01 | XP accumulation | P0 |
| FR-PR-02 | Level up notification | P1 |
| FR-PR-03 | Unlock availability | P0 |
| FR-PR-04 | Cloud sync | P1 |
| FR-PR-05 | Dictionary recording | P0 |
| FR-PR-06 | Achievement tracking | P0 |
| FR-PR-07 | Leaderboard updates | P1 |

### 1.4 Monetization (FR-MN)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MN-01 | IAP processing | P0 |
| FR-MN-02 | Immediate delivery | P0 |
| FR-MN-03 | Restore purchases | P0 |
| FR-MN-04 | Rewarded ad reward | P0 |
| FR-MN-05 | Ad cooldown | P1 |
| FR-MN-06 | Premium ad-free | P0 |
| FR-MN-07 | Subscription sync | P0 |

---

## 2. Non-Functional Requirements

### 2.1 Performance (NFR-P)

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-P-01 | Frame rate | 60 FPS (30 min on low-end) | FPS counter |
| NFR-P-02 | Cold start time | <3 seconds | Stopwatch |
| NFR-P-03 | Level load time | <1 second | Stopwatch |
| NFR-P-04 | Memory usage | <300MB RAM | Profiler |
| NFR-P-05 | App size | <150MB initial | Store listing |
| NFR-P-06 | Battery drain | <8%/hour | Battery monitor |
| NFR-P-07 | Word lookup | <50ms | Profiler |
| NFR-P-08 | Network timeout | <10 seconds | API monitoring |

### 2.2 Reliability (NFR-R)

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-R-01 | Crash rate | <0.5% | Analytics |
| NFR-R-02 | ANR rate | <0.1% | Play Console |
| NFR-R-03 | Data persistence | 99.9% | User reports |
| NFR-R-04 | Server uptime | 99.9% | Monitoring |
| NFR-R-05 | Offline capability | Campaign + Classic | Manual test |

### 2.3 Security (NFR-S)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-S-01 | Secure API communication | HTTPS only |
| NFR-S-02 | User data encryption | AES-256 at rest |
| NFR-S-03 | Authentication | OAuth 2.0 / Firebase Auth |
| NFR-S-04 | Score validation | Server-side verification |
| NFR-S-05 | Anti-cheat | Heuristic detection |
| NFR-S-06 | GDPR compliance | User data export/delete |

### 2.4 Scalability (NFR-SC)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SC-01 | Concurrent users | 100,000+ |
| NFR-SC-02 | Database queries | <100ms P95 |
| NFR-SC-03 | Leaderboard updates | Real-time for top 1000 |
| NFR-SC-04 | Push notifications | 1M+ per hour |

### 2.5 Usability (NFR-U)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-U-01 | Tutorial completion | >85% |
| NFR-U-02 | Onboarding time | <2 minutes |
| NFR-U-03 | Accessibility | WCAG 2.1 AA |
| NFR-U-04 | Localization | Polish, English |
| NFR-U-05 | Color blind support | Yes |
| NFR-U-06 | Font scaling | System settings respected |

### 2.6 Compatibility (NFR-C)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-C-01 | iOS version | 14.0+ |
| NFR-C-02 | Android version | 8.0+ (API 26) |
| NFR-C-03 | Minimum RAM | 2GB |
| NFR-C-04 | Screen resolution | 720p minimum |
| NFR-C-05 | Aspect ratios | 16:9 to 21:9 |
| NFR-C-06 | Notch/punch-hole | Safe area handling |

---

## 3. Platform Requirements

### 3.1 iOS Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum iOS | 14.0 |
| Devices | iPhone 6s and newer |
| iPad Support | Universal app |
| App Store | Apple guidelines compliance |
| Sign in | Apple Sign In supported |
| Push | APNs integration |
| Payments | StoreKit 2 |

### 3.2 Android Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum API | 26 (Android 8.0) |
| Target API | Latest stable |
| Architecture | arm64-v8a, armeabi-v7a |
| Play Store | Google guidelines compliance |
| Sign in | Google Sign In supported |
| Push | FCM integration |
| Payments | Google Play Billing v5+ |

---

## 4. Dictionary System Requirements

### 4.1 Technical Specifications

| Requirement | Specification |
|-------------|---------------|
| Data structure | Trie for O(m) lookup |
| Polish dictionary | ~200,000 words |
| English dictionary | ~170,000 words |
| Compressed size | ~5MB per language |
| Offline capable | Yes |

### 4.2 Language Support

| Language | v1.0 | Post-Launch |
|----------|------|-------------|
| Polish | ✅ | - |
| English | ✅ | - |
| German | ❌ | Phase 2 |
| Spanish | ❌ | Phase 2 |
| French | ❌ | Phase 2 |

### 4.3 Dictionary Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DIC-01 | Offline word validation | P0 |
| FR-DIC-02 | Language-specific letter distribution | P0 |
| FR-DIC-03 | Dictionary updates via OTA | P1 |
| FR-DIC-04 | Profanity filter | P0 |

---

## 5. Backend Requirements

### 5.1 Cloud Services

| Service | Purpose | Provider Options |
|---------|---------|------------------|
| Authentication | User accounts | Firebase Auth |
| Database | User data, progress | Firestore / Supabase |
| Cloud Save | Game state sync | Firebase / PlayFab |
| Leaderboards | Rankings | PlayFab / Custom |
| Push Notifications | Engagement | FCM / APNs |
| Analytics | Behavior tracking | Firebase / Amplitude |
| A/B Testing | Remote config | Firebase / Split.io |
| Crash Reporting | Stability | Crashlytics |

### 5.2 Backend Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BE-01 | Cloud save sync | P0 |
| FR-BE-02 | Conflict resolution | P1 |
| FR-BE-03 | Daily/weekly leaderboards | P1 |
| FR-BE-04 | PvP matchmaking | P1 |
| FR-BE-05 | Push notification triggers | P1 |
| FR-BE-06 | Remote config updates | P1 |
| FR-BE-07 | Analytics event tracking | P0 |

---

## 6. Offline Capabilities

| Feature | Offline Support | Notes |
|---------|-----------------|-------|
| Campaign Mode | ✅ Full | Queue progress for sync |
| Classic Mode | ✅ Full | Queue scores for sync |
| Daily Challenge | ⚠️ Partial | Cached on app open (24h) |
| PvP Mode | ❌ None | Requires connection |
| Leaderboards | ⚠️ Cached | Read-only offline |
| IAP | ❌ None | Requires connection |
| Achievements | ✅ Full | Queue for sync |

---

## 7. Analytics Requirements

### 7.1 Core Events

| Event | Parameters | Trigger |
|-------|------------|---------|
| `level_start` | level_id, mode | Level begins |
| `level_complete` | level_id, score, stars, time | Level ends |
| `word_found` | word, length, score, combo | Word matched |
| `iap_purchase` | product_id, price, currency | Purchase complete |
| `ad_watched` | ad_type, reward | Ad completes |
| `session_start` | - | App foreground |
| `session_end` | duration | App background |

### 7.2 Retention Tracking

| Metric | Tracked |
|--------|---------|
| D1, D3, D7, D14, D30 | ✅ |
| Session count | ✅ |
| Session length | ✅ |
| Levels per session | ✅ |
| Words per session | ✅ |

---

## 8. Requirements Traceability

| Epic | Related Requirements |
|------|---------------------|
| Core Gameplay | FR-CG-01 to FR-CG-08 |
| Game Modes | FR-GM-01 to FR-GM-08 |
| Progression | FR-PR-01 to FR-PR-07 |
| Monetization | FR-MN-01 to FR-MN-07 |
| Dictionary | FR-DIC-01 to FR-DIC-04 |
| Backend | FR-BE-01 to FR-BE-07 |

---

*Generated by BMAD PRD Workflow v1.0*
