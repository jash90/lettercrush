# WordGrid TSD - Dictionary System

**Parent Document:** [TSD Overview](./overview.md)

---

## 1. Overview

The Dictionary System is a critical performance component responsible for word validation, providing sub-50ms lookup times for 200,000+ words per language.

### 1.1 System Requirements

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| Lookup Time | <50ms | Responsive UX |
| Memory Footprint | <15MB per language | Mobile constraints |
| Offline Support | Full functionality | Core requirement |
| Load Time | <500ms | Fast startup |
| Languages v1.0 | Polish, English | Market priority |

### 1.2 Implementation Status (v1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Language Selection UI | ✅ Implemented | Toggle in header (🇬🇧 EN \| 🇵🇱 PL) |
| Language Persistence | ✅ Implemented | AsyncStorage-backed |
| Polish Dictionary | ✅ Implemented | 300+ words (no diacritics) |
| English Dictionary | ✅ Implemented | 300+ words |
| Language-aware Grid | ✅ Implemented | Letter weights per language |
| Dynamic Switching | ✅ Implemented | Resets game on change |

**Implementation Files:**
- `src/stores/languageStore.ts` - Zustand store with AsyncStorage persistence
- `src/data/dictionaries/` - Language-specific word lists
- `src/components/LanguageSelector.tsx` - Toggle UI component
- `src/engine/GridManager.ts` - Language-aware letter generation
- `src/types/game.types.ts` - Language type and letter weights

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 DICTIONARY SYSTEM                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Dictionary Manager                       ││
│  │  - Language switching                                   ││
│  │  - Hot-reload support                                   ││
│  │  - Memory management                                    ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Trie     │ │  Profanity  │ │   Letter    │           │
│  │  Dictionary │ │   Filter    │ │Distribution │           │
│  │             │ │             │ │             │           │
│  │ - lookup()  │ │ - check()   │ │ - weights[] │           │
│  │ - prefix()  │ │ - block()   │ │ - values[]  │           │
│  │ - validate()│ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Trie Data Structure

### 2.1 Design Specification

The Trie (prefix tree) provides O(m) lookup complexity where m is word length, optimal for dictionary operations.

```csharp
public class TrieNode
{
    public Dictionary<char, TrieNode> Children { get; }
    public bool IsEndOfWord { get; set; }
    public WordMetadata Metadata { get; set; }

    // Memory optimization: use array for common letters
    private TrieNode[] _fastChildren; // For letters A-Z, a-z, Polish chars
}

public class WordMetadata
{
    public int Frequency;      // Usage frequency in language
    public string Category;    // Semantic category
    public int ScrabbleValue;  // Letter point sum
    public bool IsProfane;     // Profanity flag
}
```

### 2.2 Memory Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              MEMORY OPTIMIZATION STRATEGIES                  │
│                                                              │
│  1. Node Compression                                         │
│     - Single-child paths collapsed                           │
│     - ~30% memory reduction                                  │
│                                                              │
│  2. Character Indexing                                       │
│     - Array for common chars (A-Z, Polish: Ą,Ć,Ę,Ł,Ń,Ó,Ś,Ź,Ż)│
│     - Dictionary for rare chars                              │
│     - ~20% faster lookup                                     │
│                                                              │
│  3. Lazy Loading                                             │
│     - Core dictionary (common words) loaded first           │
│     - Extended dictionary loaded async                       │
│     - ~40% faster startup                                    │
│                                                              │
│  4. Pooling                                                  │
│     - TrieNode pool for allocation                          │
│     - Reduces GC pressure                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Implementation

