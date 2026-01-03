/**
 * Board Generator Quality Tests
 * Verifies that generated boards contain at least 6 valid words
 */

import { getGridManager, resetGridManager } from '../GridManager';
import { getWordValidator, resetWordValidator } from '../WordValidator';
import { getDictionary } from '../../data/dictionaries';

describe('BoardGenerator', () => {
  beforeAll(() => {
    // Initialize dictionary once for all tests
    const validator = getWordValidator();
    validator.loadDictionary(getDictionary('en'));
  });

  beforeEach(() => {
    resetGridManager();
  });

  afterAll(() => {
    resetWordValidator();
    resetGridManager();
  });

  describe('word availability guarantee', () => {
    it('should generate boards with at least 6 valid words (10 iterations)', () => {
      const iterations = 10;
      const minRequiredWords = 6;

      for (let i = 0; i < iterations; i++) {
        resetGridManager();
        const manager = getGridManager();
        manager.initialize(minRequiredWords);

        const validWordCount = manager.getSelectableWordCount();

        expect(validWordCount).toBeGreaterThanOrEqual(minRequiredWords);
      }
    }, 30000); // 30s timeout for dictionary validation

    it('should find words using 8-directional DFS paths', () => {
      const manager = getGridManager();
      manager.initialize(6);

      const words = manager.findAllPossibleWords();

      // All found words must be at least 3 characters
      words.forEach(word => {
        expect(word.length).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
