# LetterCrush TSD - Technical Requirements

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. Performance Requirements

### 1.1 Runtime Performance

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| Frame Rate | 60 FPS | 30 FPS (low-end) | React Native Profiler |
| Input Latency | <16ms | <33ms | Gesture handler timing |
| Word Validation | <50ms | <100ms | SQLite query time |
| Grid Animation | <500ms | <750ms | Reanimated timing |
| Screen Load | <1s | <2s | Navigation timing |
| Memory Usage | <100MB | <150MB | Expo memory tools |

### 1.2 Startup Performance

| Phase | Target | Activities |
|-------|--------|------------|
| Cold Start | <3s | App launch to home screen |
| Warm Start | <1s | Resume from background |
| Game Load | <1s | Home to gameplay |
| Dictionary Load | <500ms | SQLite dictionary init |

### 1.3 Bundle Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| iOS Bundle | <20MB | Code splitting, asset optimization |
| Android APK | <25MB | Hermes engine, ProGuard |
| JS Bundle | <5MB | Tree shaking, lazy loading |
| Dictionary Data | <2MB per language | SQLite compression |

---

## 2. Platform Requirements

### 2.1 iOS Requirements

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| Minimum iOS | 14.0 | Required for modern APIs |
| Target iOS | Latest stable | Currently 17.x |
| Devices | iPhone 6s+ | A9 chip minimum |
| iPad Support | Universal | Responsive layout |
| Architecture | arm64 | No 32-bit support |
| App Store | Guidelines 5.0+ | Latest compliance |

**iOS-Specific Features:**

| Feature | Implementation |
|---------|----------------|
| App Tracking Transparency | ATT prompt for ads |
| Haptic Feedback | expo-haptics |
| Safe Area | react-native-safe-area-context |
| AdMob | react-native-google-mobile-ads |

### 2.2 Android Requirements

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| Minimum API | 26 (Android 8.0) | Required for AdMob SDK |
| Target API | 34+ | Latest Play Store requirement |
| Architecture | arm64-v8a, armeabi-v7a | Dual ABI |
| Play Store | Guidelines 2024 | Latest compliance |

**Android-Specific Features:**

| Feature | Implementation |
|---------|----------------|
| Hermes Engine | Enabled by default |
| ProGuard | Minification enabled |
| Haptic Feedback | expo-haptics |
| AdMob | react-native-google-mobile-ads |

### 2.3 Device Compatibility

| Category | Requirement | Examples |
|----------|-------------|----------|
| Minimum RAM | 2GB | Budget devices |
| Recommended RAM | 4GB+ | Mid-range+ |
| Screen Resolution | 720p minimum | 1280×720 |
| Screen Density | 160-640 DPI | mdpi to xxxhdpi |
| Aspect Ratios | 16:9 to 21:9 | Standard to tall |
| Notch/Punch-hole | Safe area handling | Dynamic insets |

---

## 3. Technology Stack

### 3.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform framework |
| Expo | 54.0.30 | Development platform |
| TypeScript | 5.3 | Type-safe development |
| Node.js | 18+ | Development runtime |

### 3.2 State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0 | State management |
| expo-sqlite | 16.x | Local database |
| expo-secure-store | Latest | Encrypted storage |
| @react-native-async-storage | Latest | Key-value storage |

### 3.3 UI & Animation

| Technology | Purpose |
|------------|---------|
| react-native-reanimated | Native animations |
| expo-linear-gradient | Gradient backgrounds |
| @expo/vector-icons | Icon library |
| react-native-safe-area-context | Safe area handling |

### 3.4 Ads & Monetization

| Technology | Purpose |
|------------|---------|
| react-native-google-mobile-ads | AdMob integration |
| Interstitial ads | Game over screen |
| Banner ads | (Optional) |

---

## 4. Reliability Requirements

### 4.1 Stability Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash Rate | <0.5% | Expo crash reports |
| ANR Rate | <0.1% | Play Console |
| Session Stability | 99.5% | Analytics |
| Data Persistence | 99.9% | SQLite reliability |

