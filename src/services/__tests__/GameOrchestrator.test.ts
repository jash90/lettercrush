/**
 * GameOrchestrator Service Tests
 * Tests for game flow coordination, phases, and animation timing
 */

import {
  createGameOrchestrator,
  getGameOrchestrator,
  resetGameOrchestrator,
  type AnimationConfig,
  type ValidationResult,
  type GameStateSnapshot,
  type PhaseCallbacks,
} from '../GameOrchestrator';

// Mock the engine dependencies
jest.mock('../../engine/GridManager', () => ({
  getGridManager: jest.fn(() => ({
    getGrid: jest.fn(() => [[]]),
    clearSelectedPositions: jest.fn(),
    applyGravity: jest.fn(),
    hasValidMoves: jest.fn(() => true),
    initialize: jest.fn(() => [[]]),
    getSelectableWordCount: jest.fn(() => 10), // Always return enough words
    ensureMinimumWords: jest.fn(() => true),
  })),
}));

jest.mock('../../engine/ScoreCalculator', () => ({
  getScoreCalculator: jest.fn(() => ({
    calculateWordScore: jest.fn(() => ({
      totalScore: 150,
      baseScore: 100,
      lengthBonus: 0,
      letterBonus: 50,
      comboMultiplier: 1,
    })),
  })),
}));

jest.mock('../../engine/WordValidator', () => ({
  getWordValidator: jest.fn(() => ({
    isValidWord: jest.fn((word: string) => word.length >= 3),
  })),
}));

jest.mock('../../db', () => ({
  saveHighscore: jest.fn(() => Promise.resolve()),
}));

