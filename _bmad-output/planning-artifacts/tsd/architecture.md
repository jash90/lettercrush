# LetterCrush TSD - System Architecture

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │   iOS App   │  │ Android App │  │   React Native + Expo Core  │ │
│  │  (Native)   │  │  (Native)   │  │       (TypeScript)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────────┬──────────────┘ │
│         └────────────────┼─────────────────────────┘               │
│                          ▼                                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    GAME ENGINE LAYER                          │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│  │  │  Grid   │ │  Word   │ │  Score  │ │ Cascade │ │  Game   │ │ │
│  │  │ Manager │ │Validator│ │Calculator│ │ Handler │ │  Store  │ │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   SQLite    │  │    Zustand  │  │  Ad Service │                 │
│  │  (expo-sql) │  │   (State)   │  │ (Google Ads)│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Dictionary │  │  Highscore  │  │   Settings  │                 │
│  │    (SQLite) │  │   (SQLite)  │  │(SecureStore)│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React Native + Expo | Cross-platform, TypeScript, rapid development |
| State Management | Zustand | Lightweight, TypeScript-first, minimal boilerplate |
| Database | expo-sqlite | Local persistence, dictionary storage |
| Navigation | expo-router | File-based routing, deep linking |
| Animations | react-native-reanimated | Native performance, 60fps animations |
| Ads | react-native-google-mobile-ads | AdMob integration, interstitials |
| Haptics | expo-haptics | Native haptic feedback |

---

## 2. Component Architecture

### 2.1 Application Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APP SCREENS (expo-router)                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  Home   │ │  Game   │ │Settings │ │  Stats  │ │Tutorial │      │
│  │ index   │ │  game   │ │settings │ │  stats  │ │tutorial │      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
│       └───────────┴───────────┴───────────┴───────────┘            │
│                               │                                      │
│                         _layout.tsx                                  │
│                    (Root navigation, init)                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                               │
│                                                                      │
│  src/components/                                                     │
│  ├── Grid/              [Game board display]                        │
│  │   ├── Grid.tsx       (6x6 tile layout)                          │
│  │   └── Tile.tsx       (Individual letter tile)                   │
│  ├── WordBuilder/       [Word input interface]                      │
│  │   ├── CurrentWord.tsx                                            │
│  │   └── ActionButtons.tsx                                          │
│  ├── Score/             [Score display]                             │
│  │   └── ScoreDisplay.tsx                                           │
│  ├── MatchedWordOverlay/ [Match effects]                            │
│  │   ├── MatchedWordOverlay.tsx                                     │
│  │   ├── WordPopup.tsx                                              │
│  │   └── Sparkle.tsx                                                │
│  ├── modals/            [Modal dialogs]                             │
│  │   ├── GameOverModal/                                             │
│  │   └── PauseModal/                                                │
│  ├── settings/          [Settings components]                       │
│  │   ├── SettingsSection.tsx                                        │
│  │   └── LanguageOption.tsx                                         │
│  ├── stats/             [Statistics components]                     │
│  │   ├── StatCard.tsx                                               │
│  │   └── LeaderboardRow.tsx                                         │
│  ├── tutorial/          [Tutorial components]                       │
│  │   ├── TutorialSection.tsx                                        │
│  │   ├── StepItem.tsx                                               │
│  │   ├── TipItem.tsx                                                │
│  │   └── ScoreRow.tsx                                               │
│  └── ui/                [Reusable UI]                               │
│      ├── Button.tsx                                                 │
│      └── MenuButton.tsx                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Game Engine Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                     GAME STORE (Zustand)                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Game Phases                               ││
│  │  ┌────┐   ┌─────────┐   ┌──────────┐   ┌─────────┐         ││
│  │  │idle│ → │selecting│ → │validating│ → │matching │         ││
│  │  └────┘   └─────────┘   └──────────┘   └─────────┘         ││
│  │    ↑                                         │               ││
│  │    │      ┌──────────┐   ┌─────────┐        ↓               ││
│  │    └──────│refilling │ ← │cascading│ ←──────┘               ││
│  │           └──────────┘   └─────────┘                        ││
│  │                            ↓                                 ││
│  │                      ┌──────────┐                           ││
│  │                      │ gameOver │                           ││
│  │                      └──────────┘                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ GridManager │ │WordValidator│ │ScoreCalculat│ │  Hooks      │
│  (engine/)  │ │  (engine/)  │ │  (engine/)  │ │  (hooks/)   │
│             │ │             │ │             │ │             │
│ - grid[][]  │ │ - lookup()  │ │ - letterVal │ │ - useGame() │
│ - swap()    │ │ - validate()│ │ - calculate()│ │ - useTimer()│
│ - refill()  │ │ - loadLang()│ │ - combo()   │ │ - useDict() │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 2.3 Grid Manager

