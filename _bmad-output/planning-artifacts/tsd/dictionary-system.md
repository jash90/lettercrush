# LetterCrush TSD - Dictionary System

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. Overview

The Dictionary System is a critical performance component responsible for word validation, providing sub-50ms lookup times using SQLite database storage.

### 1.1 System Requirements

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| Lookup Time | <50ms | Responsive UX |
| Memory Footprint | <5MB per language | Mobile constraints |
| Offline Support | Full functionality | Core requirement |
| Load Time | <500ms | Fast startup |
| Languages v1.0 | Polish, English | Market priority |

### 1.2 Implementation Status (v1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Language Selection UI | ✅ Implemented | Settings + onboarding screens |
| Language Persistence | ✅ Implemented | Zustand + AsyncStorage |
| Polish Dictionary | ✅ Implemented | ~300 words (MVP) |
| English Dictionary | ✅ Implemented | ~300 words (MVP) |
| Language-aware Grid | ✅ Implemented | Letter weights per language |
| Dynamic Switching | ✅ Implemented | Reloads dictionary on change |

### 1.3 Implementation Files

```
src/
├── db/
│   ├── database.ts          # SQLite initialization
│   ├── dictionaryDb.ts      # Dictionary operations
│   ├── highscoreDb.ts       # Highscore operations
│   └── platform.ts          # Platform detection
├── stores/
│   └── languageStore.ts     # Zustand language store
├── services/
│   └── dictionarySeeder.ts  # Dictionary data seeding
├── dictonary/               # Word list data
│   ├── eng/index.ts         # English words
│   └── pl/index.ts          # Polish words
└── types/
    └── game.types.ts        # Language type, letter weights
```

### 1.4 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 DICTIONARY SYSTEM                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Language Store (Zustand)                 ││
│  │  - Current language (en | pl)                           ││
│  │  - First run detection                                  ││
│  │  - Persistence via AsyncStorage                         ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   SQLite    │ │  Dictionary │ │   Letter    │           │
│  │  Database   │ │   Seeder    │ │Distribution │           │
│  │             │ │             │ │             │           │
│  │ - lookup()  │ │ - seed()    │ │ - weights[] │           │
│  │ - count()   │ │ - loadWords│ │ - values[]  │           │
│  │ - validate()│ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. SQLite Database Structure

### 2.1 Database Schema

```sql
-- Dictionary table for English
CREATE TABLE IF NOT EXISTS dictionary_en (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  length INTEGER NOT NULL
);

-- Dictionary table for Polish
CREATE TABLE IF NOT EXISTS dictionary_pl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  length INTEGER NOT NULL
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_dict_en_word ON dictionary_en(word);
CREATE INDEX IF NOT EXISTS idx_dict_pl_word ON dictionary_pl(word);
CREATE INDEX IF NOT EXISTS idx_dict_en_length ON dictionary_en(length);
CREATE INDEX IF NOT EXISTS idx_dict_pl_length ON dictionary_pl(length);
```

### 2.2 Database Operations

```typescript
// src/db/dictionaryDb.ts

// Initialize dictionary for language
export async function loadDictionary(language: Language): Promise<void>;

// Check if word exists - O(log n) with index
export function isValidWord(word: string): boolean;

// Get total word count
export function getWordCount(): number;

// Internal: seed dictionary with word list
async function seedDictionary(
  db: SQLiteDatabase,
  language: Language
): Promise<void>;
```

### 2.3 Performance Characteristics

| Operation | Complexity | Typical Time |
|-----------|------------|--------------|
| Word lookup | O(log n) | <5ms |
| Dictionary load | O(n) | ~200ms |
| Word count | O(1) | <1ms |
| Index rebuild | O(n log n) | ~500ms |

---

## 3. Language Support

### 3.1 Polish Dictionary

| Aspect | Specification |
|--------|---------------|
| Word Count | ~300 (MVP), expandable |
| Character Set | A-Z (simplified, no diacritics) |
| Storage | SQLite table `dictionary_pl` |
| Data Source | `src/dictonary/pl/index.ts` |

**Polish Letter Distribution (Gameplay Optimized):**

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | A, I, O, E, N | 7-9% each |
| Common | R, Z, S, W, C | 3-5% each |
| Moderate | T, K, Y, D, P, M | 2-3% each |
| Uncommon | L, U, J, B | 1-2% each |
| Rare | G, H, F | 0.3-1% each |

**Polish Letter Point Values:**

| Points | Letters |
|--------|---------|
| 1 | A, E, I, O, N, R, S, W, Z |
| 2 | C, D, K, L, M, P, T, Y |
| 3 | B, G, H, J, U |
| 5 | F |

### 3.2 English Dictionary

| Aspect | Specification |
|--------|---------------|
| Word Count | ~300 (MVP), expandable |
| Character Set | A-Z |
| Storage | SQLite table `dictionary_en` |
| Data Source | `src/dictonary/eng/index.ts` |

**English Letter Distribution:**

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | E, A, R, I, O, T, N | 6-12% each |
| Common | S, L, C, U, D | 3-5% each |
| Moderate | P, M, H, G, B | 2-3% each |
| Uncommon | F, Y, W, K, V | 1-2% each |
| Rare | X, Z, J, Q | 0.1-0.5% each |

**English Letter Point Values (Scrabble-style):**

