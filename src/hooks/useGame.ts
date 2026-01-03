/**
 * useGame Hook - Facade Pattern
 * Thin composition layer that delegates to specialized hooks
 * Maintains backward-compatible API for consumers
 *
 * Refactored from 252-line monolith to ~80-line facade
 * Uses:
 * - useGameInit: Initialization and language management
 * - useGameActions: Action handlers with feedback
 * - gameStore: Direct state subscription for optimal re-renders
 */

import { useShallow } from 'zustand/react/shallow';
import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useGameInit } from './useGameInit';
import { useGameActions } from './useGameActions';
import { useTimer } from './useTimer';
import { getGridManager } from '../engine/GridManager';
import { CellPosition } from '../types/game.types';

/**
 * Main game hook - provides all game state and actions
 * This is a facade that composes specialized hooks while
 * maintaining backward compatibility with existing consumers.
 */
export function useGame() {
  // ============ INITIALIZATION ============
  // Handles database, language, dictionary, and game setup
  const {
    isInitialized: initIsInitialized,
    language,
    changeLanguage,
  } = useGameInit();

  // ============ ACTIONS ============
  // Provides memoized action handlers with haptic/accessibility feedback
  const {
    handleLetterPress,
    handleSubmitWord,
    handleClearSelection,
    handleResetGame,
    handlePauseGame,
    handleResumeGame,
  } = useGameActions();

  // ============ TIMER ============
  // Manages countdown timer with formatting
  const {
    formattedTime,
    isLowTime,
    isCriticalTime,
  } = useTimer();

  // ============ GAME STATE ============
  // Optimized state subscription - only re-renders when these specific values change
  const gameState = useGameStore(
    useShallow((state) => ({
      grid: state.grid,
      score: state.score,
      moves: state.moves,
      highScore: state.highScore,
      combo: state.combo,
      phase: state.phase,
      isInitialized: state.isInitialized,
      matchedWords: state.matchedWords,
      selectedLetters: state.selectedLetters,
      currentWord: state.currentWord,
      lastValidationError: state.lastValidationError,
      wordsFound: state.wordsFound,
      longestWord: state.longestWord,
      bestCombo: state.bestCombo,
      // NEW: Feedback and dictionary state for UI awareness
      isDictionaryReady: state.isDictionaryReady,
      lastBlockedAction: state.lastBlockedAction,
      // Animated match display
      displayedMatch: state.displayedMatch,
      // Timer and strikes
      timeRemaining: state.timeRemaining,
      strikes: state.strikes,
      maxStrikes: state.maxStrikes,
      gameOverReason: state.gameOverReason,
    }))
  );

  // Compute blocked reason for display
  const blockedReason = gameState.lastBlockedAction?.reason ?? null;

  // ============ DEBUG MODE ============
  const [debugHints, setDebugHints] = useState<CellPosition[]>([]);

  useEffect(() => {
    // Only run in DEV mode
    if (__DEV__ && gameState.grid.length > 0) {
      // Calculate hints in a timeout to not block the main thread immediately
      const timer = setTimeout(() => {
        const manager = getGridManager();
        // Use the new method to find words
        const matches = manager.findStraightLineWords();
        
        // Filter matches to reduce noise in debug view
        // 1. Prefer words length >= 4
        let interestingMatches = matches.filter(m => m.word.length >= 4);
        
        // 2. If too few interesting matches, allow length 3
        if (interestingMatches.length === 0) {
           interestingMatches = matches;
        }

        // Collect all unique positions that are part of valid words
        const uniquePos = new Set<string>();
        const hints: CellPosition[] = [];
        
        interestingMatches.forEach(m => {
          m.positions.forEach(p => {
            const key = `${p.row},${p.col}`;
            if (!uniquePos.has(key)) {
              uniquePos.add(key);
              hints.push(p);
            }
          });
        });
        
        setDebugHints(hints);
      }, 500); // 500ms delay to avoid stuttering during interaction

      return () => clearTimeout(timer);
    } else {
      setDebugHints([]);
    }
  }, [gameState.grid, gameState.phase]); // Recalculate when grid changes

  // ============ RETURN (BACKWARD COMPATIBLE) ============
  // Preserves exact same interface as original hook for zero breaking changes
  return {
    // Grid state
    grid: gameState.grid,
    score: gameState.score,
    moves: gameState.moves,
    highScore: gameState.highScore,
    combo: gameState.combo,
    phase: gameState.phase,
    isInitialized: gameState.isInitialized,
    matchedWords: gameState.matchedWords,

    // Letter selection state
    selectedLetters: gameState.selectedLetters,
    currentWord: gameState.currentWord,
    validationError: gameState.lastValidationError,

    // Game stats (for game over display)
    wordsFound: gameState.wordsFound,
    longestWord: gameState.longestWord,
    bestCombo: gameState.bestCombo,

    // Language
    language,

    // NEW: Feedback state for UI
    isDictionaryReady: gameState.isDictionaryReady,
    blockedReason,

    // Animated match display
    displayedMatch: gameState.displayedMatch,

    // Timer
    timeRemaining: gameState.timeRemaining,
    formattedTime,
    isLowTime,
    isCriticalTime,

    // Strikes
    strikes: gameState.strikes,
    maxStrikes: gameState.maxStrikes,

    // Game over reason
    gameOverReason: gameState.gameOverReason,

    // Debug
    debugHints,

    // Actions - mapped to backward-compatible names
    handleLetterPress,
    submitWord: handleSubmitWord,
    clearSelection: handleClearSelection,
    resetGame: handleResetGame,
    changeLanguage,
    pauseGame: handlePauseGame,
    resumeGame: handleResumeGame,
  };
}
