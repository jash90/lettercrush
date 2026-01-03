/**
 * Zustand Selectors
 * Memoized selectors for optimized state access
 */

import type { GameStore } from './gameStore';

// Grid selectors
export const selectGrid = (state: GameStore) => state.grid;
export const selectPhase = (state: GameStore) => state.phase;
export const selectIsInitialized = (state: GameStore) => state.isInitialized;

// Score selectors
export const selectScore = (state: GameStore) => state.score;
export const selectMoves = (state: GameStore) => state.moves;
export const selectHighScore = (state: GameStore) => state.highScore;
export const selectCombo = (state: GameStore) => state.combo;

// Score display bundle (for useShallow)
export const selectScoreDisplay = (state: GameStore) => ({
  score: state.score,
  moves: state.moves,
  highScore: state.highScore,
  combo: state.combo,
});

// Letter selection selectors
export const selectSelectedLetters = (state: GameStore) => state.selectedLetters;
export const selectCurrentWord = (state: GameStore) => state.currentWord;
export const selectValidationError = (state: GameStore) => state.lastValidationError;

// Word builder bundle (for useShallow)
export const selectWordBuilder = (state: GameStore) => ({
  selectedLetters: state.selectedLetters,
  currentWord: state.currentWord,
  validationError: state.lastValidationError,
  phase: state.phase,
});

// Match selectors
export const selectMatchedWords = (state: GameStore) => state.matchedWords;

// Action selectors (stable references)
export const selectActions = (state: GameStore) => ({
  initGame: state.initGame,
  toggleLetterSelection: state.toggleLetterSelection,
  submitWord: state.submitWord,
  clearSelection: state.clearSelection,
  resetGame: state.resetGame,
  setHighScore: state.setHighScore,
  setPhase: state.setPhase,
});

// Derived state helpers
export const selectIsValidating = (state: GameStore) => state.phase === 'validating';
export const selectIsGameOver = (state: GameStore) => state.phase === 'gameOver';
export const selectCanInteract = (state: GameStore) => state.phase === 'idle';
export const selectWordLength = (state: GameStore) => state.selectedLetters.length;
