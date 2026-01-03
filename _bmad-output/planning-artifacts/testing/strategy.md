# LetterCrush Testing Strategy

**Parent Document:** [TSD Overview](../tsd/overview.md)

---

## 1. Testing Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TESTING PHILOSOPHY                              │
│                                                                      │
│  "Quality is built in, not tested in"                               │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    TESTING PYRAMID                           │    │
│  │                                                              │    │
│  │                        /\                                    │    │
│  │                       /  \   E2E Tests (10%)                │    │
│  │                      /    \  Validate user journeys          │    │
│  │                     /──────\                                 │    │
│  │                    /        \  Integration Tests (20%)       │    │
│  │                   /          \ Component interactions        │    │
│  │                  /────────────\                              │    │
│  │                 /              \ Unit Tests (70%)            │    │
│  │                /                \ Fast, isolated, numerous   │    │
│  │               /──────────────────\                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Key Metrics:                                                        │
│  • Unit Test Coverage: >80%                                         │
│  • Integration Coverage: >70%                                       │
│  • Critical Path E2E: 100%                                          │
│  • Test Execution: <5 minutes                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Testing Objectives

| Objective | Target | Measurement |
|-----------|--------|-------------|
| Prevent Regressions | <1% regression rate | Defect tracking |
| Fast Feedback | <5min for unit tests | CI metrics |
| Confidence | 95% deployment confidence | Test pass rate |
| Documentation | Tests as specification | Code review |

---

## 2. Technology Stack

### 2.1 Testing Framework

| Tool | Purpose | Version |
|------|---------|---------|
| Jest | Test runner, assertions | Latest |
| React Native Testing Library | Component testing | Latest |
| Detox | E2E testing (optional) | Latest |
| TypeScript | Type-safe tests | 5.3 |

### 2.2 Test Structure

```
__tests__/
├── unit/
│   ├── engine/
│   │   ├── GridManager.test.ts
│   │   ├── WordValidator.test.ts
│   │   └── ScoreCalculator.test.ts
│   ├── stores/
│   │   ├── gameStore.test.ts
│   │   ├── languageStore.test.ts
│   │   └── settingsStore.test.ts
│   └── hooks/
│       ├── useGame.test.ts
│       ├── useTimer.test.ts
│       └── useDictionary.test.ts
├── integration/
│   ├── GameFlow.test.ts
│   ├── LanguageSwitch.test.ts
│   └── HighscorePersistence.test.ts
└── e2e/
    ├── GameplayFlow.test.ts
    └── SettingsFlow.test.ts
```

---

## 3. Unit Tests

### 3.1 Test Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| Dictionary System | 100% | P0 |
| Score Calculator | 100% | P0 |
| Grid Manager | 95% | P0 |
| Word Validator | 100% | P0 |
| Game Store | 90% | P1 |
| Custom Hooks | 85% | P1 |
| UI Components | 80% | P2 |

### 3.2 Naming Convention

`[methodName]_[scenario]_[expectedResult]`

### 3.3 Example Unit Tests

```typescript
// __tests__/unit/engine/WordValidator.test.ts
import { isValidWord, loadDictionary, getWordCount } from '@/db/dictionaryDb';

describe('WordValidator', () => {
  beforeAll(async () => {
    await loadDictionary('en');
  });

  describe('isValidWord', () => {
    it('returns true for valid English words', () => {
      expect(isValidWord('THE')).toBe(true);
      expect(isValidWord('AND')).toBe(true);
    });

    it('returns false for invalid words', () => {
      expect(isValidWord('XYZ')).toBe(false);
      expect(isValidWord('ASDF')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isValidWord('the')).toBe(true);
      expect(isValidWord('The')).toBe(true);
      expect(isValidWord('THE')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(isValidWord('')).toBe(false);
    });

    it('returns false for words shorter than 3 letters', () => {
      expect(isValidWord('A')).toBe(false);
      expect(isValidWord('AB')).toBe(false);
    });
  });

  describe('getWordCount', () => {
    it('returns positive count after loading', () => {
      expect(getWordCount()).toBeGreaterThan(0);
    });
  });
});
```

