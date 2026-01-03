# LetterCrush UX - Interactions Specification

**Parent Document:** [UX Overview](./overview.md)

---

## 1. Touch Gesture System

### 1.1 Gesture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GESTURE RECOGNITION SYSTEM                      │
│                                                                      │
│  Input Layer (React Native Gesture Handler)                          │
│  ├── Touch Begin → Position capture, tile identification            │
│  ├── Touch End → Selection toggle, action dispatch                  │
│  └── Touch Cancel → State cleanup                                   │
│                                                                      │
│  Recognition Pipeline                                                │
│  1. Raw input capture (<16ms)                                       │
│  2. Tile identification (<8ms)                                      │
│  3. Selection state update (<8ms)                                   │
│  4. Visual feedback (<16ms)                                         │
│  Total: <50ms end-to-end latency                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Gestures

| Gesture | Recognition | Action | Feedback |
|---------|-------------|--------|----------|
| Tap | <200ms, <10px movement | Select/deselect tile | Highlight + haptic |
| Long Press | >500ms hold | Show letter info (optional) | Tooltip |
| Button Tap | Standard | Execute action | Scale + haptic |

### 1.3 Gesture Configuration

```typescript
// React Native Gesture Handler configuration
const gestureConfig = {
  // Tap Detection
  tapMaxDuration: 200, // ms
  tapMaxDistance: 10,  // pixels

  // Touch Response
  feedbackDelay: 0,    // immediate
  hitSlop: 10,         // extends touch area
};
```

---

## 2. Tile Interaction System

### 2.1 Tile Selection

**Selection Flow**:
```
Touch on Tile
    │
    ├── Is tile already selected?
    │       ├── YES → Deselect tile
    │       │         Remove from word builder
    │       │         Update selection order
    │       │
    │       └── NO → Select tile
    │                Add to word builder
    │                Show selection number
    │
    └── Update visual feedback
        Play haptic (if enabled)
```

**Visual States**:

| State | Visual | Implementation |
|-------|--------|----------------|
| Normal | Default appearance | Base GridCell style |
| Selected | Highlighted + number badge | `isSelected` prop |
| Valid word | Green border on submit | Reanimated animation |
| Invalid word | Red flash, shake | Reanimated animation |
| Matched | Fade out, clear | MatchedWordOverlay |

### 2.2 Selection Mechanics

**Tap-to-Select System**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                         TAP-TO-SELECT                                │
│                                                                      │
│  Step 1: Tap letter "S"                                             │
│  ┌───┐                                                              │
│  │ S │ ← Tap here, shows "1" badge                                 │
│  │ 1 │                                                              │
│  └───┘                                                              │
│                                                                      │
│  Step 2: Tap letter "T"                                             │
│  ┌───┐  ┌───┐                                                       │
│  │ S │  │ T │ ← Tap here, shows "2" badge                          │
│  │ 1 │  │ 2 │                                                       │
│  └───┘  └───┘                                                       │
│                                                                      │
│  Step 3: Continue building word...                                  │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐                                        │
│  │ S │  │ T │  │ A │  │ R │                                        │
│  │ 1 │  │ 2 │  │ 3 │  │ 4 │                                        │
│  └───┘  └───┘  └───┘  └───┘                                        │
│                                                                      │
│  Word Builder Display: "STAR"                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Deselection**:
- Tap selected tile to remove from selection
- Selection numbers update automatically
- Word builder updates in real-time

### 2.3 Selection Animation

```typescript
// Using react-native-reanimated
const selectionAnimation = {
  duration: 150, // ms
  easing: Easing.out(Easing.ease),

  selected: {
    scale: 1.05,
    borderColor: '#4CAF50',
    borderWidth: 2,
  },

  deselected: {
    scale: 1.0,
    borderColor: 'transparent',
    borderWidth: 0,
  },
};
```

---

## 3. Word Submission Feedback

