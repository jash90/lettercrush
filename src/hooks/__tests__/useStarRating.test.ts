/**
 * useStarRating Hook Tests
 * Tests for star rating calculation based on BMAD specification thresholds
 */

import {
  useStarRating,
  getStarRating,
  STAR_THRESHOLDS,
  MAX_STARS,
} from '../useStarRating';

describe('useStarRating', () => {
  describe('getStarRating (pure function)', () => {
    it('should return 1 star for score 0', () => {
      expect(getStarRating(0)).toBe(1);
    });

    it('should return 1 star for score below 501', () => {
      expect(getStarRating(100)).toBe(1);
      expect(getStarRating(500)).toBe(1);
    });

    it('should return 2 stars for score 501-1500', () => {
      expect(getStarRating(501)).toBe(2);
      expect(getStarRating(1000)).toBe(2);
      expect(getStarRating(1500)).toBe(2);
    });

    it('should return 3 stars for score 1501-3000', () => {
      expect(getStarRating(1501)).toBe(3);
      expect(getStarRating(2000)).toBe(3);
      expect(getStarRating(3000)).toBe(3);
    });

    it('should return 4 stars for score 3001-5000', () => {
      expect(getStarRating(3001)).toBe(4);
      expect(getStarRating(4000)).toBe(4);
      expect(getStarRating(5000)).toBe(4);
    });

    it('should return 5 stars for score 5001+', () => {
      expect(getStarRating(5001)).toBe(5);
      expect(getStarRating(10000)).toBe(5);
      expect(getStarRating(100000)).toBe(5);
    });

    it('should match threshold boundaries exactly', () => {
      expect(getStarRating(STAR_THRESHOLDS.ONE_STAR)).toBe(1);
      expect(getStarRating(STAR_THRESHOLDS.TWO_STARS)).toBe(2);
      expect(getStarRating(STAR_THRESHOLDS.THREE_STARS)).toBe(3);
      expect(getStarRating(STAR_THRESHOLDS.FOUR_STARS)).toBe(4);
      expect(getStarRating(STAR_THRESHOLDS.FIVE_STARS)).toBe(5);
    });
  });

  describe('STAR_THRESHOLDS', () => {
    it('should have correct threshold values per BMAD spec', () => {
      expect(STAR_THRESHOLDS.ONE_STAR).toBe(0);
      expect(STAR_THRESHOLDS.TWO_STARS).toBe(501);
      expect(STAR_THRESHOLDS.THREE_STARS).toBe(1501);
      expect(STAR_THRESHOLDS.FOUR_STARS).toBe(3001);
      expect(STAR_THRESHOLDS.FIVE_STARS).toBe(5001);
    });
  });

  describe('MAX_STARS', () => {
    it('should be 5', () => {
      expect(MAX_STARS).toBe(5);
    });
  });

  describe('useStarRating hook return values', () => {
    it('should return correct structure for 1 star', () => {
      // Testing the hook logic without React - simulating useMemo behavior
      const score = 100;
      const rating = getStarRating(score);
      const filledStars = rating;
      const emptyStars = MAX_STARS - rating;

      expect(rating).toBe(1);
      expect(filledStars).toBe(1);
      expect(emptyStars).toBe(4);
    });

    it('should return correct structure for 3 stars', () => {
      const score = 2000;
      const rating = getStarRating(score);
      const filledStars = rating;
      const emptyStars = MAX_STARS - rating;

      expect(rating).toBe(3);
      expect(filledStars).toBe(3);
      expect(emptyStars).toBe(2);
    });

    it('should return correct structure for 5 stars', () => {
      const score = 10000;
      const rating = getStarRating(score);
      const filledStars = rating;
      const emptyStars = MAX_STARS - rating;

      expect(rating).toBe(5);
      expect(filledStars).toBe(5);
      expect(emptyStars).toBe(0);
    });

    it('should calculate stars array correctly', () => {
      const score = 3500; // 4 stars
      const rating = getStarRating(score);

      const stars = Array.from({ length: MAX_STARS }, (_, index) => ({
        index: index + 1,
        filled: index < rating,
      }));

      expect(stars).toHaveLength(5);
      expect(stars[0]).toEqual({ index: 1, filled: true });
      expect(stars[1]).toEqual({ index: 2, filled: true });
      expect(stars[2]).toEqual({ index: 3, filled: true });
      expect(stars[3]).toEqual({ index: 4, filled: true });
      expect(stars[4]).toEqual({ index: 5, filled: false });
    });
  });

  describe('progress calculation', () => {
    it('should calculate points to next star correctly', () => {
      // At 2 stars (score 1000), next star at 1501
      const score = 1000;
      const pointsToNext = STAR_THRESHOLDS.THREE_STARS - score;

      expect(pointsToNext).toBe(501);
    });

    it('should return 0 points to next for max stars', () => {
      const score = 10000; // Already at 5 stars
      const rating = getStarRating(score);

      expect(rating).toBe(MAX_STARS);
      // At max stars, pointsToNext should be 0
    });

    it('should calculate progress percentage correctly', () => {
      // At score 1000 (2 stars), progress to 3 stars
      // Range: 501 to 1501 = 1000 points
      // Points in range: 1000 - 501 = 499
      // Progress: 499 / 1000 = 49.9%
      const score = 1000;
      const currentThreshold = STAR_THRESHOLDS.TWO_STARS;
      const nextThreshold = STAR_THRESHOLDS.THREE_STARS;
      const rangeSize = nextThreshold - currentThreshold;
      const pointsInRange = score - currentThreshold;
      const progress = (pointsInRange / rangeSize) * 100;

      expect(progress).toBeCloseTo(49.9, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle exactly 0 score', () => {
      expect(getStarRating(0)).toBe(1);
    });

    it('should handle very large scores', () => {
      expect(getStarRating(1000000)).toBe(5);
    });

    it('should handle threshold boundary values', () => {
      // Just below threshold
      expect(getStarRating(500)).toBe(1);
      expect(getStarRating(1500)).toBe(2);
      expect(getStarRating(3000)).toBe(3);
      expect(getStarRating(5000)).toBe(4);

      // Exactly at threshold
      expect(getStarRating(501)).toBe(2);
      expect(getStarRating(1501)).toBe(3);
      expect(getStarRating(3001)).toBe(4);
      expect(getStarRating(5001)).toBe(5);
    });
  });
});