### 4.2 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING MATRIX                     │
│                                                              │
│  Error Type          │ Response           │ User Impact      │
│  ────────────────────┼────────────────────┼─────────────────│
│  SQLite Error        │ Reinit database    │ Seamless         │
│  Dictionary Error    │ Reload dictionary  │ Brief delay      │
│  Ad Load Failure     │ Skip ad            │ Transparent      │
│  State Corruption    │ Reset game state   │ Game restart     │
│  Render Error        │ ErrorBoundary      │ Fallback UI      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Offline Capability

| Feature | Offline Support | Notes |
|---------|-----------------|-------|
| Gameplay | ✅ Full | All game logic local |
| Dictionary | ✅ Full | SQLite database |
| Highscores | ✅ Full | Local SQLite storage |
| Settings | ✅ Full | SecureStore/AsyncStorage |
| Ads | ⚠️ Partial | Skip if unavailable |

---

## 5. Security Requirements

### 5.1 Data Security

| Requirement | Implementation |
|-------------|----------------|
| Sensitive Data | expo-secure-store |
| Language Preference | AsyncStorage |
| Highscores | SQLite (local only) |
| No Cloud Sync | Privacy-first design |

### 5.2 Code Security

| Measure | Implementation |
|---------|----------------|
| Hermes Bytecode | Compiled JS (Android) |
| No API Keys in Code | Environment variables |
| Secure Dependencies | Regular audit |

---

## 6. Quality Attributes

### 6.1 Usability Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Tutorial Completion | >85% | Analytics |
| Onboarding Time | <2 minutes | Session timer |
| First Game Time | <30 seconds | Event tracking |
| Control Responsiveness | <100ms | Gesture timing |

### 6.2 Accessibility Requirements

| Requirement | Implementation | Standard |
|-------------|----------------|----------|
| Color Blind Support | Theme colors | WCAG 2.1 |
| Font Scaling | System settings | Platform native |
| Touch Targets | 44×44pt minimum | Apple HIG |
| Reduced Motion | Reanimated option | WCAG 2.1 |

### 6.3 Localization Requirements

| Requirement | v1.0 | Notes |
|-------------|------|-------|
| Languages | Polish, English | Full dictionary support |
| RTL Support | No | Not required for v1.0 |
| Date/Number Format | Locale-aware | Via React Native |

---

## 7. Testing Requirements

### 7.1 Test Coverage Targets

| Test Type | Coverage Target | Framework |
|-----------|-----------------|-----------|
| Unit Tests | >80% | Jest |
| Integration Tests | >70% | Jest |
| E2E Tests | Critical paths | Detox (optional) |

### 7.2 Testing Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Development | Local testing | Mock |
| Expo Go | Quick preview | Real |
| Simulator/Emulator | Platform testing | Real |
| Device | Final validation | Real |

### 7.3 Quality Gates

| Gate | Criteria | Blocking |
|------|----------|----------|
| TypeScript | No errors | Yes |
| ESLint | No errors | Yes |
| Unit Tests | 100% pass | Yes |
| Build | Successful | Yes |

---

## 8. Build Requirements

### 8.1 Development

| Requirement | Specification |
|-------------|---------------|
| Node.js | 18+ |
| npm/yarn | Latest stable |
| Expo CLI | Latest |
| Xcode | 15+ (iOS builds) |
| Android Studio | Latest (Android builds) |

### 8.2 Build Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator

# Production
npx expo export --platform ios      # iOS bundle
npx expo export --platform android  # Android bundle
eas build --platform ios            # iOS build
eas build --platform android        # Android build

# Testing
npm test                     # Run Jest tests
npm run lint                 # ESLint check
npm run typecheck            # TypeScript check
```

### 8.3 Code Quality Standards

| Standard | Tool | Threshold |
|----------|------|-----------|
| Code Style | ESLint + Prettier | Enforced |
| Type Safety | TypeScript strict | No errors |
| Complexity | ESLint rules | Reasonable |
| Documentation | JSDoc (optional) | Public APIs |

---

## 9. Monitoring Requirements

### 9.1 Application Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Crash Rate | Expo/Sentry | >1% |
| Error Rate | Expo | >2% |
| Load Time | Analytics | >5s |

### 9.2 Business Metrics

| Metric | Tool | Frequency |
|--------|------|-----------|
| Sessions | Analytics | Real-time |
| Retention | Analytics | Daily |
| Ad Revenue | AdMob Console | Real-time |

---

*Updated for LetterCrush React Native + Expo stack*
*Generated by BMAD TSD Workflow v2.0*