| Points | Letters |
|--------|---------|
| 1 | E, A, I, O, N, R, T, L, S, U |
| 2 | D, G |
| 3 | B, C, M, P |
| 4 | F, H, V, W, Y |
| 5 | K |
| 8 | J, X |
| 10 | Q, Z |

---

## 4. Dictionary Seeder Service

### 4.1 Seeding Process

```typescript
// src/services/dictionarySeeder.ts

export async function seedDictionary(
  db: SQLiteDatabase,
  language: Language
): Promise<void> {
  // 1. Check if already seeded
  const count = getWordCount();
  if (count > 0) return;

  // 2. Load word list based on language
  const words = language === 'en'
    ? englishWords
    : polishWords;

  // 3. Batch insert for performance
  await db.withTransactionAsync(async () => {
    for (const word of words) {
      await db.runAsync(
        `INSERT OR IGNORE INTO dictionary_${language} (word, length) VALUES (?, ?)`,
        [word.toUpperCase(), word.length]
      );
    }
  });
}
```

### 4.2 Word List Format

```typescript
// src/dictonary/eng/index.ts
export const englishWords = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
  'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day',
  // ... ~300 common words
];

// src/dictonary/pl/index.ts
export const polishWords = [
  'tak', 'nie', 'ale', 'czy', 'jak', 'sie', 'ona', 'ten',
  'dom', 'pan', 'raz', 'nic', 'tam', 'oto', 'sam', 'moj',
  // ... ~300 common words
];
```

---

## 5. Language Store Integration

### 5.1 Zustand Store

```typescript
// src/stores/languageStore.ts

interface LanguageState {
  language: Language;
  isFirstRun: boolean;

  setLanguage: (lang: Language) => Promise<void>;
  completeFirstRun: () => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      isFirstRun: true,

      setLanguage: async (lang) => {
        set({ language: lang });
        // Reload dictionary for new language
        await loadDictionary(lang);
      },

      completeFirstRun: async () => {
        set({ isFirstRun: false });
      },

      loadLanguage: async () => {
        // Load persisted language on app start
        await loadDictionary(get().language);
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 5.2 Language Switching Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 LANGUAGE SWITCH FLOW                         │
│                                                              │
│  1. User selects new language (Settings or Onboarding)      │
│                          │                                   │
│                          ▼                                   │
│  2. languageStore.setLanguage(newLang)                      │
│     - Updates Zustand state                                 │
│     - Persists to AsyncStorage                              │
│                          │                                   │
│                          ▼                                   │
│  3. loadDictionary(newLang)                                 │
│     - Loads words from dictionary_[lang] table              │
│     - Updates in-memory word set                            │
│                          │                                   │
│                          ▼                                   │
│  4. Game state resets (if in game)                          │
│     - New grid generated with language-specific weights     │
│     - Score reset to 0                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Word Validation API

### 6.1 Interface

```typescript
// src/db/dictionaryDb.ts

/**
 * Check if a word exists in the current language dictionary
 * @param word - The word to validate (case-insensitive)
 * @returns true if word exists, false otherwise
 */
export function isValidWord(word: string): boolean;

/**
 * Get the number of words in the current dictionary
 * @returns Total word count
 */
export function getWordCount(): number;

/**
 * Load dictionary for a specific language
 * Seeds data if not already present
 * @param language - 'en' or 'pl'
 */
export async function loadDictionary(language: Language): Promise<void>;
```

### 6.2 Usage in Game Engine

```typescript
// src/engine/WordValidator.ts or GridManager.ts

// During word submission
const word = selectedLetters.map(pos => grid[pos.row][pos.col].letter).join('');
const isValid = isValidWord(word.toUpperCase());

if (isValid) {
  // Calculate score
  // Clear matched letters
  // Apply cascade
} else {
  // Show invalid word feedback
  // Add strike (if applicable)
}
```

---

## 7. Future Expansion (v2.0+)

### 7.1 Language Expansion

| Language | Word Count Target | Priority |
|----------|-------------------|----------|
| Polish (expanded) | 10,000+ | Phase 2 |
| English (expanded) | 10,000+ | Phase 2 |
| German | ~50,000 | Phase 3 |
| Spanish | ~30,000 | Phase 3 |

### 7.2 Planned Features

- **Full diacritic support** for Polish (Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż)
- **Word categories** (common, advanced, rare)
- **Word definitions** for learning mode
- **Profanity filter** integration
- **OTA dictionary updates** via remote config

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Test Area | Coverage Target |
|-----------|-----------------|
| Word lookup | 100% |
| Dictionary loading | 100% |
| Language switching | 100% |
| Edge cases (empty, special chars) | 95% |

### 8.2 Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Lookup Speed | <50ms | Benchmark 1000 lookups |
| Load Time | <500ms | Cold load measurement |
| Memory Usage | <5MB | Memory profiler |

### 8.3 Test Cases

```typescript
// Example test cases
describe('Dictionary', () => {
  it('validates known English words', () => {
    expect(isValidWord('THE')).toBe(true);
    expect(isValidWord('AND')).toBe(true);
  });

  it('rejects invalid words', () => {
    expect(isValidWord('XYZ')).toBe(false);
    expect(isValidWord('ASDF')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isValidWord('the')).toBe(true);
    expect(isValidWord('The')).toBe(true);
    expect(isValidWord('THE')).toBe(true);
  });

  it('handles empty strings', () => {
    expect(isValidWord('')).toBe(false);
  });
});
```

---

*Updated for LetterCrush SQLite dictionary implementation*
*Generated by BMAD TSD Workflow v2.0*
