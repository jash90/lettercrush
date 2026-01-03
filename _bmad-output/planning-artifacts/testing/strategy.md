# WordGrid Testing Strategy

**Parent Document:** [Testing Overview](./overview.md)

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
│  • Build Time: <30 minutes                                          │
│  • Test Execution: <10 minutes                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Testing Objectives

| Objective | Target | Measurement |
|-----------|--------|-------------|
| Prevent Regressions | <1% regression rate | Defect tracking |
| Fast Feedback | <10min for unit tests | CI metrics |
| Confidence | 95% deployment confidence | Survey |
| Documentation | Tests as specification | Code review |

---

## 2. Test Categories

### 2.1 Unit Tests

**Scope**: Individual classes, methods, and functions in isolation

**Framework**: NUnit 3.x with Unity Test Framework

**Naming Convention**: `[MethodName]_[Scenario]_[ExpectedResult]`

```csharp
// Example: Dictionary System Unit Tests
[TestFixture]
public class TrieDictionaryTests
{
    private TrieDictionary _dictionary;

    [SetUp]
    public void Setup()
    {
        _dictionary = new TrieDictionary(Language.English);
        _dictionary.LoadTestData(TestDictionaries.SmallEnglish);
    }

    [Test]
    public void Contains_ValidWord_ReturnsTrue()
    {
        Assert.IsTrue(_dictionary.Contains("WORD"));
    }

    [Test]
    public void Contains_InvalidWord_ReturnsFalse()
    {
        Assert.IsFalse(_dictionary.Contains("XYZZY"));
    }

    [Test]
    public void Contains_EmptyString_ReturnsFalse()
    {
        Assert.IsFalse(_dictionary.Contains(""));
    }

    [Test]
    public void Contains_CaseInsensitive_ReturnsTrue()
    {
        Assert.IsTrue(_dictionary.Contains("word"));
        Assert.IsTrue(_dictionary.Contains("WORD"));
        Assert.IsTrue(_dictionary.Contains("Word"));
    }

    [Test]
    [TestCase("A", false)]
    [TestCase("AB", false)]
    [TestCase("CAT", true)]
    [TestCase("CATS", true)]
    public void Contains_MinimumLength_EnforcesThreeLetters(string word, bool expected)
    {
        Assert.AreEqual(expected, _dictionary.IsValidGameWord(word));
    }
}
```

**Unit Test Coverage Targets**:

| Module | Target | Priority |
|--------|--------|----------|
| Dictionary System | 100% | P0 |
| Score Engine | 100% | P0 |
| Grid Manager | 95% | P0 |
| Word Validator | 100% | P0 |
| Progression System | 90% | P1 |
| Power-up System | 90% | P1 |
| UI Components | 80% | P1 |

### 2.2 Integration Tests

**Scope**: Component interactions, data flow, service integration

```csharp
// Example: Gameplay Integration Tests
[TestFixture]
public class GameplayIntegrationTests
{
    private GameManager _gameManager;
    private GridManager _gridManager;
    private ScoreEngine _scoreEngine;
    private MockDictionary _dictionary;

    [SetUp]
    public void Setup()
    {
        _dictionary = new MockDictionary();
        _dictionary.AddWords("CAT", "DOG", "STAR", "CATS", "DOGS");

        _scoreEngine = new ScoreEngine();
        _gridManager = new GridManager(_dictionary);
        _gameManager = new GameManager(_gridManager, _scoreEngine);
    }

    [Test]
    public void Swap_CreatesValidWord_ScoreIncreases()
    {
        // Arrange
        _gridManager.SetTestGrid(new char[,] {
            {'C', 'A', 'T', 'X', 'X', 'X'},
            {'X', 'X', 'X', 'X', 'X', 'X'},
            // ... rest of grid
        });
        int initialScore = _gameManager.CurrentScore;

        // Act - no swap needed, CAT already formed
        _gameManager.ProcessMatches();

        // Assert
        Assert.Greater(_gameManager.CurrentScore, initialScore);
    }

    [Test]
    public async Task Cascade_MultipleWords_ComboMultiplierApplied()
    {
        // Arrange - setup grid that will cascade
        _gridManager.SetTestGrid(CreateCascadeTestGrid());

        // Act
        await _gameManager.ProcessMatchesAsync();

        // Assert
        Assert.Greater(_gameManager.CurrentCombo, 1);
    }
}
```

