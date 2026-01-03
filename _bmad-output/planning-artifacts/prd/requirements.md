# LetterCrush PRD - Requirements Specification

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Functional Requirements Summary

### 1.1 Core Gameplay (FR-CG)

| ID | Requirement | Priority | Status | Acceptance Criteria |
|----|-------------|----------|--------|---------------------|
| FR-CG-01 | Word validation | P0 | ✅ | <50ms lookup time via SQLite |
| FR-CG-02 | Grid generation | P0 | ✅ | 6×6 grid with language-specific letter weights |
| FR-CG-03 | Word detection | P0 | ✅ | H/V words detected (3+ letters) |
| FR-CG-04 | Cascade animation | P1 | ✅ | <500ms completion via Reanimated |
| FR-CG-05 | Combo detection | P0 | ✅ | Auto-trigger on cascade match |
| FR-CG-06 | Score calculation | P0 | ✅ | Letter values + length + combo multipliers |
| FR-CG-07 | Tap-to-select | P0 | ✅ | Sequential letter selection for word building |
| FR-CG-08 | Combo display | P1 | ✅ | Real-time chain counter |

### 1.2 Game Modes (FR-GM)

| ID | Requirement | Priority | Status | Notes |
|----|-------------|----------|--------|-------|
| FR-GM-01 | Timer Mode (2 min) | P0 | ✅ | Countdown with 3 strikes |
| FR-GM-02 | 3-Strike System | P0 | ✅ | Invalid words add strike |
| FR-GM-03 | Zen Mode | P1 | 📋 | Planned for v2.0 |
| FR-GM-04 | Campaign Mode | P2 | 📋 | Planned for v2.0+ |

### 1.3 Progression & Statistics (FR-PR)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-PR-01 | Highscore tracking | P0 | ✅ |
| FR-PR-02 | Top 10 leaderboard | P0 | ✅ |
| FR-PR-03 | Games played count | P1 | ✅ |
| FR-PR-04 | Average score tracking | P1 | ✅ |
| FR-PR-05 | Best word tracking | P1 | ✅ |
| FR-PR-06 | Best combo tracking | P1 | ✅ |

### 1.4 Monetization (FR-MN)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-MN-01 | Interstitial ads | P0 | ✅ |
| FR-MN-02 | Ad on replay | P0 | ✅ |
| FR-MN-03 | Graceful ad failure | P1 | ✅ |
| FR-MN-04 | Rewarded video ads | P2 | 📋 |
| FR-MN-05 | Remove ads IAP | P2 | 📋 |

---

## 2. Non-Functional Requirements

### 2.1 Performance (NFR-P)

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-P-01 | Frame rate | 60 FPS | React Native Profiler |
| NFR-P-02 | Cold start time | <3 seconds | Expo startup timing |
| NFR-P-03 | Game screen load | <1 second | Navigation timing |
| NFR-P-04 | Memory usage | <100MB RAM | Expo memory tools |
| NFR-P-05 | JS Bundle size | <5MB | Metro bundle analysis |
| NFR-P-06 | Word lookup | <50ms | SQLite query time |
| NFR-P-07 | Animation smoothness | <500ms cascade | Reanimated timing |

### 2.2 Reliability (NFR-R)

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-R-01 | Crash rate | <0.5% | Expo crash reports |
| NFR-R-02 | ANR rate | <0.1% | Play Console |
| NFR-R-03 | Data persistence | 99.9% | SQLite reliability |
| NFR-R-04 | Offline capability | Full gameplay | Manual testing |
| NFR-R-05 | Session stability | 99.5% | Analytics |

### 2.3 Usability (NFR-U)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-U-01 | Tutorial completion | >85% |
| NFR-U-02 | First game time | <30 seconds |
| NFR-U-03 | Localization | Polish, English |
| NFR-U-04 | Font scaling | System settings respected |
| NFR-U-05 | Touch targets | 44×44pt minimum |

