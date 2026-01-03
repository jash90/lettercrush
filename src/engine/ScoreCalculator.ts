/**
 * ScoreCalculator - Scoring system for LetterCrush
 * Calculates points based on word length, letter values, and combos
 */

import { LETTER_SCORES, DEFAULT_CONFIG, type WordMatch } from '../types/game.types';

export interface ScoreResult {
  baseScore: number;
  lengthBonus: number;
  letterBonus: number;
  comboMultiplier: number;
  totalScore: number;
}

export class ScoreCalculator {
  private config = DEFAULT_CONFIG;

  /**
   * Calculate score for a single word
   */
  calculateWordScore(word: string, combo: number = 1): ScoreResult {
    const letters = word.toUpperCase().split('');

    // Base score for finding a word
    const baseScore = this.config.baseScore;

    // Length bonus: longer words get exponentially more points
    const lengthBonus = this.calculateLengthBonus(word.length);

    // Letter bonus: sum of individual letter values
    const letterBonus = letters.reduce((sum, letter) => {
      return sum + (LETTER_SCORES[letter] || 1);
    }, 0) * 10;

    // Combo multiplier
    const comboMultiplier = Math.pow(this.config.comboMultiplier, combo - 1);

    // Total score
    const totalScore = Math.round((baseScore + lengthBonus + letterBonus) * comboMultiplier);

    return {
      baseScore,
      lengthBonus,
      letterBonus,
      comboMultiplier,
      totalScore,
    };
  }

  /**
   * Calculate total score for multiple matched words
   */
  calculateMatchScore(matches: WordMatch[], combo: number = 1): number {
    let totalScore = 0;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const wordCombo = combo + i; // Each additional word increases combo
      const result = this.calculateWordScore(match.word, wordCombo);
      totalScore += result.totalScore;
    }

    return totalScore;
  }

  /**
   * Calculate bonus for word length
   * 3 letters: 0, 4: 50, 5: 150, 6: 300
   */
  private calculateLengthBonus(length: number): number {
    if (length <= 3) return 0;
    if (length === 4) return 50;
    if (length === 5) return 150;
    return 300 + (length - 6) * 200; // 6+ letters
  }

  /**
   * Format score for display
   */
  formatScore(score: number): string {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  }

  /**
   * Get score breakdown as formatted string
   */
  getScoreBreakdown(result: ScoreResult): string {
    const parts: string[] = [];

    parts.push(`Base: ${result.baseScore}`);

    if (result.lengthBonus > 0) {
      parts.push(`Length: +${result.lengthBonus}`);
    }

    parts.push(`Letters: +${result.letterBonus}`);

    if (result.comboMultiplier > 1) {
      parts.push(`Combo: x${result.comboMultiplier.toFixed(1)}`);
    }

    return parts.join(' | ');
  }
}

// Singleton instance
let calculatorInstance: ScoreCalculator | null = null;

export function getScoreCalculator(): ScoreCalculator {
  if (!calculatorInstance) {
    calculatorInstance = new ScoreCalculator();
  }
  return calculatorInstance;
}

/**
 * Factory function for creating new ScoreCalculator instances
 * Use for testing or when you need isolated scoring contexts
 */
export function createScoreCalculator(): ScoreCalculator {
  return new ScoreCalculator();
}