describe('GameOrchestrator', () => {
  beforeEach(() => {
    resetGameOrchestrator();
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = getGameOrchestrator();
      const instance2 = getGameOrchestrator();

      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getGameOrchestrator();
      resetGameOrchestrator();
      const instance2 = getGameOrchestrator();

      expect(instance1).not.toBe(instance2);
    });

    it('should allow custom config on first creation', () => {
      const config: Partial<AnimationConfig> = {
        matchDelay: 500,
        clearDelay: 500,
        cascadeDelay: 500,
      };

      const orchestrator = getGameOrchestrator(config);
      const animConfig = orchestrator.getAnimationConfig();

      expect(animConfig.matchDelay).toBe(500);
      expect(animConfig.clearDelay).toBe(500);
      expect(animConfig.cascadeDelay).toBe(500);
    });
  });

  describe('createGameOrchestrator (factory)', () => {
    it('should create new instance each time', () => {
      const instance1 = createGameOrchestrator();
      const instance2 = createGameOrchestrator();

      expect(instance1).not.toBe(instance2);
    });

    it('should accept custom configuration', () => {
      const config: Partial<AnimationConfig> = {
        matchDelay: 100,
      };

      const orchestrator = createGameOrchestrator(config);
      const animConfig = orchestrator.getAnimationConfig();

      expect(animConfig.matchDelay).toBe(100);
    });
  });

  describe('validateWord', () => {
    it('should reject words shorter than minimum length', () => {
      const orchestrator = createGameOrchestrator();

      const result = orchestrator.validateWord('AB', 3);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word must be at least 3 letters');
    });

    it('should accept words meeting minimum length', () => {
      const orchestrator = createGameOrchestrator();

      const result = orchestrator.validateWord('CAT', 3);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should use custom minimum length', () => {
      const orchestrator = createGameOrchestrator();

      const result = orchestrator.validateWord('CAT', 4);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word must be at least 4 letters');
    });

    it('should use default minimum length of 3', () => {
      const orchestrator = createGameOrchestrator();

      const result = orchestrator.validateWord('AB');

      expect(result.isValid).toBe(false);
    });
  });

  describe('canInteract', () => {
    it('should return true for idle phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.canInteract('idle')).toBe(true);
    });

    it('should return false for matching phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.canInteract('matching')).toBe(false);
    });

    it('should return false for cascading phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.canInteract('cascading')).toBe(false);
    });

    it('should return false for paused phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.canInteract('paused')).toBe(false);
    });

    it('should return false for gameOver phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.canInteract('gameOver')).toBe(false);
    });
  });

  describe('isPlaying', () => {
    it('should return true for idle phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.isPlaying('idle')).toBe(true);
    });

    it('should return true for matching phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.isPlaying('matching')).toBe(true);
    });

    it('should return true for cascading phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.isPlaying('cascading')).toBe(true);
    });

    it('should return false for paused phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.isPlaying('paused')).toBe(false);
    });

    it('should return false for gameOver phase', () => {
      const orchestrator = createGameOrchestrator();

      expect(orchestrator.isPlaying('gameOver')).toBe(false);
    });
  });

  describe('animation configuration', () => {
    it('should have default animation timings', () => {
      const orchestrator = createGameOrchestrator();
      const config = orchestrator.getAnimationConfig();

      expect(config.matchDelay).toBe(300);
      expect(config.clearDelay).toBe(300);
      expect(config.cascadeDelay).toBe(300);
    });

    it('should update animation configuration', () => {
      const orchestrator = createGameOrchestrator();

      orchestrator.setAnimationConfig({ matchDelay: 500 });
      const config = orchestrator.getAnimationConfig();

      expect(config.matchDelay).toBe(500);
      expect(config.clearDelay).toBe(300); // Unchanged
      expect(config.cascadeDelay).toBe(300); // Unchanged
    });

    it('should return copy of config to prevent mutation', () => {
      const orchestrator = createGameOrchestrator();
      const config = orchestrator.getAnimationConfig();

      config.matchDelay = 1000;

      const freshConfig = orchestrator.getAnimationConfig();
      expect(freshConfig.matchDelay).toBe(300);
    });
  });

  describe('initializeGame', () => {
    it('should call GridManager.initialize', () => {
      const orchestrator = createGameOrchestrator();
      const grid = orchestrator.initializeGame();

      expect(Array.isArray(grid)).toBe(true);
    });
  });

  describe('processWord', () => {
    it('should call phase callbacks in correct order', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 10,
        clearDelay: 10,
        cascadeDelay: 10
      });

      const phaseChanges: string[] = [];
      const callbacks: PhaseCallbacks = {
        onPhaseChange: (phase) => phaseChanges.push(phase),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        currentWord: 'CAT',
        score: 0,
        moves: 5,
        highScore: 100,
        combo: 0,
        wordsFound: 0,
        longestWord: '',
        bestCombo: 0,
      };

      const promise = orchestrator.processWord(state, callbacks);

      // Advance through all timers
      await jest.runAllTimersAsync();
      await promise;

      expect(phaseChanges).toContain('matching');
      expect(phaseChanges).toContain('cascading');

      jest.useRealTimers();
    });

    it('should call onMatchFound with match data', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        currentWord: 'CAT',
        score: 0,
        moves: 5,
        highScore: 100,
        combo: 0,
        wordsFound: 0,
        longestWord: '',
        bestCombo: 0,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      await promise;

      expect(callbacks.onMatchFound).toHaveBeenCalledWith(
        expect.objectContaining({
          word: 'CAT',
          positions: state.selectedLetters,
          direction: 'selected',
        })
      );

      jest.useRealTimers();
    });

    it('should return updated stats', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        currentWord: 'CAT',
        score: 100,
        moves: 5,
        highScore: 200,
        combo: 1,
        wordsFound: 2,
        longestWord: 'AT',
        bestCombo: 1,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.stats.wordsFound).toBe(3);
      expect(result.stats.longestWord).toBe('CAT');
      expect(result.stats.bestCombo).toBe(2);

      jest.useRealTimers();
    });
  });

  describe('stats calculation', () => {
    it('should increment wordsFound', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [{ row: 0, col: 0 }],
        currentWord: 'TEST',
        score: 0,
        moves: 0,
        highScore: 0,
        combo: 0,
        wordsFound: 5,
        longestWord: '',
        bestCombo: 0,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.stats.wordsFound).toBe(6);

      jest.useRealTimers();
    });

    it('should update longestWord when new word is longer', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [],
        currentWord: 'TESTING',
        score: 0,
        moves: 0,
        highScore: 0,
        combo: 0,
        wordsFound: 0,
        longestWord: 'CAT',
        bestCombo: 0,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.stats.longestWord).toBe('TESTING');

      jest.useRealTimers();
    });

    it('should keep existing longestWord when new word is shorter', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [],
        currentWord: 'CAT',
        score: 0,
        moves: 0,
        highScore: 0,
        combo: 0,
        wordsFound: 0,
        longestWord: 'TESTING',
        bestCombo: 0,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.stats.longestWord).toBe('TESTING');

      jest.useRealTimers();
    });

    it('should update bestCombo when new combo is higher', async () => {
      jest.useFakeTimers();

      const orchestrator = createGameOrchestrator({
        matchDelay: 0,
        clearDelay: 0,
        cascadeDelay: 0
      });

      const callbacks: PhaseCallbacks = {
        onPhaseChange: jest.fn(),
        onGridUpdate: jest.fn(),
        onMatchFound: jest.fn(),
      };

      const state: GameStateSnapshot = {
        selectedLetters: [],
        currentWord: 'CAT',
        score: 0,
        moves: 0,
        highScore: 0,
        combo: 3,
        wordsFound: 0,
        longestWord: '',
        bestCombo: 2,
      };

      const promise = orchestrator.processWord(state, callbacks);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.stats.bestCombo).toBe(4);

      jest.useRealTimers();
    });
  });
});