### 2.4 Compatibility (NFR-C)

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
| Devices | iPhone 6s and newer (A9+) |
| Architecture | arm64 only |
| App Store | Apple guidelines compliance |
| Haptics | expo-haptics |
| Ads | react-native-google-mobile-ads |

### 3.2 Android Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum API | 26 (Android 8.0) |
| Target API | 34+ (latest stable) |
| Architecture | arm64-v8a, armeabi-v7a |
| Play Store | Google guidelines compliance |
| Hermes Engine | Enabled |
| Ads | react-native-google-mobile-ads |

---

## 4. Dictionary System Requirements

### 4.1 Technical Specifications

| Requirement | Specification |
|-------------|---------------|
| Data storage | SQLite via expo-sqlite |
| Polish dictionary | ~300 words (MVP) |
| English dictionary | ~300 words (MVP) |
| Character set | A-Z (simplified) |
| Offline capable | Yes (full) |
| Lookup time | <50ms |

### 4.2 Language Support

| Language | v1.0 | Post-Launch |
|----------|------|-------------|
| Polish | ✅ | Expand to 10K+ |
| English | ✅ | Expand to 10K+ |
| German | ❌ | Phase 2 |
| Spanish | ❌ | Phase 2 |

### 4.3 Dictionary Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-DIC-01 | Offline word validation | P0 | ✅ |
| FR-DIC-02 | Language-specific letter weights | P0 | ✅ |
| FR-DIC-03 | Language switching | P0 | ✅ |
| FR-DIC-04 | Persistence via Zustand | P0 | ✅ |

---

## 5. Data Storage Requirements

### 5.1 Local Storage

| Data Type | Storage Method | Persistence |
|-----------|----------------|-------------|
| Highscores | SQLite | Permanent |
| Dictionary | SQLite | Permanent |
| Language preference | AsyncStorage + Zustand | Permanent |
| Settings | SecureStore/AsyncStorage | Permanent |
| Game state | Zustand (in-memory) | Session |

### 5.2 Storage Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-ST-01 | SQLite database init | P0 | ✅ |
| FR-ST-02 | Highscore save/load | P0 | ✅ |
| FR-ST-03 | Settings persistence | P0 | ✅ |
| FR-ST-04 | Error recovery | P1 | ✅ |

---

## 6. Offline Capabilities

| Feature | Offline Support | Notes |
|---------|-----------------|-------|
| Timer Mode | ✅ Full | Complete gameplay offline |
| Dictionary | ✅ Full | SQLite database |
| Highscores | ✅ Full | Local SQLite storage |
| Settings | ✅ Full | AsyncStorage/SecureStore |
| Ads | ⚠️ Partial | Skip if unavailable |

---

## 7. Quality Gates

### 7.1 Build Quality

| Gate | Criteria | Blocking |
|------|----------|----------|
| TypeScript | No errors | Yes |
| ESLint | No errors | Yes |
| Build | Successful | Yes |
| Tests | Pass (when implemented) | Yes |

### 7.2 Runtime Quality

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Crash Rate | <0.5% | >1% |
| Error Rate | <2% | >5% |
| Load Time | <3s | >5s |

---

## 8. Requirements Traceability

| Epic | Related Requirements | Status |
|------|---------------------|--------|
| Core Gameplay | FR-CG-01 to FR-CG-08 | ✅ Implemented |
| Game Modes | FR-GM-01 to FR-GM-02 | ✅ Timer Mode |
| Progression | FR-PR-01 to FR-PR-06 | ✅ Implemented |
| Monetization | FR-MN-01 to FR-MN-03 | ✅ Interstitial Ads |
| Dictionary | FR-DIC-01 to FR-DIC-04 | ✅ Implemented |
| Storage | FR-ST-01 to FR-ST-04 | ✅ Implemented |

---

*Updated for LetterCrush React Native + Expo implementation*
*Generated by BMAD PRD Workflow v2.0*