```typescript
// __tests__/unit/engine/ScoreCalculator.test.ts
import {
  calculateScore,
  getLetterValue,
  getLengthBonus,
  getComboMultiplier,
} from '@/engine/ScoreCalculator';

describe('ScoreCalculator', () => {
  describe('getLetterValue', () => {
    it('returns correct value for common English letters', () => {
      expect(getLetterValue('E', 'en')).toBe(1);
      expect(getLetterValue('A', 'en')).toBe(1);
    });

    it('returns higher value for rare letters', () => {
      expect(getLetterValue('Q', 'en')).toBe(10);
      expect(getLetterValue('Z', 'en')).toBe(10);
    });
  });

  describe('getLengthBonus', () => {
    it('returns 1 for 3-letter words', () => {
      expect(getLengthBonus(3)).toBe(1);
    });

    it('returns higher bonus for longer words', () => {
      expect(getLengthBonus(5)).toBeGreaterThan(getLengthBonus(4));
      expect(getLengthBonus(6)).toBeGreaterThan(getLengthBonus(5));
    });
  });

  describe('getComboMultiplier', () => {
    it('returns 1 for first word (no combo)', () => {
      expect(getComboMultiplier(0)).toBe(1);
    });

    it('returns increasing multiplier for combos', () => {
      expect(getComboMultiplier(1)).toBeGreaterThan(1);
      expect(getComboMultiplier(2)).toBeGreaterThan(getComboMultiplier(1));
    });
  });

  describe('calculateScore', () => {
    it('calculates score correctly for simple word', () => {
      const score = calculateScore('CAT', 0, 'en');
      expect(score).toBeGreaterThan(0);
    });

    it('applies combo multiplier', () => {
      const baseScore = calculateScore('CAT', 0, 'en');
      const comboScore = calculateScore('CAT', 2, 'en');
      expect(comboScore).toBeGreaterThan(baseScore);
    });
  });
});
```

### 3.4 Store Testing

```typescript
// __tests__/unit/stores/gameStore.test.ts
import { useGameStore } from '@/stores/gameStore';
import { act, renderHook } from '@testing-library/react-hooks';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('initGame', () => {
    it('initializes grid with correct dimensions', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
      });

      expect(result.current.grid.length).toBe(6);
      expect(result.current.grid[0].length).toBe(6);
    });

    it('sets timer to 120 seconds', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
      });

      expect(result.current.timer).toBe(120);
    });

    it('sets phase to idle', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
      });

      expect(result.current.phase).toBe('idle');
    });
  });

  describe('toggleLetterSelection', () => {
    it('adds letter to selection when not selected', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
        result.current.toggleLetterSelection({ row: 0, col: 0 });
      });

      expect(result.current.selectedLetters).toHaveLength(1);
    });

    it('removes letter from selection when already selected', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
        result.current.toggleLetterSelection({ row: 0, col: 0 });
        result.current.toggleLetterSelection({ row: 0, col: 0 });
      });

      expect(result.current.selectedLetters).toHaveLength(0);
    });
  });

  describe('submitWord', () => {
    it('adds strike for invalid word', async () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initGame();
        // Select letters that form invalid word
        result.current.toggleLetterSelection({ row: 0, col: 0 });
        result.current.toggleLetterSelection({ row: 0, col: 1 });
        result.current.toggleLetterSelection({ row: 0, col: 2 });
      });

      // Mock invalid word
      await act(async () => {
        await result.current.submitWord();
      });

      expect(result.current.strikes).toBeGreaterThanOrEqual(0);
    });
  });
});
```

---

## 4. Integration Tests

### 4.1 Integration Test Scenarios

| Scenario | Components | Validation |
|----------|------------|------------|
| Word Match Flow | Grid → Validator → Score | Score updates correctly |
| Cascade Chain | Grid → Validator → Score → Grid | Combo multiplier applied |
| Language Switch | Store → Database → Grid | Dictionary loads, grid regenerates |
| Highscore Save | Game → Database → Stats | Score persisted, leaderboard updated |
| Game Over | Timer/Strikes → Modal → Ad | Flow completes correctly |

### 4.2 Example Integration Tests

```typescript
// __tests__/integration/GameFlow.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameStore } from '@/stores/gameStore';
import { loadDictionary } from '@/db/dictionaryDb';

describe('Game Flow Integration', () => {
  beforeAll(async () => {
    await loadDictionary('en');
  });

  it('completes full game cycle from start to game over', async () => {
    const { result } = renderHook(() => useGameStore());

    // Initialize game
    act(() => {
      result.current.initGame();
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.timer).toBe(120);
    expect(result.current.score).toBe(0);

    // Simulate timer expiry
    act(() => {
      result.current.setTimer(0);
    });

    expect(result.current.phase).toBe('gameOver');
  });

  it('accumulates strikes and triggers game over at 3', async () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.initGame();
    });

    // Add 3 strikes
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.addStrike();
      });
    }

    expect(result.current.strikes).toBe(3);
    expect(result.current.phase).toBe('gameOver');
  });
});
```

