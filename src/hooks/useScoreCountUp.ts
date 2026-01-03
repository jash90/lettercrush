/**
 * useScoreCountUp Hook
 * Animated score count-up for game over display
 * Extracted from GameOverModal for reusability
 */

import { useState, useEffect, useRef } from 'react';

interface UseScoreCountUpOptions {
  /** Target value to count up to */
  targetValue: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of steps in the animation */
  steps?: number;
  /** Whether the animation is enabled */
  enabled?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

interface UseScoreCountUpReturn {
  /** Current display value during animation */
  displayValue: number;
  /** Whether the animation is currently running */
  isAnimating: boolean;
  /** Whether the animation has completed */
  isComplete: boolean;
  /** Reset the animation to start state */
  reset: () => void;
}

export function useScoreCountUp(options: UseScoreCountUpOptions): UseScoreCountUpReturn {
  const {
    targetValue,
    duration = 800,
    steps = 30,
    enabled = true,
    onComplete,
  } = options;

  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated without triggering animation restart
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start animation when enabled changes to true
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Reset state for new animation
    setDisplayValue(0);
    setIsAnimating(true);
    setIsComplete(false);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Handle edge case of zero target
    if (targetValue === 0) {
      setDisplayValue(0);
      setIsAnimating(false);
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const increment = targetValue / steps;
    const stepTime = duration / steps;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep++;

      if (currentStep >= steps) {
        setDisplayValue(targetValue);
        setIsAnimating(false);
        setIsComplete(true);
        onCompleteRef.current?.();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setDisplayValue(Math.floor(increment * currentStep));
      }
    }, stepTime);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, targetValue, duration, steps]);

  const reset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayValue(0);
    setIsAnimating(false);
    setIsComplete(false);
  };

  return {
    displayValue,
    isAnimating,
    isComplete,
    reset,
  };
}
