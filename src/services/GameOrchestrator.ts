/**
 * GameOrchestrator Service
 * Singleton service for coordinating game flow, phases, and animation timing
 * Separates orchestration logic from state management
 */

import type { CellPosition, GamePhase, WordMatch, Tile } from '../types/game.types';
import { getGridManager } from '../engine/GridManager';
import { getScoreCalculator } from '../engine/ScoreCalculator';
import { getWordValidator } from '../engine/WordValidator';
import { saveHighscore } from '../db';

/** Animation timing configuration */
export interface AnimationConfig {
  matchDelay: number;
  clearDelay: number;
  cascadeDelay: number;
}

/** Default animation timings */
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  matchDelay: 300,
  clearDelay: 300,
  cascadeDelay: 300,
};

/** Result of word validation */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/** Result of word processing */
export interface ProcessWordResult {
  success: boolean;
  score: number;
  newGrid: Tile[][];
  hasMovesLeft: boolean;
  match: WordMatch;
  stats: {
    wordsFound: number;
    longestWord: string;
    bestCombo: number;
  };
}

/** Callbacks for phase transitions during word processing */
export interface PhaseCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onGridUpdate: (grid: Tile[][]) => void;
  onMatchFound: (match: WordMatch) => void;
}

/** State snapshot needed for processing */
export interface GameStateSnapshot {
  selectedLetters: CellPosition[];
  currentWord: string;
  score: number;
  moves: number;
  highScore: number;
  combo: number;
  wordsFound: number;
  longestWord: string;
  bestCombo: number;
}

/**
 * GameOrchestrator - Singleton service for game flow coordination
 */
class GameOrchestrator {
  private animationConfig: AnimationConfig;

  constructor(config: Partial<AnimationConfig> = {}) {
    this.animationConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config };
  }

  /**
   * Animation delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate a word before submission
   */
  validateWord(word: string, minLength: number = 3): ValidationResult {
    if (word.length < minLength) {
      return {
        isValid: false,
        error: `Word must be at least ${minLength} letters`,
      };
    }

    const validator = getWordValidator();
    const isValid = validator.isValidWord(word);

    return {
      isValid,
      error: isValid ? null : `"${word}" is not a valid word`,
    };
  }

  /**
   * Process a submitted word with animation coordination
   * Orchestrates the full flow: matching → clearing → cascading → completion
   */
  async processWord(
    state: GameStateSnapshot,
    callbacks: PhaseCallbacks
  ): Promise<ProcessWordResult> {
    const { selectedLetters, currentWord } = state;
    const manager = getGridManager();
    const calculator = getScoreCalculator();

    // Calculate score
    const scoreResult = calculator.calculateWordScore(currentWord);
    const match: WordMatch = {
      word: currentWord,
      positions: [...selectedLetters],
      direction: 'selected',
      score: scoreResult.totalScore,
    };

    // Phase 1: Matching - show matched word
    callbacks.onMatchFound(match);
    callbacks.onPhaseChange('matching');
    await this.delay(this.animationConfig.matchDelay);

    // Phase 2: Clear selected positions
    manager.clearSelectedPositions(selectedLetters);
    callbacks.onGridUpdate(manager.getGrid());
    await this.delay(this.animationConfig.clearDelay);

    // Phase 3: Apply gravity
    callbacks.onPhaseChange('cascading');
    manager.applyGravity();
    callbacks.onGridUpdate(manager.getGrid());
    await this.delay(this.animationConfig.cascadeDelay);

    // Ensure minimum 6 selectable words after cascade
    // This uses DFS to find all 8-directional adjacent word paths
    const selectableWordCount = manager.getSelectableWordCount();
    if (selectableWordCount < 6) {
      console.log(`[GameOrchestrator] Only ${selectableWordCount} words available, regenerating grid`);
      manager.ensureMinimumWords(6);
      callbacks.onGridUpdate(manager.getGrid());
    }

    // Check if game can continue
    const hasMovesLeft = manager.hasValidMoves();

    // Calculate updated stats
    const newScore = state.score + match.score;
    const newWordsFound = state.wordsFound + 1;
    const newLongestWord = currentWord.length > state.longestWord.length
      ? currentWord
      : state.longestWord;
    const newCombo = state.combo + 1;
    const newBestCombo = newCombo > state.bestCombo ? newCombo : state.bestCombo;

    // Save high score if game is over
    if (!hasMovesLeft && newScore > 0) {
      try {
        await saveHighscore(newScore, state.moves + 1);
      } catch (err) {
        console.error('[GameOrchestrator] Failed to save highscore:', err);
      }
    }

    // Transition to final phase
    callbacks.onPhaseChange(hasMovesLeft ? 'idle' : 'gameOver');

    return {
      success: true,
      score: match.score,
      newGrid: manager.getGrid(),
      hasMovesLeft,
      match,
      stats: {
        wordsFound: newWordsFound,
        longestWord: newLongestWord,
        bestCombo: newBestCombo,
      },
    };
  }

  /**
   * Initialize a new game
   */
  initializeGame(): Tile[][] {
    const manager = getGridManager();
    return manager.initialize();
  }

  /**
   * Check if the current phase allows user interaction
   */
  canInteract(phase: GamePhase): boolean {
    return phase === 'idle';
  }

  /**
   * Check if the game is in a playing state
   */
  isPlaying(phase: GamePhase): boolean {
    return phase !== 'gameOver' && phase !== 'paused';
  }

  /**
   * Update animation configuration
   */
  setAnimationConfig(config: Partial<AnimationConfig>): void {
    this.animationConfig = { ...this.animationConfig, ...config };
  }

  /**
   * Get current animation configuration
   */
  getAnimationConfig(): AnimationConfig {
    return { ...this.animationConfig };
  }
}

// Singleton instance
let orchestratorInstance: GameOrchestrator | null = null;

/**
 * Get the singleton GameOrchestrator instance
 * Matches the pattern of getGridManager(), getWordValidator(), etc.
 */
export function getGameOrchestrator(config?: Partial<AnimationConfig>): GameOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new GameOrchestrator(config);
  } else if (config) {
    orchestratorInstance.setAnimationConfig(config);
  }
  return orchestratorInstance;
}

/**
 * Reset the orchestrator instance (for testing)
 */
export function resetGameOrchestrator(): void {
  orchestratorInstance = null;
}

/**
 * Create a new orchestrator instance (for testing with dependency injection)
 */
export function createGameOrchestrator(config?: Partial<AnimationConfig>): GameOrchestrator {
  return new GameOrchestrator(config);
}
