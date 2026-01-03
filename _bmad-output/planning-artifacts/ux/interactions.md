# WordGrid UX - Interactions Specification

**Parent Document:** [UX Overview](./overview.md)

---

## 1. Touch Gesture System

### 1.1 Gesture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GESTURE RECOGNITION SYSTEM                      │
│                                                                      │
│  Input Layer                                                         │
│  ├── Touch Begin → Position capture, tile identification            │
│  ├── Touch Move → Direction detection, swap preview                 │
│  ├── Touch End → Action execution, animation trigger                │
│  └── Touch Cancel → State reset, cleanup                            │
│                                                                      │
│  Recognition Pipeline                                                │
│  1. Raw input capture (<16ms)                                       │
│  2. Gesture classification (<8ms)                                   │
│  3. Intent validation (<8ms)                                        │
│  4. Action dispatch (<16ms)                                         │
│  Total: <50ms end-to-end latency                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Gestures

| Gesture | Recognition | Action | Feedback |
|---------|-------------|--------|----------|
| Tap | <200ms, <10px movement | Select tile | Highlight + haptic |
| Swipe | >10px, <500ms | Swap tiles | Trail + sound |
| Drag | Hold + move | Drag tile | Shadow + scale |
| Long Press | >500ms hold | Show word hints | Ripple + popup |
| Double Tap | 2 taps <300ms | Activate power-up | Flash + sound |
| Pinch | 2 fingers | Zoom grid (iPad) | Scale animation |

### 1.3 Gesture Parameters

```csharp
public class GestureConfig
{
    // Tap Detection
    public float TapMaxDuration = 0.2f;      // 200ms
    public float TapMaxDistance = 10f;        // 10 pixels

    // Swipe Detection
    public float SwipeMinDistance = 20f;      // 20 pixels
    public float SwipeMaxDuration = 0.5f;     // 500ms
    public float SwipeAngleTolerance = 30f;   // degrees

    // Long Press
    public float LongPressDuration = 0.5f;    // 500ms
    public float LongPressMaxMovement = 5f;   // 5 pixels

    // Double Tap
    public float DoubleTapMaxInterval = 0.3f; // 300ms
    public float DoubleTapMaxDistance = 20f;  // 20 pixels
}
```

---

## 2. Tile Interaction System

### 2.1 Tile Selection

**Selection Flow**:
```
Touch Down
    │
    ├── On Valid Tile?
    │       ├── YES → Highlight tile
    │       │         Play select sound
    │       │         Trigger haptic (light)
    │       │
    │       └── NO → Ignore input
    │
Touch Move
    │
    ├── Distance > Threshold?
    │       ├── YES → Start swap gesture
    │       └── NO → Maintain selection
    │
Touch Up
    │
    └── Process selection or swap
```

**Visual States**:

| State | Visual | Duration |
|-------|--------|----------|
| Normal | Default appearance | - |
| Hover/Select | Glow outline, scale 1.05 | Instant |
| Pressed | Darker, scale 0.95 | While pressed |
| Swapping | Trail effect, position tween | 200ms |
| Invalid | Red flash, shake | 300ms |
| Matched | Green glow, dissolve | 400ms |

### 2.2 Swap Mechanics

**Swap Interaction**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                         SWAP INTERACTION                             │
│                                                                      │
│  Method 1: Swipe                                                     │
│  ┌───┐                ┌───┐                                         │
│  │ A │ ──────────────→│ B │  Swipe from A toward B                  │
│  └───┘                └───┘                                         │
│                                                                      │
│  Method 2: Two-Tap                                                   │
│  ┌───┐                ┌───┐                                         │
│  │ A │ (tap 1)  then  │ B │ (tap 2)  Select A, then tap B           │
│  └───┘                └───┘                                         │
│                                                                      │
│  Method 3: Drag                                                      │
│  ┌───┐    drag    ┌───┐                                             │
│  │ A │ ═══════════│ B │  Drag A onto B position                     │
│  └───┘            └───┘                                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Swap Validation**:

| Check | Condition | Response |
|-------|-----------|----------|
| Adjacency | Tiles must be orthogonally adjacent | Reject non-adjacent |
| Animation | No swap during animation | Queue or reject |
| Frozen | Frozen tile swap attempt | Show frozen indicator |
| Valid Move | Must create word OR Tutorial mode | Allow or reject |

### 2.3 Swap Animation Sequence