### 3.1 Valid Word Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VALID WORD ANIMATION SEQUENCE                     │
│                                                                      │
│  Phase 1: Validation (0-100ms)                                      │
│  ├── Word checked against dictionary                                │
│  └── Success determined                                             │
│                                                                      │
│  Phase 2: Highlight (100-300ms)                                     │
│  ├── Green glow on matched tiles                                    │
│  ├── Score popup appears                                            │
│  └── Success haptic + sound                                         │
│                                                                      │
│  Phase 3: Clear (300-600ms)                                         │
│  ├── Tiles fade/dissolve animation                                  │
│  ├── MatchedWordOverlay shows word                                  │
│  └── Clear sound plays                                              │
│                                                                      │
│  Phase 4: Cascade (600-1200ms)                                      │
│  ├── Remaining tiles fall (gravity)                                 │
│  ├── New tiles spawn from top                                       │
│  └── Check for automatic matches                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Invalid Word Feedback

| Feedback Type | Visual | Audio | Haptic |
|---------------|--------|-------|--------|
| Not in dictionary | Red flash, shake | Error buzz | Medium impact |
| Too short | "3+ letters" message | Warning tone | Light tap |

### 3.3 Score Popup Animation

```typescript
// Score popup configuration
const scorePopupConfig = {
  startPosition: { y: -20 }, // Above matched word
  endPosition: { y: -60 },   // Float up
  duration: 800,             // ms
  fadeOut: true,

  comboColors: [
    '#FFFFFF', // x1 - white
    '#FFD700', // x2 - gold
    '#FF6B00', // x3 - orange
    '#FF0000', // x4 - red
    '#FF00FF', // x5+ - magenta
  ],
};
```

---

## 4. Cascade System

### 4.1 Cascade Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CASCADE SYSTEM                               │
│                                                                      │
│  Word Cleared                                                        │
│       │                                                              │
│       ▼                                                              │
│  Gravity Applied (tiles fall)                                       │
│       │                                                              │
│       ▼                                                              │
│  New Tiles Spawned (drop from top)                                  │
│       │                                                              │
│       ▼                                                              │
│  Check for Auto-Matches                                             │
│       │                                                              │
│       ├── Match Found?                                              │
│       │       ├── YES → Clear + increment combo                     │
│       │       │         Loop back to gravity                        │
│       │       │                                                      │
│       │       └── NO → End cascade                                  │
│       │                Set phase to 'idle'                          │
│       │                Enable input                                 │
│       │                                                              │
│       └── Continue gameplay                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cascade Timing

| Phase | Duration | Animation |
|-------|----------|-----------|
| Tile Clear | 300ms | Fade out + scale down |
| Gravity Fall | 200ms per row | Spring physics |
| New Tile Drop | 300ms | Bounce on landing |
| Match Check | <50ms | Instant |
| Inter-cascade | 100ms | Brief pause |

### 4.3 Combo Display

```
Combo Level 1 (Base)
├── "x1" text (if shown)
└── Normal score colors

Combo Level 2
├── "x2" larger text, gold
├── Score multiplied
└── Enhanced feedback

Combo Level 3+
├── "x3+" emphasized text
├── Screen effects (optional)
└── Celebratory sound
```

---

## 5. Button Interactions

### 5.1 Button States

| State | Visual | Transition |
|-------|--------|------------|
| Normal | Default style | - |
| Pressed | Scale 0.95, darker | Instant |
| Disabled | Grayed, no interaction | - |
| Loading | Spinner overlay | Fade in |

### 5.2 Button Animation (Pressable)

```typescript
// Button press animation
const buttonAnimation = {
  pressedScale: 0.95,
  pressedOpacity: 0.8,
  duration: 100, // ms

  // Using Pressable component
  style: ({ pressed }) => ({
    transform: [{ scale: pressed ? 0.95 : 1 }],
    opacity: pressed ? 0.8 : 1,
  }),
};
```

---

## 6. Haptic Feedback System

### 6.1 Haptic Patterns

| Event | iOS | Android |
|-------|-----|---------|
| Tile Select | Selection (light) | 10ms vibration |
| Valid Word | Impact (medium) | 20ms vibration |
| Invalid Word | Notification (error) | Pattern: 50-50ms |
| Combo | Impact (heavy) | 30ms vibration |
| Button Press | Impact (light) | 10ms vibration |
| Game Over | Notification (warning) | Pattern: 100-100ms |

