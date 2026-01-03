/**
 * Zustand Game Store
 * Central state management for LetterCrush game
 * Letter-by-letter selection mechanics
 */

import { create } from 'zustand';
import type {
  Tile,
  CellPosition,
  WordMatch,
  GamePhase,
  GameOverReason,
} from '../types/game.types';
import { getGridManager } from '../engine/GridManager';
import { getWordValidator } from '../engine/WordValidator';
import { getGameOrchestrator } from '../services/GameOrchestrator';
import { saveHighscore } from '../db';

// Blocked action feedback type
export interface BlockedAction {
  type: 'selection' | 'submission' | 'clear';
  reason: string;
  timestamp: number;
}

// Exported for use in selectors
export interface GameStore {
  // State
  grid: Tile[][];
  score: number;
  moves: number;
  phase: GamePhase;
  selectedLetters: CellPosition[];  // Ordered array of selected positions
  currentWord: string;              // Built word from selected letters
  lastValidationError: string | null;
  matchedWords: WordMatch[];
  combo: number;
  highScore: number;
  isInitialized: boolean;
  // Stats tracking for game over display
  wordsFound: number;
  longestWord: string;
  bestCombo: number;
  previousPhase: GamePhase | null;
  // NEW: Feedback and dictionary state
  lastBlockedAction: BlockedAction | null;
  isDictionaryReady: boolean;
  // Animated match display
  displayedMatch: WordMatch | null;
  // Timer state
  timeRemaining: number;
  isTimerRunning: boolean;
  // Strikes state
  strikes: number;
  maxStrikes: number;
  // Game over reason
  gameOverReason: GameOverReason;

  // Actions
  initGame: () => void;
  toggleLetterSelection: (position: CellPosition) => void;
  submitWord: () => Promise<void>;
  clearSelection: () => void;
  processSelectedWord: () => Promise<void>;
  resetGame: () => void;
  setHighScore: (score: number) => void;
  setPhase: (phase: GamePhase) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  // NEW: Feedback and recovery actions
  setDictionaryReady: (ready: boolean) => void;
  setBlockedAction: (type: BlockedAction['type'], reason: string) => void;
  clearBlockedAction: () => void;
  forceRecoverPhase: () => void;
  // Animated match display actions
  setDisplayedMatch: (match: WordMatch | null) => void;
  clearDisplayedMatch: () => void;
  // Timer actions
  tickTimer: () => void;
}

// Helper to build word from selected positions
function buildWordFromPositions(grid: Tile[][], positions: CellPosition[]): string {
  return positions.map(pos => grid[pos.row][pos.col].letter).join('');
}

// Helper to check if position is in array
function isPositionSelected(positions: CellPosition[], pos: CellPosition): boolean {
  return positions.some(p => p.row === pos.row && p.col === pos.col);
}

// Helper to get selection order (1-based)
function getSelectionOrder(positions: CellPosition[], pos: CellPosition): number {
  const index = positions.findIndex(p => p.row === pos.row && p.col === pos.col);
  return index >= 0 ? index + 1 : 0;
}

// Optimized tile update - preserves reference if no change needed
function updateTileSelection(
  tile: Tile,
  isSelected: boolean,
  selectionOrder: number | undefined
): Tile {
  // Preserve reference if no change - prevents unnecessary re-renders
  if (tile.isSelected === isSelected && tile.selectionOrder === selectionOrder) {
    return tile;
  }
  return {
    ...tile,
    isSelected,
    selectionOrder,
  };
}