```typescript
// src/engine/GridManager.ts
export class GridManager {
  // Configuration
  readonly gridSize = 6;

  // Core Methods
  createGrid(language: Language): Tile[][];
  swapTiles(from: Position, to: Position): boolean;
  findValidWords(grid: Tile[][]): WordMatch[];
  clearMatches(matches: WordMatch[]): void;
  applyGravity(): Tile[][];
  refillGrid(): Tile[][];

  // Helpers
  getAdjacentPositions(pos: Position): Position[];
  hasValidMoves(grid: Tile[][]): boolean;
}
```

### 2.4 Word Validator

```typescript
// src/engine/WordValidator.ts
export class WordValidator {
  // Performance target: <50ms lookup
  async loadDictionary(language: Language): Promise<void>;
  isValidWord(word: string): boolean;
  getWordCount(): number;

  // Database integration
  private db: SQLiteDatabase;
}
```

### 2.5 Score Calculator

```typescript
// src/engine/ScoreCalculator.ts
// Formula: Σ(letter_values) × lengthBonus × comboMultiplier

export function calculateScore(word: string, combo: number): number;
export function getLetterValue(letter: string, language: Language): number;
export function getLengthBonus(length: number): number;
export function getComboMultiplier(combo: number): number;
```

---

## 3. State Architecture

### 3.1 Zustand Stores

```typescript
// src/stores/gameStore.ts
interface GameState {
  // Grid state
  grid: Tile[][];
  phase: GamePhase;

  // Score & progress
  score: number;
  moves: number;
  combo: number;

  // Timer mode
  timer: number;
  strikes: number;

  // Selection
  selectedLetters: Position[];
  currentWord: string;
  matchedWords: WordMatch[];

  // Actions
  initGame: (config: GameConfig) => void;
  toggleLetterSelection: (pos: Position) => void;
  submitWord: () => Promise<boolean>;
  clearSelection: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
}

// src/stores/languageStore.ts
interface LanguageState {
  language: Language; // 'en' | 'pl'
  isFirstRun: boolean;
  setLanguage: (lang: Language) => void;
  completeFirstRun: () => void;
}

// src/stores/settingsStore.ts
interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  toggleSound: () => void;
  toggleHaptic: () => void;
}
```

### 3.2 Custom Hooks

```
src/hooks/
├── useGame.ts          [Main game loop orchestration]
├── useGameInit.ts      [Game initialization and reset]
├── useGameActions.ts   [Letter selection, word submission]
├── useDictionary.ts    [Dictionary loading by language]
├── useTimer.ts         [Countdown timer logic]
├── useScoreCountUp.ts  [Animated score counter]
├── useStarRating.ts    [Star rating calculation]
└── useInterstitialAd.ts [Ad management]
```

---

## 4. Data Architecture

### 4.1 SQLite Database Schema

```sql
-- Dictionary tables (per language)
CREATE TABLE dictionary_en (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  length INTEGER NOT NULL
);

CREATE TABLE dictionary_pl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  length INTEGER NOT NULL
);

-- Highscores table
CREATE TABLE highscores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  words_found INTEGER NOT NULL,
  best_word TEXT,
  longest_word TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_dict_en_word ON dictionary_en(word);
CREATE INDEX idx_dict_pl_word ON dictionary_pl(word);
CREATE INDEX idx_highscores_score ON highscores(score DESC);
```