### 6.2 Haptic Implementation

```typescript
// expo-haptics usage
import * as Haptics from 'expo-haptics';

const haptics = {
  tileSelect: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  validWord: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  invalidWord: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  combo: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
};
```

### 6.3 Haptic Settings

Controlled via `settingsStore`:
- User can enable/disable haptic feedback
- Setting persisted to AsyncStorage

---

## 7. Audio Feedback System

### 7.1 Sound Effects

| Event | Sound | Volume |
|-------|-------|--------|
| Tile Select | Soft click | 0.5 |
| Valid Word (short) | Ding | 0.7 |
| Valid Word (long) | Chime | 0.8 |
| Invalid Word | Buzz | 0.4 |
| Cascade | Rising tone | 0.7 |
| Combo | Power chord | 0.8 |
| Timer Warning | Tick | 0.6 |
| Game Over | End tone | 0.7 |

### 7.2 Audio Settings

Controlled via `settingsStore`:
- User can enable/disable sound effects
- Setting persisted to AsyncStorage

---

## 8. Timer Interactions

### 8.1 Timer Display States

| Time Remaining | Visual | Audio |
|----------------|--------|-------|
| >30s | Normal display | None |
| 30s-10s | Warning color (yellow) | None |
| <10s | Critical color (red) | Tick sound |
| 0s | Game over | End sound |

### 8.2 Timer Animation

```typescript
// Timer warning animation
const timerWarningAnimation = {
  // Pulse effect when critical
  critical: {
    scale: [1, 1.1, 1],
    duration: 500,
    loop: true,
  },

  // Color transitions
  colors: {
    normal: '#FFFFFF',
    warning: '#FFD700',
    critical: '#FF0000',
  },
};
```

---

## 9. Modal Interactions

### 9.1 Modal Presentation

```typescript
// Modal animation configuration
const modalAnimation = {
  // Backdrop fade
  backdropOpacity: 0.5,
  backdropDuration: 200, // ms

  // Content slide up
  contentTranslateY: [300, 0],
  contentDuration: 300, // ms
  contentEasing: Easing.out(Easing.back(1.5)),
};
```

### 9.2 Pause Modal

| Action | Result |
|--------|--------|
| Tap Resume | Close modal, resume timer |
| Tap Home | Navigate to home screen |
| Back gesture | Same as Resume |

### 9.3 Game Over Modal

| Action | Result |
|--------|--------|
| Tap Play Again | Show interstitial ad → Start new game |
| Tap Home | Navigate to home screen |

---

## 10. Performance Considerations

### 10.1 Input Response Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Touch-to-highlight | <16ms | <33ms |
| Selection update | <16ms | <33ms |
| Word validation | <50ms | <100ms |
| Score update | <16ms | <33ms |
| Full cascade | <1500ms | <2000ms |

### 10.2 Animation Optimization

```typescript
// Animation best practices
const animationOptimization = {
  // Use native driver where possible
  useNativeDriver: true,

  // Batch state updates
  batchUpdates: true,

  // Reduce complexity on low-end devices
  reducedMotion: Platform.select({
    ios: UIManager.getConstants().AccessibilityReduceMotion,
    android: false,
  }),
};
```

### 10.3 Reduced Motion Mode

| Normal | Reduced Motion |
|--------|----------------|
| Tile selection animation | Instant selection |
| Score fly animation | Inline update |
| Cascade drop | Fast drop, no bounce |
| Screen transitions | Fade only |

---

## 11. Accessibility

### 11.1 Touch Targets

| Element | Minimum Size |
|---------|--------------|
| Grid tiles | 44×44pt |
| Buttons | 44×44pt |
| Settings toggles | 44×44pt |

### 11.2 Color Accessibility

- High contrast between tiles and background
- Selected state clearly distinguishable
- Error states use multiple cues (color + animation)

---

*Updated for LetterCrush React Native + Expo implementation*
*Generated by BMAD UX Workflow v2.0*
