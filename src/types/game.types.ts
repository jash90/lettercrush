/**
 * LetterCrush Game Types
 * Core type definitions for the word puzzle game
 */

// Supported languages
export type Language = 'en' | 'pl';

// Grid position
export interface CellPosition {
  row: number;
  col: number;
}

// Single tile in the grid
export interface Tile {
  id: string;
  letter: string;
  position: CellPosition;
  isSelected: boolean;
  isMatched: boolean;
  isAnimating: boolean;
  selectionOrder?: number; // Order in which tile was selected (1-based)
}

// Direction for word detection
export type Direction = 'horizontal' | 'vertical' | 'selected';

// Matched word result
export interface WordMatch {
  word: string;
  positions: CellPosition[];
  direction: Direction;
  score: number;
}

// Swap operation
export interface SwapOperation {
  from: CellPosition;
  to: CellPosition;
  isValid: boolean;
}

// Game state
export type GamePhase = 'idle' | 'selecting' | 'validating' | 'matching' | 'cascading' | 'refilling' | 'paused' | 'gameOver';

// Game over reason
export type GameOverReason = 'noMoves' | 'timeout' | 'strikes' | null;

export interface GameState {
  grid: Tile[][];
  score: number;
  moves: number;
  phase: GamePhase;
  selectedLetters: CellPosition[]; // Ordered array of selected positions
  currentWord: string;             // Built word from selected letters
  matchedWords: WordMatch[];
  combo: number;
  highScore: number;
  // Stats tracking for game over display
  wordsFound: number;              // Total words successfully submitted
  longestWord: string;             // Longest word found this game
  bestCombo: number;               // Highest combo achieved this game
  previousPhase: GamePhase | null; // Phase before pause (for resume)
}

// Game configuration
export interface GameConfig {
  gridSize: number;
  minWordLength: number;
  maxWordLength: number;
  baseScore: number;
  comboMultiplier: number;
  animationDuration: number;
}

// Default game configuration
export const DEFAULT_CONFIG: GameConfig = {
  gridSize: 6,
  minWordLength: 3,
  maxWordLength: 6,
  baseScore: 100,
  comboMultiplier: 1.5,
  animationDuration: 300,
};

// Letter frequency weights for random generation
export const LETTER_WEIGHTS: Record<string, number> = {
  A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2,
  G: 2.0, H: 6.1, I: 7.0, J: 0.15, K: 0.77, L: 4.0,
  M: 2.4, N: 6.7, O: 7.5, P: 1.9, Q: 0.095, R: 6.0,
  S: 6.3, T: 9.1, U: 2.8, V: 0.98, W: 2.4, X: 0.15,
  Y: 2.0, Z: 0.074,
};

// Score values per letter (Scrabble-inspired) - English
export const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4,
  G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
  M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1,
  S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10,
};

// Polish letter frequency weights (simplified alphabet without diacritics)
export const POLISH_LETTER_WEIGHTS: Record<string, number> = {
  A: 8.9, B: 1.5, C: 3.9, D: 3.3, E: 7.7, F: 0.3,
  G: 1.4, H: 1.1, I: 8.2, J: 2.3, K: 3.5, L: 2.1,
  M: 2.8, N: 5.5, O: 7.8, P: 3.1, R: 4.7, S: 4.3,
  T: 4.0, U: 2.5, W: 4.7, Y: 3.8, Z: 5.6,
};

// Polish letter scores (based on Polish Scrabble)
export const POLISH_LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 2, D: 2, E: 1, F: 5,
  G: 3, H: 3, I: 1, J: 3, K: 2, L: 2,
  M: 2, N: 1, O: 1, P: 2, R: 1, S: 1,
  T: 2, U: 3, W: 1, Y: 2, Z: 1,
};

// Get letter weights by language
export function getLetterWeights(language: Language): Record<string, number> {
  return language === 'pl' ? POLISH_LETTER_WEIGHTS : LETTER_WEIGHTS;
}

// Get letter scores by language
export function getLetterScores(language: Language): Record<string, number> {
  return language === 'pl' ? POLISH_LETTER_SCORES : LETTER_SCORES;
}

// High score entry
export interface HighScoreEntry {
  id: number;
  score: number;
  createdAt: string;
}

// Dictionary word entry
export interface DictionaryWord {
  id: number;
  word: string;
}