// Structural sharing for grid updates - only creates new row arrays for changed rows
function updateGridWithStructuralSharing(
  oldGrid: Tile[][],
  newGrid: Tile[][]
): Tile[][] {
  if (oldGrid.length === 0) {
    return newGrid.map(row => [...row]);
  }

  return newGrid.map((newRow, rowIndex) => {
    const oldRow = oldGrid[rowIndex];

    // Check if row has any changes
    const hasChanges = newRow.some((tile, colIndex) => {
      const oldTile = oldRow?.[colIndex];
      if (!oldTile) return true;
      return (
        tile.letter !== oldTile.letter ||
        tile.isSelected !== oldTile.isSelected ||
        tile.isMatched !== oldTile.isMatched ||
        tile.selectionOrder !== oldTile.selectionOrder
      );
    });

    // Preserve row reference if unchanged
    return hasChanges ? [...newRow] : oldRow;
  });
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
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
  // Stats tracking
  wordsFound: 0,
  longestWord: '',
  bestCombo: 0,
  previousPhase: null,
  // Feedback and dictionary state
  lastBlockedAction: null,
  isDictionaryReady: false,
  // Animated match display
  displayedMatch: null,
  // Timer state
  timeRemaining: 120,
  isTimerRunning: false,
  // Strikes state
  strikes: 0,
  maxStrikes: 3,
  // Game over reason
  gameOverReason: null,

  // Initialize game
  initGame: () => {
    const manager = getGridManager();
    const grid = manager.initialize();

    set({
      grid: [...grid],
      score: 0,
      moves: 0,
      phase: 'idle',
      selectedLetters: [],
      currentWord: '',
      lastValidationError: null,
      matchedWords: [],
      combo: 0,
      isInitialized: true,
      // Reset stats
      wordsFound: 0,
      longestWord: '',
      bestCombo: 0,
      previousPhase: null,
      // Reset timer and strikes
      timeRemaining: 120,
      isTimerRunning: true,
      strikes: 0,
      gameOverReason: null,
    });
  },

  // Toggle letter selection
  toggleLetterSelection: (position: CellPosition) => {
    const { selectedLetters, grid, phase, isDictionaryReady } = get();

    // Block with feedback during non-idle phases
    if (phase !== 'idle') {
      const reasonMap: Record<GamePhase, string> = {
        'validating': 'Please wait, checking word...',
        'matching': 'Please wait, matching in progress...',
        'cascading': 'Please wait, tiles are falling...',
        'refilling': 'Please wait, refilling grid...',
        'paused': 'Game is paused',
        'gameOver': 'Game is over',
        'selecting': 'Selection in progress',
        'idle': '',
      };

      set({
        lastBlockedAction: {
          type: 'selection',
          reason: reasonMap[phase] || 'Please wait...',
          timestamp: Date.now(),
        },
      });
      console.log('[toggleLetterSelection] Blocked - phase:', phase);
      return;
    }

    // Block if dictionary not ready
    if (!isDictionaryReady) {
      set({
        lastBlockedAction: {
          type: 'selection',
          reason: 'Loading dictionary...',
          timestamp: Date.now(),
        },
      });
      console.log('[toggleLetterSelection] Blocked - dictionary not ready');
      return;
    }

    // Clear any previous blocked action
    set({ lastBlockedAction: null });

    const isAlreadySelected = isPositionSelected(selectedLetters, position);
    let newSelectedLetters: CellPosition[];

    if (isAlreadySelected) {
      // Deselect: remove this position and all positions selected after it
      const index = selectedLetters.findIndex(
        p => p.row === position.row && p.col === position.col
      );
      newSelectedLetters = selectedLetters.slice(0, index);
    } else {
      // Select: add to selection - but first check adjacency
      if (selectedLetters.length > 0) {
        const lastSelected = selectedLetters[selectedLetters.length - 1];
        const manager = getGridManager();
        if (!manager.areAdjacent(lastSelected, position)) {
          // Not adjacent to the last selected letter
          set({ lastValidationError: 'Letters must be adjacent' });
          return;
        }
      }
      newSelectedLetters = [...selectedLetters, position];
    }

    // Optimized grid update - only creates new objects for tiles that changed
    const newGrid = grid.map((row, rowIndex) =>
      row.map((tile, colIndex) => {
        const pos = { row: rowIndex, col: colIndex };
        const isSelected = isPositionSelected(newSelectedLetters, pos);
        const order = isSelected ? getSelectionOrder(newSelectedLetters, pos) : undefined;
        // Use optimized helper that preserves reference if unchanged
        return updateTileSelection(tile, isSelected, order);
      })
    );

    const newWord = buildWordFromPositions(newGrid, newSelectedLetters);

    set({
      grid: newGrid,
      selectedLetters: newSelectedLetters,
      currentWord: newWord,
      lastValidationError: null, // Clear error on new selection
    });
  },

  // Submit word for validation
  submitWord: async () => {
    const { selectedLetters, currentWord, phase, isDictionaryReady } = get();

    // Block with feedback during non-idle phases
    if (phase !== 'idle') {
      const reasonMap: Record<GamePhase, string> = {
        'validating': 'Already checking word...',
        'matching': 'Processing match...',
        'cascading': 'Tiles falling...',
        'refilling': 'Refilling grid...',
        'paused': 'Game is paused',
        'gameOver': 'Game is over',
        'selecting': 'Selection in progress',
        'idle': '',
      };

      set({
        lastBlockedAction: {
          type: 'submission',
          reason: reasonMap[phase] || 'Please wait...',
          timestamp: Date.now(),
        },
      });
      console.log('[submitWord] Blocked - phase:', phase);
      return;
    }

    // Block if dictionary not ready
    if (!isDictionaryReady) {
      set({
        lastBlockedAction: {
          type: 'submission',
          reason: 'Dictionary loading...',
          timestamp: Date.now(),
        },
      });
      console.log('[submitWord] Blocked - dictionary not ready');
      return;
    }

    // Clear any blocked action
    set({ lastBlockedAction: null });

    if (selectedLetters.length < 3) {
      set({ lastValidationError: 'Word must be at least 3 letters' });
      return;
    }

    set({ phase: 'validating' });

    try {
      // Validate word
      const validator = getWordValidator();
      const isValid = validator.isValidWord(currentWord);

      if (!isValid) {
        const currentStrikes = get().strikes;
        const newStrikes = currentStrikes + 1;
        const maxStrikes = get().maxStrikes;

        if (newStrikes >= maxStrikes) {
          // 3 strikes = game over
          const { score, moves } = get();
          set({
            phase: 'gameOver',
            strikes: newStrikes,
            gameOverReason: 'strikes',
            isTimerRunning: false,
            lastValidationError: `"${currentWord}" is not a valid word. Strike ${newStrikes}/${maxStrikes}!`,
          });
          // Save highscore
          if (score > 0) {
            saveHighscore(score, moves).catch(err => {
              console.error('[gameStore] Failed to save highscore on strikes:', err);
            });
          }
        } else {
          set({
            phase: 'idle',
            strikes: newStrikes,
            lastValidationError: `"${currentWord}" is not a valid word. Strike ${newStrikes}/${maxStrikes}`,
          });
        }
        return;
      }

      // Word is valid - process it
      set({ lastValidationError: null });
      await get().processSelectedWord();
    } catch (error) {
      // Error recovery - reset to idle phase
      console.error('[submitWord] Error during submission:', error);
      set({
        phase: 'idle',
        lastValidationError: 'An error occurred. Please try again.',
      });
    }
  },

  // Clear current selection
  clearSelection: () => {
    const { grid, phase } = get();

    // Only allow clearing in idle phase
    if (phase !== 'idle') {
      return;
    }

    // Clear selection from grid - only update tiles that were selected
    const newGrid = grid.map(row =>
      row.map(tile => updateTileSelection(tile, false, undefined))
    );

    set({
      grid: newGrid,
      selectedLetters: [],
      currentWord: '',
      lastValidationError: null,
    });
  },

  // Process selected word (delegated to GameOrchestrator for flow coordination)
  processSelectedWord: async () => {
    const state = get();
    const orchestrator = getGameOrchestrator();

    // Create state snapshot for orchestrator
    const snapshot = {
      selectedLetters: state.selectedLetters,
      currentWord: state.currentWord,
      score: state.score,
      moves: state.moves,
      highScore: state.highScore,
      combo: state.combo,
      wordsFound: state.wordsFound,
      longestWord: state.longestWord,
      bestCombo: state.bestCombo,
    };

    // 10-second timeout for phase recovery
    const timeoutId = setTimeout(() => {
      const currentPhase = get().phase;
      if (currentPhase !== 'idle' && currentPhase !== 'paused' && currentPhase !== 'gameOver') {
        console.warn('[processSelectedWord] Timeout - forcing phase recovery from:', currentPhase);
        set({ phase: 'idle' });
      }
    }, 10000);

    try {
      // Process word with phase callbacks for animation coordination
      const result = await orchestrator.processWord(snapshot, {
        onPhaseChange: (phase) => set({ phase }),
        onGridUpdate: (grid) => set((s) => ({
          grid: updateGridWithStructuralSharing(s.grid, grid),
        })),
        onMatchFound: (match) => {
          set({ matchedWords: [match], displayedMatch: match });
          // Auto-clear displayedMatch after 2.5s for animation
          setTimeout(() => {
            set({ displayedMatch: null });
          }, 2500);
        },
      });

      clearTimeout(timeoutId);

      // Update state with results
      set((s) => ({
        score: s.score + result.score,
        moves: s.moves + 1,
        highScore: Math.max(s.highScore, s.score + result.score),
        matchedWords: [],
        selectedLetters: [],
        currentWord: '',
        combo: s.combo + 1,
        wordsFound: result.stats.wordsFound,
        longestWord: result.stats.longestWord,
        bestCombo: result.stats.bestCombo,
        phase: 'idle', // Ensure we return to idle
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[processSelectedWord] Error:', error);
      // Recover to idle state
      set({
        phase: 'idle',
        matchedWords: [],
        selectedLetters: [],
        currentWord: '',
      });
    }
  },

  // Reset game
  resetGame: () => {
    // Reset all state and immediately start a new game
    get().initGame();
  },

  // Set high score
  setHighScore: (score: number) => {
    set({ highScore: score });
  },

  // Set phase
  setPhase: (phase: GamePhase) => {
    set({ phase });
  },

  // Pause game - saves current phase and freezes game state
  pauseGame: () => {
    const { phase } = get();
    // Only allow pausing during active gameplay phases
    if (phase === 'idle' || phase === 'selecting') {
      set({
        previousPhase: phase,
        phase: 'paused',
        isTimerRunning: false,
      });
    }
  },

  // Resume game - restores previous phase
  resumeGame: () => {
    const { previousPhase } = get();
    if (previousPhase) {
      set({
        phase: previousPhase,
        previousPhase: null,
        isTimerRunning: true,
      });
    } else {
      // Fallback to idle if no previous phase
      set({
        phase: 'idle',
        previousPhase: null,
        isTimerRunning: true,
      });
    }
  },

  // NEW: Set dictionary ready state
  setDictionaryReady: (ready: boolean) => {
    set({ isDictionaryReady: ready });
    if (ready) {
      // Clear any dictionary-related blocked action
      const { lastBlockedAction } = get();
      if (lastBlockedAction?.reason.includes('dictionary') || lastBlockedAction?.reason.includes('Loading')) {
        set({ lastBlockedAction: null });
      }
    }
  },

  // NEW: Set blocked action with type and reason
  setBlockedAction: (type: BlockedAction['type'], reason: string) => {
    set({
      lastBlockedAction: {
        type,
        reason,
        timestamp: Date.now(),
      },
    });
  },

  // NEW: Clear blocked action
  clearBlockedAction: () => {
    set({ lastBlockedAction: null });
  },

  // NEW: Force recover phase - emergency recovery from stuck states
  forceRecoverPhase: () => {
    const { phase } = get();
    // Only recover from non-terminal phases
    if (phase !== 'idle' && phase !== 'paused' && phase !== 'gameOver') {
      console.warn('[forceRecoverPhase] Forcing recovery from phase:', phase);
      set({
        phase: 'idle',
        matchedWords: [],
        lastBlockedAction: null,
      });
    }
  },

  // Animated match display actions
  setDisplayedMatch: (match: WordMatch | null) => {
    set({ displayedMatch: match });
  },

  clearDisplayedMatch: () => {
    set({ displayedMatch: null });
  },

  // Timer tick - called every second
  tickTimer: () => {
    const { timeRemaining, phase } = get();

    // Don't tick if game is already over or paused
    if (phase === 'gameOver' || phase === 'paused') {
      return;
    }

    if (timeRemaining <= 1) {
      // Time's up - game over
      const { score, moves } = get();
      set({
        timeRemaining: 0,
        isTimerRunning: false,
        phase: 'gameOver',
        gameOverReason: 'timeout',
      });
      // Save highscore
      if (score > 0) {
        saveHighscore(score, moves).catch(err => {
          console.error('[gameStore] Failed to save highscore on timeout:', err);
        });
      }
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },
}));