**Integration Test Scenarios**:

| Scenario | Components | Validation |
|----------|------------|------------|
| Word Match Flow | Grid → Validator → Score | Score updates correctly |
| Cascade Chain | Grid → Validator → Score → Grid | Combo multiplier applied |
| Power-up Usage | Inventory → Grid → Score | Effect applied, count decreased |
| Level Complete | Game → Progression → Cloud | XP/rewards saved |
| IAP Flow | Store → Backend → Inventory | Items delivered |

### 2.3 End-to-End Tests

**Scope**: Complete user journeys through the application

**Framework**: Unity Test Framework with Appium for device testing

```csharp
// Example: E2E Test Scenarios
[TestFixture]
public class E2EGameplayTests
{
    private TestDriver _driver;

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        _driver = new TestDriver();
        _driver.LaunchApp();
    }

    [Test]
    public async Task ClassicMode_CompleteGame_ShowsResults()
    {
        // Navigate to Classic mode
        await _driver.Tap("MainMenu_PlayButton");
        await _driver.WaitForScreen("ModeSelection");
        await _driver.Tap("ModeSelection_ClassicButton");

        // Wait for gameplay to load
        await _driver.WaitForScreen("Gameplay");
        Assert.IsTrue(_driver.IsVisible("Gameplay_Timer"));

        // Play until game ends (simulate or wait)
        await _driver.WaitForElement("GameOver_Panel", timeout: 130000);

        // Verify results screen
        Assert.IsTrue(_driver.IsVisible("Results_Score"));
        Assert.IsTrue(_driver.IsVisible("Results_HomeButton"));
        Assert.IsTrue(_driver.IsVisible("Results_ReplayButton"));
    }

    [Test]
    public async Task DailyChallenge_CompleteStreak_RewardsGranted()
    {
        // Setup: Ensure streak at day 6
        await _driver.SetTestState("DailyStreak", 6);

        // Complete daily challenge
        await NavigateToDailyChallenge();
        await CompleteDailyChallenge();

        // Verify day 7 streak reward
        Assert.IsTrue(_driver.IsVisible("StreakReward_Day7"));
        var rewardText = await _driver.GetText("StreakReward_Description");
        Assert.That(rewardText, Contains.Substring("Rare Power-up"));
    }
}
```

**Critical E2E Paths**:

| Journey | Priority | Frequency |
|---------|----------|-----------|
| First-time user onboarding | P0 | Every build |
| Classic mode complete game | P0 | Every build |
| IAP purchase flow | P0 | Every release |
| Daily challenge completion | P0 | Daily |
| Campaign level progression | P1 | Every release |
| PvP match flow | P1 | Every release |
| Cloud save/restore | P1 | Every release |

---

## 3. Specialized Testing

### 3.1 Performance Testing

**Metrics & Thresholds**:

| Metric | Target | Critical | Tool |
|--------|--------|----------|------|
| Frame Rate | 60 FPS | 30 FPS | Unity Profiler |
| Memory Usage | <300MB | <400MB | Memory Profiler |
| Load Time | <3s | <5s | Custom timer |
| Word Validation | <50ms | <100ms | Stopwatch |
| Battery Drain | <8%/hr | <12%/hr | Device monitor |

**Performance Test Suite**:

```csharp
[TestFixture]
public class PerformanceTests
{
    [Test]
    [Performance]
    public void WordValidation_10000Words_Under50ms()
    {
        var dictionary = LoadFullDictionary(Language.Polish);
        var testWords = GenerateTestWords(10000);

        var sw = Stopwatch.StartNew();
        foreach (var word in testWords)
        {
            dictionary.Contains(word);
        }
        sw.Stop();

        var avgMs = sw.ElapsedMilliseconds / 10000.0;
        Assert.Less(avgMs, 0.05, $"Average lookup: {avgMs}ms");
    }

    [Test]
    [Performance]
    public void GridGeneration_100Grids_AllHaveValidWords()
    {
        var generator = new GridGenerator(Language.Polish);
        var sw = Stopwatch.StartNew();

        for (int i = 0; i < 100; i++)
        {
            var grid = generator.Generate();
            var words = grid.FindAllWords();
            Assert.GreaterOrEqual(words.Count, 3, $"Grid {i} has insufficient words");
        }

        sw.Stop();
        Assert.Less(sw.ElapsedMilliseconds, 5000, "100 grids should generate in <5s");
    }

    [Test]
    [Performance]
    public void CascadeAnimation_10Cascades_MaintainsFrameRate()
    {
        // Setup monitoring
        var frameMonitor = new FrameRateMonitor();
        frameMonitor.Start();

        // Trigger cascades
        for (int i = 0; i < 10; i++)
        {
            TriggerTestCascade();
            WaitForAnimationComplete();
        }

        frameMonitor.Stop();

        Assert.GreaterOrEqual(frameMonitor.MinFPS, 30);
        Assert.GreaterOrEqual(frameMonitor.AverageFPS, 55);
    }
}
```

