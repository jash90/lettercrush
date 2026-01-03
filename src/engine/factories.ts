/**
 * Engine Factory Functions
 * Creates fresh instances for testing and isolated contexts
 *
 * Use these factories when:
 * - Writing unit tests (isolated state)
 * - Creating temporary calculation contexts
 * - Needing multiple instances for parallel operations
 *
 * For production use, prefer the singleton getters:
 * - getGridManager()
 * - getWordValidator()
 * - getScoreCalculator()
 */

import { GridManager, createGridManager } from './GridManager';
import { WordValidator, createWordValidator } from './WordValidator';
import { ScoreCalculator, createScoreCalculator } from './ScoreCalculator';
import type { Language } from '../types/game.types';

// Re-export factory functions for convenience
export { createGridManager, createWordValidator, createScoreCalculator };

// Re-export classes for type usage
export type { GridManager, WordValidator, ScoreCalculator };

/**
 * Create a complete game engine context with all components
 * Useful for integration testing
 */
export interface GameEngineContext {
  gridManager: GridManager;
  wordValidator: WordValidator;
  scoreCalculator: ScoreCalculator;
}

export function createGameEngine(language: Language = 'en'): GameEngineContext {
  return {
    gridManager: createGridManager(language),
    wordValidator: createWordValidator(),
    scoreCalculator: createScoreCalculator(),
  };
}

/**
 * Create a preconfigured game engine with dictionary loaded
 */
export function createGameEngineWithDictionary(
  dictionary: string[],
  language: Language = 'en'
): GameEngineContext {
  const context = createGameEngine(language);
  context.wordValidator.loadDictionary(dictionary);
  return context;
}
