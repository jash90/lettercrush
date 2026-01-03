/**
 * useGameActions Hook
 * Provides memoized action handlers with haptic and accessibility feedback
 * Separates action logic from state management
 */

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../stores/gameStore';
import { haptics } from '../utils/haptics';
import { gameAnnouncements } from '../utils/accessibility';
import type { CellPosition } from '../types/game.types';

interface UseGameActionsReturn {
  /** Handle letter press for word building */
  handleLetterPress: (position: CellPosition) => void;
  /** Submit the current word for validation */
  handleSubmitWord: () => Promise<void>;
  /** Clear all selected letters */
  handleClearSelection: () => void;
  /** Reset and start a new game */
  handleResetGame: () => void;
  /** Pause the game */
  handlePauseGame: () => void;
  /** Resume the game */
  handleResumeGame: () => void;
}

export function useGameActions(): UseGameActionsReturn {
  // Subscribe to actions only (stable references)
  // NOTE: We intentionally do NOT subscribe to state here to avoid stale closures.
  // Instead, we get fresh state inside callbacks using useGameStore.getState()
  const storeActions = useGameStore(
    useShallow((state) => ({
      toggleLetterSelection: state.toggleLetterSelection,
      submitWord: state.submitWord,
      clearSelection: state.clearSelection,
      initGame: state.initGame,
      pauseGame: state.pauseGame,
      resumeGame: state.resumeGame,
    }))
  );

  /**
   * Handle letter press for word building
   * Provides haptic feedback on selection
   */
  const handleLetterPress = useCallback((position: CellPosition): void => {
    // Get fresh state to check if action will be blocked
    const stateBefore = useGameStore.getState();

    storeActions.toggleLetterSelection(position);

    // Check if action was blocked
    const stateAfter = useGameStore.getState();
    if (stateAfter.lastBlockedAction &&
        stateAfter.lastBlockedAction.timestamp > (stateBefore.lastBlockedAction?.timestamp ?? 0)) {
      // Action was blocked - provide warning feedback
      haptics.warning();
    } else {
      // Normal selection feedback
      haptics.selection();
    }
  }, [storeActions]);

  /**
   * Submit the current word for validation
   * Provides haptic and accessibility feedback based on result
   * Uses fresh state to avoid stale closure issues
   */
  const handleSubmitWord = useCallback(async (): Promise<void> => {
    // Get FRESH state before submission to avoid stale closure
    const stateBefore = useGameStore.getState();
    const wordBefore = stateBefore.currentWord;
    const scoreBefore = stateBefore.score;
    const highScoreBefore = stateBefore.highScore;

    await storeActions.submitWord();

    // Get updated state after submission
    const stateAfter = useGameStore.getState();

    // Check if submission was blocked
    if (stateAfter.lastBlockedAction &&
        stateAfter.lastBlockedAction.type === 'submission' &&
        stateAfter.lastBlockedAction.timestamp > (stateBefore.lastBlockedAction?.timestamp ?? 0)) {
      // Submission was blocked - provide warning feedback
      haptics.warning();
      return;
    }

    // Provide haptic and accessibility feedback based on result
    if (stateAfter.score > scoreBefore) {
      // Word was accepted
      haptics.success();
      gameAnnouncements.wordAccepted(wordBefore, stateAfter.score - scoreBefore);

      // Check for new high score
      if (stateAfter.score > highScoreBefore && stateAfter.score === stateAfter.highScore) {
        gameAnnouncements.newHighScore(stateAfter.score);
      }
    } else if (stateAfter.lastValidationError) {
      // Word was rejected
      haptics.error();
      gameAnnouncements.wordInvalid(wordBefore);
    }

    // Check for game over
    if (stateAfter.phase === 'gameOver') {
      haptics.warning();
      gameAnnouncements.gameOver(stateAfter.score);
    }
  }, [storeActions]);

  /**
   * Clear all selected letters
   */
  const handleClearSelection = useCallback((): void => {
    storeActions.clearSelection();
  }, [storeActions]);

  /**
   * Reset and start a new game
   */
  const handleResetGame = useCallback((): void => {
    storeActions.initGame();
  }, [storeActions]);

  /**
   * Pause the game - freezes game state
   */
  const handlePauseGame = useCallback((): void => {
    haptics.selection();
    storeActions.pauseGame();
  }, [storeActions]);

  /**
   * Resume the game - restores previous phase
   */
  const handleResumeGame = useCallback((): void => {
    haptics.selection();
    storeActions.resumeGame();
  }, [storeActions]);

  return {
    handleLetterPress,
    handleSubmitWord,
    handleClearSelection,
    handleResetGame,
    handlePauseGame,
    handleResumeGame,
  };
}
