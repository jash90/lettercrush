/**
 * useTimer Hook
 * Manages the countdown timer for the game
 * Integrates with Zustand store for state management
 */

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../stores/gameStore';

export function useTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isTimerRunning, timeRemaining, phase, tickTimer } = useGameStore(
    useShallow((state) => ({
      isTimerRunning: state.isTimerRunning,
      timeRemaining: state.timeRemaining,
      phase: state.phase,
      tickTimer: state.tickTimer,
    }))
  );

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only run timer if game is active and timer should be running
    if (isTimerRunning && phase !== 'gameOver' && phase !== 'paused') {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerRunning, phase, tickTimer]);

  // Format time for display (M:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isTimerRunning,
    isLowTime: timeRemaining <= 30, // Last 30 seconds
    isCriticalTime: timeRemaining <= 10, // Last 10 seconds
  };
}