```
Frame 0 (0ms)
├── Capture start positions
├── Play swap start sound
└── Trigger swap haptic

Frames 1-12 (0-200ms)
├── Ease-out-back position tween
├── Scale pulse (1.0 → 1.1 → 1.0)
└── Trail particle effect

Frame 12 (200ms)
├── Check for word matches
├── If match: Start match sequence
└── If no match: Animate swap back (200ms)
```

---

## 3. Word Detection Feedback

### 3.1 Word Found Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORD FOUND ANIMATION SEQUENCE                     │
│                                                                      │
│  Phase 1: Highlight (0-200ms)                                       │
│  ├── Green glow on matched tiles                                    │
│  ├── Word text popup appears                                        │
│  └── Success sound plays                                            │
│                                                                      │
│  Phase 2: Score Display (200-600ms)                                 │
│  ├── Score number flies to total                                    │
│  ├── Combo multiplier shows (if applicable)                         │
│  └── Tiles start dissolve animation                                 │
│                                                                      │
│  Phase 3: Clear (600-1000ms)                                        │
│  ├── Tiles particle burst                                           │
│  ├── Empty spaces created                                           │
│  └── Clear sound plays                                              │
│                                                                      │
│  Phase 4: Refill (1000-1500ms)                                      │
│  ├── New tiles drop from top                                        │
│  ├── Bounce on landing                                              │
│  └── Check for cascade matches                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Score Popup Animation

```csharp
public class ScorePopupConfig
{
    // Initial position: Above matched word center
    public Vector2 StartOffset = new Vector2(0, 50);

    // Animation
    public float Duration = 0.8f;
    public float RiseDistance = 100f;
    public AnimationCurve ScaleCurve; // 0→1.2→1.0
    public AnimationCurve AlphaCurve; // 1→1→0

    // Combo styling
    public Color[] ComboColors = {
        Color.white,    // x1
        Color.yellow,   // x2
        Color.orange,   // x3
        Color.red,      // x4
        Color.magenta   // x5+
    };
}
```

### 3.3 Invalid Word Feedback

| Feedback Type | Visual | Audio | Haptic |
|---------------|--------|-------|--------|
| Invalid Swap | Red flash, shake | Error buzz | Medium impact |
| No Word | Tiles return | Soft thud | Light tap |
| Already Used | Ghost highlight | Already sound | None |
| Too Short | Red X, "3+ letters" | Warning | Light |

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
│  Gravity Applied (tiles fall 200ms)                                 │
│       │                                                              │
│       ▼                                                              │
│  New Tiles Spawned (drop from top 300ms)                            │
│       │                                                              │
│       ▼                                                              │
│  Check New Words ◄──────────────────────────────┐                   │
│       │                                          │                   │
│       ├── Words Found?                          │                   │
│       │       │                                 │                   │
│       │       ├── YES → Clear words            │                   │
│       │       │         Increment combo         │                   │
│       │       │         Loop back ──────────────┘                   │
│       │       │                                                      │
│       │       └── NO → End cascade                                  │
│       │                Enable input                                 │
│       │                                                              │
│       └── Animation complete, process next                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cascade Timing

| Phase | Duration | Easing |
|-------|----------|--------|
| Tile Clear | 400ms | Ease-out |
| Gravity Fall | 200ms per row | Ease-in-bounce |
| New Tile Drop | 300ms | Ease-out-bounce |
| Match Check | <50ms | - |
| Inter-cascade | 100ms | Delay |

### 4.3 Combo Display

```
Combo Level 1 (Base)
├── "x1" small text
└── Normal colors

Combo Level 2
├── "x2" medium text, yellow
├── Screen edge glow
└── Intensified sound

Combo Level 3
├── "x3" large text, orange
├── Screen shake (subtle)
└── Epic sound

Combo Level 4+
├── "x4+" huge text, flames
├── Full screen effects
├── Camera zoom pulse
└── Epic fanfare
```

---

## 5. Power-Up Interactions

### 5.1 Power-Up Activation

**Activation Flow**:
```
Tap Power-Up Icon
    │
    ├── Has power-up available?
    │       │
    │       ├── YES → Enter targeting mode
    │       │         Show usage hint
    │       │         Highlight valid targets
    │       │
    │       └── NO → Show purchase prompt
    │                Animate icon shake
    │
Targeting Mode
    │
    ├── Tap valid target → Execute power-up
    │                      Play effect
    │                      Decrement count
    │
    ├── Tap invalid → Show invalid feedback
    │
    └── Tap cancel/outside → Exit targeting mode
```