### 4.2 Database Layer

```typescript
// src/db/database.ts
export async function initDatabase(): Promise<SQLiteDatabase>;
export async function closeDatabase(): Promise<void>;

// src/db/dictionaryDb.ts
export async function loadDictionary(lang: Language): Promise<void>;
export function isValidWord(word: string): boolean;
export function getWordCount(): number;

// src/db/highscoreDb.ts
export async function saveHighscore(entry: HighScoreEntry): Promise<void>;
export function getTopHighscores(limit: number): HighScoreEntry[];
export function getHighestScore(): number;
export function getTotalGamesPlayed(): number;
export function getAverageScore(): number;
export async function clearHighscores(): Promise<void>;
```

---

## 5. Technology Stack

### 5.1 Client Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | React Native | 0.81.5 | Cross-platform mobile |
| Platform | Expo | 54.0.30 | Development toolchain |
| Language | TypeScript | 5.3 | Type-safe development |
| State | Zustand | 5.0 | Lightweight state management |
| Navigation | expo-router | 6.0.21 | File-based routing |
| Animation | react-native-reanimated | 3.x | Native animations |
| Database | expo-sqlite | 16.x | Local persistence |

### 5.2 Additional Dependencies

| Package | Purpose |
|---------|---------|
| @expo/vector-icons | Icon library |
| expo-haptics | Haptic feedback |
| expo-linear-gradient | Background gradients |
| expo-secure-store | Encrypted storage |
| react-native-google-mobile-ads | AdMob integration |
| react-native-safe-area-context | Safe area handling |

---

## 6. Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                          │
│                                                              │
│  Types (No dependencies)                                     │
│  └── src/types/game.types.ts                                │
│                                                              │
│  Theme (No dependencies)                                     │
│  └── src/theme/colors.ts, spacing.ts                        │
│                                                              │
│  Database Layer (Types)                                      │
│  └── src/db/database.ts, dictionaryDb.ts, highscoreDb.ts   │
│                                                              │
│  Engine Layer (Types, Database)                              │
│  ├── GridManager.ts                                         │
│  ├── WordValidator.ts                                       │
│  └── ScoreCalculator.ts                                     │
│                                                              │
│  Stores (Types, Engine)                                      │
│  ├── gameStore.ts                                           │
│  ├── languageStore.ts                                       │
│  └── settingsStore.ts                                       │
│                                                              │
│  Hooks (Stores, Engine, Database)                            │
│  └── useGame.ts, useDictionary.ts, useTimer.ts, etc.       │
│                                                              │
│  Components (Hooks, Stores, Theme)                           │
│  └── Grid/, WordBuilder/, Score/, modals/, etc.            │
│                                                              │
│  Screens (Components, Hooks)                                 │
│  └── app/index.tsx, game.tsx, settings.tsx, etc.           │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Services

### 7.1 Ad Service

```typescript
// src/services/AdService.ts
export const AdService = {
  initialize(): Promise<void>;
  loadInterstitial(): Promise<void>;
  showInterstitial(): Promise<boolean>;
  isInterstitialReady(): boolean;
};

// Configuration: src/config/adConfig.ts
export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-xxx/banner',
  interstitial: 'ca-app-pub-xxx/interstitial',
};
```

### 7.2 Dictionary Seeder

```typescript
// src/services/dictionarySeeder.ts
export async function seedDictionary(
  db: SQLiteDatabase,
  language: Language
): Promise<void>;
```

---

## 8. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Cold start | <3s | Lazy loading, code splitting |
| Word validation | <50ms | SQLite indexes, in-memory cache |
| Tile animation | 60fps | react-native-reanimated, native driver |
| Grid refill | <200ms | Optimized cascade algorithm |
| Memory usage | <100MB | Efficient state updates |

---

## 9. Platform Support

| Platform | Minimum Version | Notes |
|----------|-----------------|-------|
| iOS | 14.0+ | Required for modern APIs |
| Android | API 26 (8.0)+ | Required for AdMob SDK |

---

*Updated for LetterCrush React Native + Expo architecture*
*Generated by BMAD TSD Workflow v2.0*
