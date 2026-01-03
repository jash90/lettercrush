/**
 * useStarRating Hook
 * Calculate star rating from score based on BMAD specification thresholds
 * Extracted from GameOverModal for reusability
 */

import { useMemo } from 'react';

/** Star rating thresholds per BMAD spec */
export const STAR_THRESHOLDS = {
  ONE_STAR: 0,
  TWO_STARS: 501,
  THREE_STARS: 1501,
  FOUR_STARS: 3001,
  FIVE_STARS: 5001,
} as const;

/** Maximum number of stars */
export const MAX_STARS = 5;

interface UseStarRatingReturn {
  /** Number of stars earned (1-5) */
  rating: number;
  /** Number of filled stars */
  filledStars: number;
  /** Number of empty stars */
  emptyStars: number;
  /** Array of star states for rendering */
  stars: { index: number; filled: boolean }[];
  /** Points needed for next star (0 if max) */
  pointsToNextStar: number;
  /** Progress percentage to next star (0-100) */
  progressToNextStar: number;
}

/**
 * Calculate star rating from score
 */
export function getStarRating(score: number): number {
  if (score >= STAR_THRESHOLDS.FIVE_STARS) return 5;
  if (score >= STAR_THRESHOLDS.FOUR_STARS) return 4;
  if (score >= STAR_THRESHOLDS.THREE_STARS) return 3;
  if (score >= STAR_THRESHOLDS.TWO_STARS) return 2;
  return 1;
}

/**
 * Get threshold for a specific star level
 */
function getThresholdForStar(star: number): number {
  switch (star) {
    case 2: return STAR_THRESHOLDS.TWO_STARS;
    case 3: return STAR_THRESHOLDS.THREE_STARS;
    case 4: return STAR_THRESHOLDS.FOUR_STARS;
    case 5: return STAR_THRESHOLDS.FIVE_STARS;
    default: return STAR_THRESHOLDS.ONE_STAR;
  }
}

/**
 * Calculate points needed for next star and progress percentage
 */
function calculateProgress(score: number, currentRating: number): { pointsToNext: number; progress: number } {
  if (currentRating >= MAX_STARS) {
    return { pointsToNext: 0, progress: 100 };
  }

  const currentThreshold = getThresholdForStar(currentRating);
  const nextThreshold = getThresholdForStar(currentRating + 1);
  const rangeSize = nextThreshold - currentThreshold;
  const pointsInRange = score - currentThreshold;
  const pointsToNext = nextThreshold - score;
  const progress = Math.min(100, Math.max(0, (pointsInRange / rangeSize) * 100));

  return { pointsToNext, progress };
}

export function useStarRating(score: number): UseStarRatingReturn {
  return useMemo(() => {
    const rating = getStarRating(score);
    const filledStars = rating;
    const emptyStars = MAX_STARS - rating;
    const { pointsToNext, progress } = calculateProgress(score, rating);

    const stars = Array.from({ length: MAX_STARS }, (_, index) => ({
      index: index + 1,
      filled: index < rating,
    }));

    return {
      rating,
      filledStars,
      emptyStars,
      stars,
      pointsToNextStar: pointsToNext,
      progressToNextStar: progress,
    };
  }, [score]);
}