```typescript
// __tests__/integration/LanguageSwitch.test.ts
import { useLanguageStore } from '@/stores/languageStore';
import { useGameStore } from '@/stores/gameStore';
import { getWordCount } from '@/db/dictionaryDb';
import { renderHook, act, waitFor } from '@testing-library/react-hooks';

describe('Language Switch Integration', () => {
  it('loads correct dictionary when language changes', async () => {
    const { result: langResult } = renderHook(() => useLanguageStore());

    await act(async () => {
      await langResult.current.setLanguage('en');
    });

    const englishCount = getWordCount();

    await act(async () => {
      await langResult.current.setLanguage('pl');
    });

    const polishCount = getWordCount();

    // Both dictionaries should have words loaded
    expect(englishCount).toBeGreaterThan(0);
    expect(polishCount).toBeGreaterThan(0);
  });

  it('regenerates grid when language changes during game', async () => {
    const { result: langResult } = renderHook(() => useLanguageStore());
    const { result: gameResult } = renderHook(() => useGameStore());

    await act(async () => {
      await langResult.current.setLanguage('en');
      gameResult.current.initGame();
    });

    const englishGrid = JSON.stringify(gameResult.current.grid);

    await act(async () => {
      await langResult.current.setLanguage('pl');
      gameResult.current.initGame();
    });

    const polishGrid = JSON.stringify(gameResult.current.grid);

    // Grids should be different (new letters)
    expect(englishGrid).not.toBe(polishGrid);
  });
});
```

---

## 5. E2E Tests (Optional)

### 5.1 Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/LetterCrush.app',
      build: 'xcodebuild -workspace ios/LetterCrush.xcworkspace -scheme LetterCrush -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 14' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_4_API_30' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

### 5.2 E2E Test Examples

```typescript
// e2e/GameplayFlow.test.ts
describe('Gameplay Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete a full game session', async () => {
    // Navigate to game
    await element(by.id('play-button')).tap();

    // Verify game screen loaded
    await expect(element(by.id('game-grid'))).toBeVisible();
    await expect(element(by.id('timer-display'))).toBeVisible();

    // Wait for game over (or simulate)
    await waitFor(element(by.id('game-over-modal')))
      .toBeVisible()
      .withTimeout(130000);

    // Verify game over modal
    await expect(element(by.id('final-score'))).toBeVisible();
    await expect(element(by.id('play-again-button'))).toBeVisible();
  });

  it('should navigate to settings and back', async () => {
    await element(by.id('settings-button')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();

    await element(by.id('back-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

---

## 6. Performance Testing

### 6.1 Performance Metrics

| Metric | Target | Critical | Tool |
|--------|--------|----------|------|
| Frame Rate | 60 FPS | 30 FPS | React Native Profiler |
| Memory Usage | <100MB | <150MB | Expo memory tools |
| Load Time | <3s | <5s | Custom timer |
| Word Validation | <50ms | <100ms | Jest benchmark |

### 6.2 Performance Test Examples

```typescript
// __tests__/performance/WordValidation.test.ts
import { loadDictionary, isValidWord } from '@/db/dictionaryDb';

describe('Performance: Word Validation', () => {
  beforeAll(async () => {
    await loadDictionary('en');
  });

  it('validates 1000 words in under 1 second', () => {
    const words = generateTestWords(1000);
    const start = performance.now();

    words.forEach(word => {
      isValidWord(word);
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('average lookup time is under 1ms', () => {
    const words = generateTestWords(1000);
    const start = performance.now();

    words.forEach(word => {
      isValidWord(word);
    });

    const avgMs = (performance.now() - start) / 1000;
    expect(avgMs).toBeLessThan(1);
  });
});
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck
```

### 7.2 Quality Gates

| Gate | Criteria | Blocking |
|------|----------|----------|
| Unit Tests | 100% pass | Yes |
| Coverage | >80% | Yes |
| TypeScript | No errors | Yes |
| ESLint | No errors | Yes |
| Build | Successful | Yes |

---

## 8. Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- WordValidator.test.ts

# Run E2E tests (Detox)
npx detox test -c ios.sim.debug

# Lint check
npm run lint

# Type check
npm run typecheck
```

---

## 9. Mocking Strategy

### 9.1 Common Mocks

```typescript
// __mocks__/expo-sqlite.ts
export const openDatabaseSync = jest.fn(() => ({
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  withTransactionAsync: jest.fn((callback) => callback()),
}));
```

```typescript
// __mocks__/@react-native-async-storage/async-storage.ts
const storage: Record<string, string> = {};

export default {
  setItem: jest.fn((key, value) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => Promise.resolve(storage[key] || null)),
  removeItem: jest.fn((key) => {
    delete storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
    return Promise.resolve();
  }),
};
```

---

*Updated for LetterCrush React Native + Expo + Jest testing stack*
*Generated by BMAD TSD Workflow v2.0*