### 5.2 Power-Up Effects

| Power-Up | Targeting | Effect Animation | Duration |
|----------|-----------|------------------|----------|
| Bomb | Single tile | Explosion particles, radial clear | 600ms |
| Shuffle | None (instant) | All tiles spin and relocate | 800ms |
| Time Boost | None (instant) | Timer flash, +15s counter | 400ms |
| Hint | None (auto) | Word highlight pulse | 2000ms |
| Freeze | None (instant) | Frost overlay, timer stops | 5000ms |

### 5.3 Power-Up Visual States

```
┌─────────────────────────────────────────────────────────────────────┐
│                     POWER-UP BUTTON STATES                           │
│                                                                      │
│  Normal                  Targeting                Cooldown           │
│  ┌────────┐             ┌────────┐              ┌────────┐          │
│  │  💣    │             │  💣    │              │  💣    │          │
│  │  x3    │             │ SELECT │              │  0:05  │          │
│  └────────┘             └────────┘              └────────┘          │
│  Full opacity           Pulsing glow            Grayed + timer      │
│  Badge count            Cancel hint             Countdown overlay   │
│                                                                      │
│  Empty                   Locked                  Promoted            │
│  ┌────────┐             ┌────────┐              ┌────────┐          │
│  │  💣    │             │  🔒    │              │  💣    │          │
│  │  +     │             │ Lv.10  │              │  NEW!  │          │
│  └────────┘             └────────┘              └────────┘          │
│  "+" icon               Lock + level            "NEW" badge         │
│  Tap → Shop             Tap → Info              Glow animation      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Menu Interactions

### 6.1 Button Interactions

**Button States**:

| State | Visual | Transition |
|-------|--------|------------|
| Normal | Default style | - |
| Hover (iPad) | Slight scale, glow | 100ms |
| Pressed | Scale 0.95, darken | Instant |
| Disabled | Grayed, no interaction | - |
| Loading | Spinner overlay | Fade in |

**Button Animation**:
```csharp
public class ButtonConfig
{
    public float PressedScale = 0.95f;
    public float HoverScale = 1.02f;
    public float PressDuration = 0.1f;
    public float ReleaseDuration = 0.15f;
    public Color PressedTint = new Color(0.8f, 0.8f, 0.8f);
}
```

### 6.2 List/Scroll Interactions

| Gesture | Action | Physics |
|---------|--------|---------|
| Vertical Swipe | Scroll | Momentum + bounce |
| Horizontal Swipe | Page/category change | Snap to nearest |
| Pull Down | Refresh (if applicable) | Rubber band |
| Tap Item | Select | Highlight → navigate |

### 6.3 Modal Interactions

**Modal Presentation**:
```
Background → Dim to 50% black (200ms)
Modal → Slide up + scale (300ms, ease-out-back)
Content → Fade in (200ms delay)
```

**Modal Dismissal**:
```
Tap outside → Dismiss
Swipe down → Dismiss (with velocity threshold)
Close button → Dismiss
Back gesture → Dismiss
```

---

## 7. Haptic Feedback System

### 7.1 Haptic Patterns

| Event | iOS (UIFeedbackGenerator) | Android (Vibration) |
|-------|---------------------------|---------------------|
| Tile Select | Selection (light) | 10ms light |
| Valid Swap | Impact (medium) | 20ms medium |
| Invalid Move | Notification (error) | 50ms + 50ms |
| Word Found | Impact (heavy) | 30ms heavy |
| Combo | Notification (success) | Pattern: 20-40-20ms |
| Level Up | Notification (success) × 3 | Pattern: long celebration |
| Button Press | Impact (light) | 10ms light |
| Power-Up | Impact (rigid) | 25ms heavy |

### 7.2 Haptic Settings

```csharp
public enum HapticIntensity
{
    Off = 0,
    Light = 1,    // Only critical feedback
    Medium = 2,   // Standard feedback (default)
    Heavy = 3     // All feedback enhanced
}