### 3.2 Security Testing

**Security Test Areas**:

| Area | Test Type | Frequency |
|------|-----------|-----------|
| Score Validation | Fuzz testing | Every release |
| API Authentication | Penetration | Quarterly |
| Data Encryption | Verification | Every release |
| IAP Receipt Validation | Replay attack | Every release |
| User Data Protection | GDPR compliance | Quarterly |

**Security Test Examples**:

```csharp
[TestFixture]
public class SecurityTests
{
    [Test]
    public void ScoreSubmission_InvalidSignature_Rejected()
    {
        var fakeScore = new ScoreSubmission {
            Score = 999999,
            Signature = "fake_signature",
            Timestamp = DateTime.UtcNow
        };

        var result = SecurityValidator.ValidateScore(fakeScore);
        Assert.IsFalse(result.IsValid);
        Assert.AreEqual(SecurityError.InvalidSignature, result.Error);
    }

    [Test]
    public void ScoreSubmission_ImpossibleScore_Flagged()
    {
        // Max theoretical score in 2 minutes is ~50,000
        var impossibleScore = new ScoreSubmission {
            Score = 1000000,
            GameDuration = 120,
            WordsFound = 10
        };

        var result = SecurityValidator.ValidateScore(impossibleScore);
        Assert.IsFalse(result.IsValid);
        Assert.AreEqual(SecurityError.StatisticalAnomaly, result.Error);
    }

    [Test]
    public void IAPReceipt_ReplayAttack_Rejected()
    {
        var usedReceipt = GetPreviouslyUsedReceipt();

        var result = IAPValidator.ValidateReceipt(usedReceipt);
        Assert.IsFalse(result.IsValid);
        Assert.AreEqual(IAPError.ReceiptAlreadyUsed, result.Error);
    }
}
```

### 3.3 Localization Testing

**Language Test Matrix**:

| Test | Polish | English | Notes |
|------|--------|---------|-------|
| UI Text Fit | ✅ | ✅ | Check truncation |
| Dictionary Load | ✅ | ✅ | Full word lists |
| Special Characters | Ą,Ć,Ę,Ł,Ń,Ó,Ś,Ź,Ż | N/A | Rendering |
| Letter Distribution | ✅ | ✅ | Balanced grids |
| Date/Time Format | dd.MM.yyyy | MM/dd/yyyy | Locale |
| Number Format | 1 000,50 | 1,000.50 | Locale |

```csharp
[TestFixture]
public class LocalizationTests
{
    [Test]
    [TestCase(Language.Polish)]
    [TestCase(Language.English)]
    public void Dictionary_AllWordsValid_ForLanguage(Language lang)
    {
        var dictionary = DictionaryLoader.Load(lang);

        Assert.Greater(dictionary.WordCount, 100000);

        // Verify sample words exist
        var sampleWords = GetSampleWords(lang);
        foreach (var word in sampleWords)
        {
            Assert.IsTrue(dictionary.Contains(word), $"Missing: {word}");
        }
    }

    [Test]
    [TestCase(Language.Polish)]
    [TestCase(Language.English)]
    public void LetterDistribution_GeneratesValidGrids(Language lang)
    {
        var distribution = LetterDistribution.ForLanguage(lang);
        var generator = new GridGenerator(distribution);

        for (int i = 0; i < 100; i++)
        {
            var grid = generator.Generate();
            var words = grid.FindAllWords();
            Assert.GreaterOrEqual(words.Count, 3, $"Grid {i} insufficient words");
        }
    }

    [Test]
    public void Polish_SpecialCharacters_RenderCorrectly()
    {
        var polishChars = "ĄĆĘŁŃÓŚŹŻ";

        foreach (char c in polishChars)
        {
            var tile = CreateTile(c);
            Assert.IsNotNull(tile.Sprite, $"Missing sprite for: {c}");
            Assert.AreEqual(c.ToString(), tile.Label.text);
        }
    }
}
```