```csharp
public class TrieDictionary : IDictionary
{
    private TrieNode _root;
    private int _wordCount;
    private readonly Language _language;

    // O(m) lookup - m is word length
    public bool Contains(string word)
    {
        TrieNode node = _root;
        foreach (char c in word.ToUpper())
        {
            if (!node.TryGetChild(c, out node))
                return false;
        }
        return node.IsEndOfWord;
    }

    // O(m) prefix check for word building hints
    public bool HasPrefix(string prefix)
    {
        TrieNode node = _root;
        foreach (char c in prefix.ToUpper())
        {
            if (!node.TryGetChild(c, out node))
                return false;
        }
        return true;
    }

    // Find all words with given prefix
    public IEnumerable<string> GetWordsWithPrefix(string prefix, int limit = 10)
    {
        // Navigate to prefix node
        // DFS to collect words
        // Yield results up to limit
    }

    // Batch validation for grid analysis
    public Dictionary<string, bool> ValidateWords(IEnumerable<string> words)
    {
        return words.ToDictionary(w => w, w => Contains(w));
    }
}
```

---

## 3. Language Support

### 3.1 Polish Dictionary

| Aspect | Specification (Target) | v1.0 Implementation |
|--------|------------------------|---------------------|
| Word Count | ~200,000 | 300+ (MVP) |
| Character Set | A-Z + Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż | A-Z (no diacritics) |
| Storage | ~5MB compressed | In-memory array |
| Location | External file | `src/data/dictionaries/polish.ts` |

**Note:** v1.0 uses simplified Polish (no diacritics) for grid compatibility. Full diacritic support planned for v2.0.

**Polish Letter Distribution (Gameplay Optimized):**

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | A, I, O, E, N | 7-9% each |
| Common | R, Z, S, W, C | 3-5% each |
| Moderate | T, K, Y, D, P, M | 2-3% each |
| Uncommon | L, Ł, U, J, B | 1-2% each |
| Rare | G, H, Ą, Ę, Ó, Ś, Ż | 0.3-1% each |
| Very Rare | Ć, Ń, Ź, F | 0.1-0.2% each |

**Polish Letter Point Values:**

| Points | Letters |
|--------|---------|
| 1 | A, E, I, O, N, R, S, W, Z |
| 2 | C, D, K, L, M, P, T, Y |
| 3 | B, G, H, J, Ł, U |
| 5 | Ą, Ę, F, Ó, Ś, Ż |
| 7 | Ć, Ń |
| 9 | Ź |

### 3.2 English Dictionary

| Aspect | Specification (Target) | v1.0 Implementation |
|--------|------------------------|---------------------|
| Word Count | ~170,000 | 300+ (MVP) |
| Character Set | A-Z | A-Z |
| Storage | ~4MB compressed | In-memory array |
| Location | External file | `src/data/dictionaries/english.ts` |

**English Letter Distribution:**

| Frequency Tier | Letters | Appearance Rate |
|----------------|---------|-----------------|
| Very Common | E, A, R, I, O, T, N | 6-12% each |
| Common | S, L, C, U, D | 3-5% each |
| Moderate | P, M, H, G, B | 2-3% each |
| Uncommon | F, Y, W, K, V | 1-2% each |
| Rare | X, Z, J, Q | 0.1-0.5% each |

**English Letter Point Values:**

| Points | Letters |
|--------|---------|
| 1 | E, A, I, O, N, R, T, L, S, U |
| 2 | D, G |
| 3 | B, C, M, P |
| 4 | F, H, V, W, Y |
| 5 | K |
| 8 | J, X |
| 10 | Q, Z |

### 3.3 Language Expansion (v2.0+)

| Language | Word Count | Priority | Status |
|----------|------------|----------|--------|
| German | ~300,000 | Phase 2 | Planned |
| Spanish | ~150,000 | Phase 2 | Planned |
| French | ~140,000 | Phase 2 | Planned |
| Italian | ~120,000 | Phase 3 | Backlog |
| Portuguese | ~120,000 | Phase 3 | Backlog |

---

## 4. Dictionary File Format

### 4.1 Serialization Format

