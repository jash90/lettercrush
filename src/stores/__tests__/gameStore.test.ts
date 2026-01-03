/**
 * GameStore Tests
 * Unit tests for Zustand game store
 */

import { useGameStore } from '../gameStore';
import { getGridManager, resetGridManager } from '../../engine/GridManager';
import { getWordValidator } from '../../engine/WordValidator';

// Mock dependencies
jest.mock('../../engine/GridManager');
jest.mock('../../engine/WordValidator');
jest.mock('../../engine/ScoreCalculator', () => ({
  getScoreCalculator: () => ({
    calculateWordScore: jest.fn().mockReturnValue({
      baseScore: 10,
      lengthBonus: 5,
      totalScore: 15,
    }),
  }),
}));
jest.mock('../../data/dictionaries', () => ({
  getDictionary: () => ['CAT', 'DOG', 'HAT', 'BAT', 'MAT', 'RAT'],
}));

describe('GameStore', () => {
  const createMockTile = (letter: string, row: number, col: number) => ({
    id: `tile-${row}-${col}`,
    letter,
    position: { row, col },
    isSelected: false,
    isMatched: false,
    isAnimating: false,
  });

  const createMockGrid = () => [
    [createMockTile('C', 0, 0), createMockTile('A', 0, 1), createMockTile('T', 0, 2)],
    [createMockTile('D', 1, 0), createMockTile('O', 1, 1), createMockTile('G', 1, 2)],
    [createMockTile('H', 2, 0), createMockTile('A', 2, 1), createMockTile('T', 2, 2)],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({
      grid: [],
      score: 0,
      moves: 0,
      phase: 'idle',
      selectedLetters: [],
      currentWord: '',
      lastValidationError: null,
      matchedWords: [],
      combo: 0,
      highScore: 0,
      isInitialized: false,
      isDictionaryReady: true, // Enable dictionary for testing
      lastBlockedAction: null,
    });

    (getGridManager as jest.Mock).mockReturnValue({
      initialize: jest.fn().mockReturnValue(createMockGrid()),
      getGrid: jest.fn().mockReturnValue(createMockGrid()),
      clearSelectedPositions: jest.fn(),
      applyGravity: jest.fn(),
      hasValidMoves: jest.fn().mockReturnValue(true),
      areAdjacent: jest.fn().mockReturnValue(true), // Support adjacency validation
    });
  });

  describe('initGame', () => {
    it('initializes game state correctly', () => {
      useGameStore.getState().initGame();

      const state = useGameStore.getState();
      expect(state.grid.length).toBe(3);
      expect(state.score).toBe(0);
      expect(state.moves).toBe(0);
      expect(state.phase).toBe('idle');
      expect(state.isInitialized).toBe(true);
    });

    it('clears previous selection', () => {
      useGameStore.setState({
        selectedLetters: [{ row: 0, col: 0 }],
        currentWord: 'C',
      });

      useGameStore.getState().initGame();

      const state = useGameStore.getState();
      expect(state.selectedLetters).toEqual([]);
      expect(state.currentWord).toBe('');
    });
  });

  describe('toggleLetterSelection', () => {
    beforeEach(() => {
      useGameStore.setState({
        grid: createMockGrid(),
        phase: 'idle',
      });
    });

    it('adds letter to selection', () => {
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 0 });

      const state = useGameStore.getState();
      expect(state.selectedLetters).toEqual([{ row: 0, col: 0 }]);
      expect(state.currentWord).toBe('C');
    });

    it('builds word from multiple selections', () => {
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 0 });
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 1 });
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 2 });

      const state = useGameStore.getState();
      expect(state.selectedLetters.length).toBe(3);
      expect(state.currentWord).toBe('CAT');
    });

    it('deselects letter and removes subsequent selections', () => {
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 0 });
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 1 });
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 2 });
      useGameStore.getState().toggleLetterSelection({ row: 0, col: 1 }); // Deselect middle

      const state = useGameStore.getState();
      expect(state.selectedLetters).toEqual([{ row: 0, col: 0 }]);
      expect(state.currentWord).toBe('C');
    });

    it('blocks selection during validating phase', () => {
      useGameStore.setState({ phase: 'validating' });

      useGameStore.getState().toggleLetterSelection({ row: 0, col: 0 });

      const state = useGameStore.getState();
      expect(state.selectedLetters).toEqual([]);
    });
  });

  describe('submitWord', () => {
    beforeEach(() => {
      useGameStore.setState({
        grid: createMockGrid(),
        phase: 'idle',
        selectedLetters: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        currentWord: 'CAT',
      });

      (getWordValidator as jest.Mock).mockReturnValue({
        isValidWord: jest.fn().mockReturnValue(true),
      });
    });

    it('rejects words shorter than 3 letters', async () => {
      useGameStore.setState({
        selectedLetters: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        currentWord: 'CA',
      });

      await useGameStore.getState().submitWord();

      const state = useGameStore.getState();
      expect(state.lastValidationError).toBe('Word must be at least 3 letters');
      expect(state.phase).toBe('idle');
    });

    it('rejects invalid words', async () => {
      (getWordValidator as jest.Mock).mockReturnValue({
        isValidWord: jest.fn().mockReturnValue(false),
      });

      await useGameStore.getState().submitWord();

      const state = useGameStore.getState();
      expect(state.lastValidationError).toBe('"CAT" is not a valid word');
      expect(state.phase).toBe('idle');
    });

    it('blocks submission during non-idle phase', async () => {
      useGameStore.setState({ phase: 'validating' });

      await useGameStore.getState().submitWord();

      // Should remain in validating phase
      expect(useGameStore.getState().phase).toBe('validating');
    });
  });

  describe('clearSelection', () => {
    it('clears all selected letters', () => {
      useGameStore.setState({
        grid: createMockGrid(),
        phase: 'idle',
        selectedLetters: [{ row: 0, col: 0 }],
        currentWord: 'C',
      });

      useGameStore.getState().clearSelection();

      const state = useGameStore.getState();
      expect(state.selectedLetters).toEqual([]);
      expect(state.currentWord).toBe('');
    });

    it('clears validation error', () => {
      useGameStore.setState({
        grid: createMockGrid(),
        phase: 'idle',
        lastValidationError: 'Some error',
      });

      useGameStore.getState().clearSelection();

      expect(useGameStore.getState().lastValidationError).toBeNull();
    });
  });

  describe('setHighScore', () => {
    it('updates high score', () => {
      useGameStore.getState().setHighScore(100);

      expect(useGameStore.getState().highScore).toBe(100);
    });
  });

  describe('resetGame', () => {
    it('resets all state to initial values', () => {
      useGameStore.setState({
        grid: createMockGrid(),
        score: 100,
        moves: 10,
        phase: 'matching',
        isInitialized: true,
      });

      useGameStore.getState().resetGame();

      const state = useGameStore.getState();
      expect(state.grid).toEqual([]);
      expect(state.score).toBe(0);
      expect(state.moves).toBe(0);
      expect(state.phase).toBe('idle');
      expect(state.isInitialized).toBe(false);
    });
  });
});