public class HapticConfig
{
    public HapticIntensity Intensity = HapticIntensity.Medium;
    public bool EnableInBackground = false;
    public float MinInterval = 0.05f; // Prevent haptic spam
}
```

---

## 8. Audio Feedback System

### 8.1 Sound Effects

| Event | Sound | Volume | Variation |
|-------|-------|--------|-----------|
| Tile Select | Soft click | 0.5 | 3 pitches |
| Tile Swap | Whoosh | 0.6 | Direction-based |
| Invalid Move | Buzz | 0.4 | None |
| Word Found (3-4) | Ding | 0.7 | Note based on length |
| Word Found (5+) | Chime | 0.8 | Chord progression |
| Word Found (7+) | Fanfare | 0.9 | Full melody |
| Cascade | Rising tone | 0.7 | Pitch increases |
| Combo | Power chord | 0.8 | Intensity with level |
| Timer Warning | Tick | 0.6 | Speed increases |
| Game Over | Sad tone | 0.7 | None |
| Level Up | Victory | 1.0 | None |
| Achievement | Unlock chime | 0.9 | None |

### 8.2 Adaptive Audio

```
Game State → Audio Response

Normal Play:
├── Background music: Full
├── SFX: Normal volume
└── Ambient: Enabled

Timer Critical (<15s):
├── Background music: Tense layer added
├── SFX: Slightly louder
└── Heartbeat sound optional

Combo Active:
├── Background music: Intensity layer
├── SFX: Enhanced, reverb
└── Crowd/cheer ambience

Pause:
├── Background music: Low-pass filter
├── SFX: Muted
└── Menu music crossfade
```

---

## 9. Tutorial Interactions

### 9.1 Tutorial Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TUTORIAL SEQUENCE                               │
│                                                                      │
│  Step 1: Welcome                                                     │
│  ├── "Welcome to WordGrid!"                                         │
│  ├── Tap anywhere to continue                                       │
│  └── Highlight: None                                                │
│                                                                      │
│  Step 2: The Grid                                                    │
│  ├── "This is your letter grid"                                     │
│  ├── Grid highlight pulse                                           │
│  └── Tap to continue                                                │
│                                                                      │
│  Step 3: First Swap                                                  │
│  ├── "Swap letters to form words"                                   │
│  ├── Arrow showing swap direction                                   │
│  ├── Only allow guided swap                                         │
│  └── Auto-continue on success                                       │
│                                                                      │
│  Step 4: Word Detection                                              │
│  ├── "Great! You formed [WORD]!"                                    │
│  ├── Word highlight                                                 │
│  └── Score explanation                                              │
│                                                                      │
│  Step 5: Power-Ups                                                   │
│  ├── "Use power-ups to help"                                        │
│  ├── Power-up bar highlight                                         │
│  └── Free power-up to try                                           │
│                                                                      │
│  Step 6: Goal                                                        │
│  ├── "Find as many words as possible!"                              │
│  ├── Timer explanation                                              │
│  └── "Tap PLAY to start!"                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Tutorial Overlay

| Element | Style | Interaction |
|---------|-------|-------------|
| Spotlight | Circular mask on target | Pass-through to target |
| Overlay | 70% black | Blocks non-target taps |
| Tooltip | Rounded card with arrow | Position auto-adjusts |
| Hand Icon | Animated pointing/swiping | Loops until action taken |
| Skip Button | Top-right, subtle | Confirm before skip |

### 9.3 Contextual Hints

| Trigger | Hint | Display |
|---------|------|---------|
| No move 10s | "Hint: Swap adjacent tiles" | Subtle tooltip |
| Low score | "Try longer words for more points" | Between games |
| Unused power-up | "Don't forget your power-ups!" | Glow on icon |
| Streak at risk | "Play daily to keep your streak!" | Push notification |

---

## 10. Performance Considerations

### 10.1 Input Response Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Touch-to-highlight | <16ms | <33ms |
| Swap animation start | <50ms | <100ms |
| Word validation | <50ms | <100ms |
| Score update | <16ms | <33ms |
| Full cascade | <2000ms | <3000ms |

### 10.2 Animation Optimization

```csharp
public class AnimationOptimization
{
    // Use object pooling for frequently created objects
    public bool UsePooling = true;

    // Batch similar animations
    public bool BatchAnimations = true;

    // Reduce particle count on low-end devices
    public float ParticleMultiplier = 1.0f; // 0.5 for low-end

    // Skip non-essential animations if frame drop detected
    public bool AdaptiveQuality = true;

    // Pre-warm animations during loading
    public bool PrewarmAnimations = true;
}
```

### 10.3 Reduced Motion Mode

| Normal | Reduced Motion |
|--------|----------------|
| Tile swap animation | Instant swap |
| Score fly animation | Inline update |
| Cascade drop | Fast drop, no bounce |
| Particle effects | Disabled |
| Screen transitions | Fade only |
| Background motion | Static |

---

*Generated by BMAD PRD Workflow v1.0*