```
┌─────────────────────────────────────────────────────────────┐
│              DICTIONARY FILE FORMAT (.wgd)                   │
│                                                              │
│  Header (32 bytes)                                           │
│  ├── Magic number: "WGRD" (4 bytes)                         │
│  ├── Version: uint16 (2 bytes)                              │
│  ├── Language code: char[2] (2 bytes)                       │
│  ├── Word count: uint32 (4 bytes)                           │
│  ├── Checksum: uint32 (4 bytes)                             │
│  └── Reserved: 16 bytes                                      │
│                                                              │
│  Trie Data (variable)                                        │
│  ├── Compressed node data                                    │
│  ├── String pool (shared suffixes)                          │
│  └── Metadata table                                          │
│                                                              │
│  Index (optional)                                            │
│  └── First-letter offsets for fast loading                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Compression Strategy

| Technique | Reduction | Impact |
|-----------|-----------|--------|
| LZMA2 Compression | 60-70% | Slower load |
| String Deduplication | 15-20% | None |
| Node Pooling | 10-15% | Faster load |
| **Total** | **~75%** | Acceptable |

### 4.3 Loading Strategy

```csharp
public async Task<IDictionary> LoadDictionaryAsync(Language lang)
{
    // 1. Load header and validate
    var header = await LoadHeaderAsync(lang);
    ValidateChecksum(header);

    // 2. Load core dictionary (most common 50K words)
    var coreTrie = await LoadCoreDictionaryAsync(lang);

    // 3. Background load extended dictionary
    _ = Task.Run(() => LoadExtendedDictionaryAsync(lang, coreTrie));

    return new TrieDictionary(coreTrie, lang);
}
```

---

## 5. Profanity Filter

### 5.1 Filter Design

```csharp
public class ProfanityFilter : IProfanityFilter
{
    private HashSet<string> _blockedWords;
    private Dictionary<string, string> _substitutionPatterns;

    public bool IsProfane(string word)
    {
        // Direct match
        if (_blockedWords.Contains(word.ToUpper()))
            return true;

        // Substitution detection (e.g., "sh1t" → "shit")
        string normalized = NormalizeSubstitutions(word);
        return _blockedWords.Contains(normalized.ToUpper());
    }

    public string NormalizeSubstitutions(string word)
    {
        // 1 → i, 0 → o, @ → a, $ → s, etc.
        foreach (var (pattern, replacement) in _substitutionPatterns)
            word = word.Replace(pattern, replacement);
        return word;
    }
}
```

### 5.2 Filter Categories

| Category | Count | Action |
|----------|-------|--------|
| Blocked | ~500 | Reject word |
| Flagged | ~200 | Mark for review |
| Cultural | ~100 | Language-specific |

### 5.3 Update Mechanism

| Aspect | Implementation |
|--------|----------------|
| Initial List | Bundled with app |
| Updates | Remote config |
| User Reports | Review queue |
| Regional | Locale-specific lists |

---

## 6. Grid Word Detection

### 6.1 Detection Algorithm

```csharp
public class WordDetector
{
    private readonly IDictionary _dictionary;

    public List<WordMatch> FindAllWords(char[,] grid)
    {
        var matches = new List<WordMatch>();
        int rows = grid.GetLength(0);
        int cols = grid.GetLength(1);

        // Horizontal scan (left to right)
        for (int row = 0; row < rows; row++)
        {
            matches.AddRange(FindWordsInLine(GetRow(grid, row), row, 0, Direction.Horizontal));
        }

        // Vertical scan (top to bottom)
        for (int col = 0; col < cols; col++)
        {
            matches.AddRange(FindWordsInLine(GetColumn(grid, col), 0, col, Direction.Vertical));
        }

        // Remove subwords (CAT in CATS)
        return FilterSubwords(matches);
    }