### 3.4 Accessibility Testing

**Accessibility Test Checklist**:

| Feature | Test | Validation |
|---------|------|------------|
| VoiceOver | Navigation | All elements announced |
| TalkBack | Touch exploration | Correct labels |
| Color Blind | All modes | Distinguishable colors |
| Dynamic Type | Font scaling | No truncation |
| Reduced Motion | Animations | Essential only |
| Touch Targets | Minimum 44pt | All interactive elements |

```csharp
[TestFixture]
public class AccessibilityTests
{
    [Test]
    public void AllButtons_MeetMinimumTouchTarget()
    {
        var buttons = FindAllInteractiveElements();

        foreach (var button in buttons)
        {
            var size = button.GetComponent<RectTransform>().sizeDelta;
            Assert.GreaterOrEqual(size.x, 44, $"{button.name} width too small");
            Assert.GreaterOrEqual(size.y, 44, $"{button.name} height too small");
        }
    }

    [Test]
    public void ColorBlindMode_TileColors_Distinguishable()
    {
        var modes = new[] { ColorBlindMode.Deuteranopia, ColorBlindMode.Protanopia, ColorBlindMode.Tritanopia };

        foreach (var mode in modes)
        {
            ApplyColorBlindMode(mode);

            var validColor = GetTileColor(TileState.Valid);
            var invalidColor = GetTileColor(TileState.Invalid);
            var bonusColor = GetTileColor(TileState.Bonus);

            // Check color distance meets WCAG threshold
            Assert.Greater(ColorDistance(validColor, invalidColor), 4.5);
            Assert.Greater(ColorDistance(validColor, bonusColor), 4.5);
            Assert.Greater(ColorDistance(invalidColor, bonusColor), 4.5);
        }
    }

    [Test]
    public void VoiceOver_GameplayElements_HaveLabels()
    {
        var grid = CreateTestGrid();

        foreach (var tile in grid.Tiles)
        {
            Assert.IsNotNull(tile.AccessibilityLabel);
            Assert.That(tile.AccessibilityLabel, Contains.Substring("Letter"));
            Assert.That(tile.AccessibilityLabel, Contains.Substring("row"));
        }
    }
}
```

---

## 4. Test Data Management

### 4.1 Test Data Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TEST DATA ARCHITECTURE                          │
│                                                                      │
│  Static Test Data                                                    │
│  ├── test_dictionaries/                                             │
│  │   ├── small_english.txt (1,000 words)                           │
│  │   ├── small_polish.txt (1,000 words)                            │
│  │   └── edge_cases.txt (special scenarios)                        │
│  │                                                                   │
│  ├── test_grids/                                                    │
│  │   ├── valid_grids.json (pre-validated)                          │
│  │   ├── cascade_grids.json (trigger cascades)                     │
│  │   └── edge_case_grids.json                                      │
│  │                                                                   │
│  └── test_profiles/                                                 │
│      ├── new_user.json                                              │
│      ├── veteran_user.json                                          │
│      └── premium_user.json                                          │
│                                                                      │
│  Dynamic Test Data                                                   │
│  ├── Generated grids (runtime)                                      │
│  ├── Randomized user profiles                                       │
│  └── Mock server responses                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mock Services

```csharp
public interface IMockService
{
    void SetResponse<T>(string endpoint, T response);
    void SetError(string endpoint, int statusCode, string message);
    void SetLatency(string endpoint, int milliseconds);
    void Reset();
}

// Example usage
[Test]
public async Task Leaderboard_ServerError_ShowsCachedData()
{
    // Arrange
    _mockServer.SetError("/leaderboard", 500, "Server Error");
    _mockCache.Set("leaderboard", cachedLeaderboard);

    // Act
    var result = await _leaderboardService.GetTopScores();

    // Assert
    Assert.IsNotNull(result);
    Assert.AreEqual(cachedLeaderboard.Scores, result.Scores);
    Assert.IsTrue(result.IsCached);
}
```

---

## 5. CI/CD Integration

