/**
 * ScoreCalculator Tests
 * Tests for the scoring system including word scores, combos, and formatting
 */

import { createScoreCalculator, ScoreResult } from '../ScoreCalculator';
import { LETTER_SCORES, DEFAULT_CONFIG } from '../../types/game.types';

describe('ScoreCalculator', () => {
  let calculator: ReturnType<typeof createScoreCalculator>;

  beforeEach(() => {
    calculator = createScoreCalculator();
  });

  describe('calculateWordScore', () => {
    it('should calculate base score for minimum length word', () => {
      const result = calculator.calculateWordScore('CAT');

      expect(result.baseScore).toBe(DEFAULT_CONFIG.baseScore);
      expect(result.lengthBonus).toBe(0); // 3 letters = no bonus
      expect(result.comboMultiplier).toBe(1);
    });

    it('should add length bonus for 4-letter words', () => {
      const result = calculator.calculateWordScore('CATS');

      expect(result.lengthBonus).toBe(50);
    });

    it('should add length bonus for 5-letter words', () => {
      const result = calculator.calculateWordScore('CATCH');

      expect(result.lengthBonus).toBe(150);
    });

    it('should add length bonus for 6+ letter words', () => {
      const result6 = calculator.calculateWordScore('CACTUS');
      expect(result6.lengthBonus).toBe(300);

      const result7 = calculator.calculateWordScore('CATCHES');
      expect(result7.lengthBonus).toBe(500); // 300 + (7-6)*200
    });

    it('should calculate letter bonus based on letter values', () => {
      // CAT = C(3) + A(1) + T(1) = 5 * 10 = 50
      const result = calculator.calculateWordScore('CAT');

      const expectedLetterBonus = (LETTER_SCORES['C'] + LETTER_SCORES['A'] + LETTER_SCORES['T']) * 10;
      expect(result.letterBonus).toBe(expectedLetterBonus);
    });

    it('should apply combo multiplier correctly', () => {
      const result1 = calculator.calculateWordScore('CAT', 1);
      const result2 = calculator.calculateWordScore('CAT', 2);
      const result3 = calculator.calculateWordScore('CAT', 3);

      expect(result1.comboMultiplier).toBe(1);
      expect(result2.comboMultiplier).toBe(DEFAULT_CONFIG.comboMultiplier);
      expect(result3.comboMultiplier).toBe(Math.pow(DEFAULT_CONFIG.comboMultiplier, 2));
    });

    it('should handle uppercase conversion', () => {
      const resultLower = calculator.calculateWordScore('cat');
      const resultUpper = calculator.calculateWordScore('CAT');

      expect(resultLower.totalScore).toBe(resultUpper.totalScore);
    });

    it('should handle unknown letters with default score of 1', () => {
      // Test with a character that might not be in LETTER_SCORES
      const result = calculator.calculateWordScore('A1B');

      // Should not throw and should calculate some score
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('should calculate correct total score', () => {
      const result = calculator.calculateWordScore('CAT', 1);

      const expectedTotal = Math.round(
        (result.baseScore + result.lengthBonus + result.letterBonus) * result.comboMultiplier
      );
      expect(result.totalScore).toBe(expectedTotal);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate score for single match', () => {
      const matches = [
        { word: 'CAT', positions: [], direction: 'horizontal' as const, score: 0 }
      ];

      const score = calculator.calculateMatchScore(matches, 1);
      const singleWordScore = calculator.calculateWordScore('CAT', 1).totalScore;

      expect(score).toBe(singleWordScore);
    });

    it('should accumulate combo for multiple matches', () => {
      const matches = [
        { word: 'CAT', positions: [], direction: 'horizontal' as const, score: 0 },
        { word: 'DOG', positions: [], direction: 'vertical' as const, score: 0 },
      ];

      const score = calculator.calculateMatchScore(matches, 1);

      const firstWord = calculator.calculateWordScore('CAT', 1).totalScore;
      const secondWord = calculator.calculateWordScore('DOG', 2).totalScore;

      expect(score).toBe(firstWord + secondWord);
    });

    it('should start from provided combo value', () => {
      const matches = [
        { word: 'CAT', positions: [], direction: 'horizontal' as const, score: 0 }
      ];

      const scoreCombo1 = calculator.calculateMatchScore(matches, 1);
      const scoreCombo3 = calculator.calculateMatchScore(matches, 3);

      expect(scoreCombo3).toBeGreaterThan(scoreCombo1);
    });

    it('should return 0 for empty matches array', () => {
      const score = calculator.calculateMatchScore([], 1);
      expect(score).toBe(0);
    });
  });

  describe('formatScore', () => {
    it('should format small scores as-is', () => {
      expect(calculator.formatScore(0)).toBe('0');
      expect(calculator.formatScore(100)).toBe('100');
      expect(calculator.formatScore(999)).toBe('999');
    });

    it('should format thousands with K suffix', () => {
      expect(calculator.formatScore(1000)).toBe('1.0K');
      expect(calculator.formatScore(1500)).toBe('1.5K');
      expect(calculator.formatScore(10000)).toBe('10.0K');
      expect(calculator.formatScore(999999)).toBe('1000.0K');
    });

    it('should format millions with M suffix', () => {
      expect(calculator.formatScore(1000000)).toBe('1.0M');
      expect(calculator.formatScore(1500000)).toBe('1.5M');
      expect(calculator.formatScore(10000000)).toBe('10.0M');
    });
  });

  describe('getScoreBreakdown', () => {
    it('should include base score', () => {
      const result = calculator.calculateWordScore('CAT');
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).toContain(`Base: ${result.baseScore}`);
    });

    it('should include length bonus when present', () => {
      const result = calculator.calculateWordScore('CATS');
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).toContain(`Length: +${result.lengthBonus}`);
    });

    it('should not include length bonus for 3-letter words', () => {
      const result = calculator.calculateWordScore('CAT');
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).not.toContain('Length:');
    });

    it('should include letter bonus', () => {
      const result = calculator.calculateWordScore('CAT');
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).toContain(`Letters: +${result.letterBonus}`);
    });

    it('should include combo multiplier when greater than 1', () => {
      const result = calculator.calculateWordScore('CAT', 2);
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).toContain('Combo: x');
    });

    it('should not include combo for combo=1', () => {
      const result = calculator.calculateWordScore('CAT', 1);
      const breakdown = calculator.getScoreBreakdown(result);

      expect(breakdown).not.toContain('Combo:');
    });
  });
});