    private List<WordMatch> FindWordsInLine(char[] line, int startRow, int startCol, Direction dir)
    {
        var matches = new List<WordMatch>();
        int minLength = _settings.MinWordLength; // 3 or 4

        // Sliding window approach
        for (int start = 0; start < line.Length - minLength + 1; start++)
        {
            for (int end = start + minLength; end <= line.Length; end++)
            {
                string word = new string(line[start..end]);
                if (_dictionary.Contains(word) && !_profanityFilter.IsProfane(word))
                {
                    matches.Add(new WordMatch
                    {
                        Word = word,
                        StartPosition = (startRow + (dir == Direction.Vertical ? start : 0),
                                        startCol + (dir == Direction.Horizontal ? start : 0)),
                        Direction = dir,
                        Length = word.Length
                    });
                }
            }
        }

        return matches;
    }
}
```

### 6.2 Performance Optimizations

| Optimization | Description | Impact |
|--------------|-------------|--------|
| Prefix Pruning | Skip impossible prefixes | 40% faster |
| Parallel Scan | Scan rows/cols concurrently | 30% faster |
| Result Caching | Cache between frames | 50% faster on repeat |
| Early Termination | Stop at max word length | 10% faster |

---

## 7. OTA Dictionary Updates

### 7.1 Update Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              OTA DICTIONARY UPDATE SYSTEM                    │
│                                                              │
│  Cloud Storage                                               │
│  ├── /dictionaries/v2/                                      │
│  │   ├── pl.wgd                                             │
│  │   ├── en.wgd                                             │
│  │   └── manifest.json                                      │
│                                                              │
│  Update Flow                                                 │
│  1. Check manifest version on app launch                     │
│  2. Compare with local version                               │
│  3. Download delta if available                              │
│  4. Validate checksum                                        │
│  5. Atomic replace                                           │
│  6. Hot-reload if game not in progress                       │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Update Manifest

```json
{
  "version": "2.1.0",
  "timestamp": "2025-01-15T00:00:00Z",
  "dictionaries": {
    "pl": {
      "version": "2.1.0",
      "wordCount": 201500,
      "size": 5242880,
      "checksum": "sha256:abc123...",
      "deltaFrom": "2.0.0",
      "deltaSize": 102400
    },
    "en": {
      "version": "2.1.0",
      "wordCount": 171200,
      "size": 4194304,
      "checksum": "sha256:def456...",
      "deltaFrom": "2.0.0",
      "deltaSize": 81920
    }
  }
}
```

---

## 8. API Specification

### 8.1 Dictionary Interface

```csharp
public interface IDictionary
{
    // Core operations
    bool Contains(string word);
    bool HasPrefix(string prefix);
    WordMetadata GetMetadata(string word);

    // Batch operations
    Dictionary<string, bool> ValidateWords(IEnumerable<string> words);

    // Discovery
    IEnumerable<string> GetWordsWithPrefix(string prefix, int limit = 10);
    int WordCount { get; }
    Language Language { get; }

    // Lifecycle
    Task LoadAsync();
    void Unload();
    bool IsLoaded { get; }
}

public interface IProfanityFilter
{
    bool IsProfane(string word);
    Task UpdateFilterAsync();
}

public interface ILetterDistribution
{
    char GetRandomLetter();
    char[] GetRandomLetters(int count);
    int GetPointValue(char letter);
    float GetFrequency(char letter);
}
```

### 8.2 Events

```csharp
public interface IDictionaryEvents
{
    event Action<Language> OnDictionaryLoaded;
    event Action<Language, string> OnDictionaryLoadError;
    event Action<Language> OnDictionaryUpdated;
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Test Area | Coverage Target |
|-----------|-----------------|
| Trie Operations | 100% |
| Word Validation | 100% |
| Profanity Filter | 100% |
| Letter Distribution | 95% |

### 9.2 Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Lookup Speed | <50ms | Benchmark 10K words |
| Load Time | <500ms | Cold load |
| Memory Usage | <15MB | Memory profiler |
| Grid Detection | <100ms | 6×6 grid scan |

### 9.3 Test Data

| Dataset | Purpose | Size |
|---------|---------|------|
| Valid Words | Positive tests | 10,000 |
| Invalid Words | Negative tests | 5,000 |
| Profane Words | Filter tests | 500 |
| Edge Cases | Boundary tests | 200 |

---

*Generated by BMAD PRD Workflow v1.0*