### 5.1 Pipeline Configuration

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
      - uses: actions/checkout@v3

      - name: Setup Unity
        uses: game-ci/unity-test-runner@v2
        with:
          testMode: editmode
          artifactsPath: test-results

      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: unit-test-results
          path: test-results

  integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3

      - name: Run Integration Tests
        uses: game-ci/unity-test-runner@v2
        with:
          testMode: playmode

  build-and-e2e:
    runs-on: macos-latest
    timeout-minutes: 60
    needs: integration-tests
    steps:
      - name: Build iOS
        uses: game-ci/unity-builder@v2
        with:
          targetPlatform: iOS

      - name: Run E2E Tests
        run: |
          xcrun simctl boot "iPhone 14"
          xcodebuild test -workspace WordGrid.xcworkspace -scheme WordGridUITests
```

### 5.2 Quality Gates

| Gate | Criteria | Blocking |
|------|----------|----------|
| Unit Tests | 100% pass | Yes |
| Coverage | >80% | Yes |
| Integration Tests | 100% pass | Yes |
| Performance | Meet thresholds | Yes (release) |
| Security Scan | No critical issues | Yes |
| Lint | No errors | Yes |

---

## 6. Test Environments

### 6.1 Environment Matrix

| Environment | Purpose | Data | Backend |
|-------------|---------|------|---------|
| Local | Developer testing | Mock | Mock/Local |
| CI | Automated tests | Test fixtures | Mock |
| Staging | QA testing | Sanitized prod | Staging servers |
| Beta | External testing | Test accounts | Production (sandboxed) |
| Production | Live | Real | Production |

### 6.2 Device Test Matrix

| Device | OS Version | Priority | Testing |
|--------|------------|----------|---------|
| iPhone SE (2nd gen) | iOS 14 | P0 | Manual + E2E |
| iPhone 12 | iOS 15 | P0 | E2E |
| iPhone 14 Pro | iOS 17 | P0 | Manual + E2E |
| iPad Air | iOS 16 | P1 | Manual |
| Samsung Galaxy A52 | Android 11 | P0 | Manual + E2E |
| Google Pixel 6 | Android 13 | P0 | E2E |
| OnePlus 9 | Android 14 | P1 | Manual |

---

## 7. Bug Tracking & Reporting

### 7.1 Bug Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| Critical | App crash, data loss | <4 hours | Crash on launch |
| High | Major feature broken | <24 hours | Cannot complete game |
| Medium | Feature degraded | <1 week | Score display wrong |
| Low | Minor issue | Next sprint | Typo in UI |

### 7.2 Bug Report Template

```markdown
## Bug Report

**Summary**: [Brief description]

**Severity**: [Critical/High/Medium/Low]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]

**Actual Result**: [What actually happens]

**Environment**:
- Device: [e.g., iPhone 14]
- OS: [e.g., iOS 17.2]
- App Version: [e.g., 1.0.0 (123)]
- Language: [e.g., Polish]

**Screenshots/Video**: [Attach if applicable]

**Logs**: [Attach crash logs if available]
```

---

## 8. Test Metrics & Reporting

### 8.1 Key Metrics

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Test Coverage | >80% | - | - |
| Test Pass Rate | >99% | - | - |
| Flaky Test Rate | <1% | - | - |
| Build Success Rate | >95% | - | - |
| Mean Time to Fix | <4 hours | - | - |

### 8.2 Reporting Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TEST DASHBOARD                                  │
│                                                                      │
│  Build Status: ✅ Passing                 Last Run: 2 hours ago     │
│                                                                      │
│  Coverage                    Test Results                            │
│  ┌────────────────┐         ┌────────────────────────────────┐      │
│  │ ████████░░ 82% │         │ ✅ Unit: 1,245/1,245 passed    │      │
│  └────────────────┘         │ ✅ Integration: 89/89 passed   │      │
│                             │ ✅ E2E: 24/24 passed           │      │
│  Performance                │ ⚠️ Performance: 18/20 passed   │      │
│  ┌────────────────┐         └────────────────────────────────┘      │
│  │ FPS: 58 avg    │                                                 │
│  │ Memory: 285MB  │         Failed Tests:                           │
│  │ Load: 2.8s     │         - PerformanceTests.Memory_Under300MB    │
│  └────────────────┘         - PerformanceTests.Cascade_10_FPS       │
│                                                                      │
│  Recent Failures            Flaky Tests (Last 7 days)               │
│  ├── Memory test (3x)       ├── NetworkTest.Timeout (2.1%)          │
│  └── Cascade FPS (2x)       └── E2E.DailyChallenge (1.8%)           │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Generated by BMAD PRD Workflow v1.0*
