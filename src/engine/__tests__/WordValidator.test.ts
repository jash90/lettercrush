/**
 * WordValidator Tests
 * Tests for the Trie-based dictionary and word validation
 */

import { createWordValidator } from '../WordValidator';

describe('WordValidator', () => {
  let validator: ReturnType<typeof createWordValidator>;

  beforeEach(() => {
    validator = createWordValidator();
  });

  describe('addWord', () => {
    it('should add a valid word to the dictionary', () => {
      validator.addWord('CAT');

      expect(validator.isValidWord('CAT')).toBe(true);
      expect(validator.getWordCount()).toBe(1);
    });

    it('should ignore words shorter than 3 characters', () => {
      validator.addWord('A');
      validator.addWord('AB');

      expect(validator.getWordCount()).toBe(0);
      expect(validator.isValidWord('A')).toBe(false);
      expect(validator.isValidWord('AB')).toBe(false);
    });

    it('should convert words to uppercase', () => {
      validator.addWord('cat');

      expect(validator.isValidWord('CAT')).toBe(true);
      expect(validator.isValidWord('cat')).toBe(true);
    });

    it('should not increment count for duplicate words', () => {
      validator.addWord('CAT');
      validator.addWord('CAT');
      validator.addWord('cat');

      expect(validator.getWordCount()).toBe(1);
    });

    it('should handle multiple unique words', () => {
      validator.addWord('CAT');
      validator.addWord('DOG');
      validator.addWord('BIRD');

      expect(validator.getWordCount()).toBe(3);
    });
  });

  describe('loadDictionary', () => {
    it('should load multiple words from array', () => {
      validator.loadDictionary(['CAT', 'DOG', 'BIRD', 'FISH']);

      expect(validator.getWordCount()).toBe(4);
      expect(validator.isValidWord('CAT')).toBe(true);
      expect(validator.isValidWord('FISH')).toBe(true);
    });

    it('should reset dictionary on load', () => {
      validator.addWord('EXISTING');
      validator.loadDictionary(['NEW', 'WORDS']);

      expect(validator.isValidWord('EXISTING')).toBe(false);
      expect(validator.getWordCount()).toBe(2);
    });

    it('should filter out short words', () => {
      validator.loadDictionary(['A', 'AB', 'CAT', 'DOGS']);

      expect(validator.getWordCount()).toBe(2);
    });

    it('should handle empty array', () => {
      validator.loadDictionary([]);

      expect(validator.getWordCount()).toBe(0);
    });
  });

  describe('isValidWord', () => {
    beforeEach(() => {
      validator.loadDictionary(['CAT', 'CATS', 'CATCH', 'DOG']);
    });

    it('should return true for valid words', () => {
      expect(validator.isValidWord('CAT')).toBe(true);
      expect(validator.isValidWord('CATS')).toBe(true);
      expect(validator.isValidWord('DOG')).toBe(true);
    });

    it('should return false for invalid words', () => {
      expect(validator.isValidWord('BIRD')).toBe(false);
      expect(validator.isValidWord('CATZ')).toBe(false);
    });

    it('should return false for words shorter than 3 characters', () => {
      expect(validator.isValidWord('CA')).toBe(false);
      expect(validator.isValidWord('A')).toBe(false);
      expect(validator.isValidWord('')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validator.isValidWord('cat')).toBe(true);
      expect(validator.isValidWord('Cat')).toBe(true);
      expect(validator.isValidWord('CAT')).toBe(true);
    });

    it('should return false for prefixes that are not complete words', () => {
      expect(validator.isValidWord('CATC')).toBe(false);
    });
  });

  describe('hasPrefix', () => {
    beforeEach(() => {
      validator.loadDictionary(['CAT', 'CATS', 'CATCH', 'CATCHER']);
    });

    it('should return true for valid prefixes', () => {
      expect(validator.hasPrefix('C')).toBe(true);
      expect(validator.hasPrefix('CA')).toBe(true);
      expect(validator.hasPrefix('CAT')).toBe(true);
      expect(validator.hasPrefix('CATC')).toBe(true);
    });

    it('should return false for invalid prefixes', () => {
      expect(validator.hasPrefix('D')).toBe(false);
      expect(validator.hasPrefix('CZ')).toBe(false);
      expect(validator.hasPrefix('CATCHER_X')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validator.hasPrefix('c')).toBe(true);
      expect(validator.hasPrefix('ca')).toBe(true);
      expect(validator.hasPrefix('Cat')).toBe(true);
    });

    it('should return false for empty prefix with no words', () => {
      const emptyValidator = createWordValidator();
      expect(emptyValidator.hasPrefix('A')).toBe(false);
    });
  });

  describe('findWordsWithPrefix', () => {
    beforeEach(() => {
      validator.loadDictionary(['CAT', 'CATS', 'CATCH', 'CATCHER', 'DOG']);
    });

    it('should find all words with a given prefix', () => {
      const words = validator.findWordsWithPrefix('CAT', 10);

      expect(words).toContain('CAT');
      expect(words).toContain('CATS');
      expect(words).toContain('CATCH');
      expect(words).toContain('CATCHER');
      expect(words).not.toContain('DOG');
    });

    it('should respect maxResults limit', () => {
      const words = validator.findWordsWithPrefix('CAT', 2);

      expect(words.length).toBe(2);
    });

    it('should return empty array for non-existent prefix', () => {
      const words = validator.findWordsWithPrefix('XYZ');

      expect(words).toEqual([]);
    });

    it('should be case insensitive', () => {
      const wordsUpper = validator.findWordsWithPrefix('CAT', 10);
      const wordsLower = validator.findWordsWithPrefix('cat', 10);

      expect(wordsUpper.sort()).toEqual(wordsLower.sort());
    });

    it('should use default maxResults of 10', () => {
      // Add more words to test default limit
      const manyWords = Array.from({ length: 15 }, (_, i) => `TEST${i.toString().padStart(3, '0')}`);
      validator.loadDictionary(manyWords);

      const words = validator.findWordsWithPrefix('TEST');

      expect(words.length).toBe(10);
    });
  });

  describe('getWordCount', () => {
    it('should return 0 for empty dictionary', () => {
      expect(validator.getWordCount()).toBe(0);
    });

    it('should return correct count after adding words', () => {
      validator.addWord('CAT');
      expect(validator.getWordCount()).toBe(1);

      validator.addWord('DOG');
      expect(validator.getWordCount()).toBe(2);
    });

    it('should return correct count after loading dictionary', () => {
      validator.loadDictionary(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']);

      expect(validator.getWordCount()).toBe(5);
    });
  });

  describe('Trie structure', () => {
    it('should efficiently share prefixes', () => {
      validator.loadDictionary(['CAT', 'CAR', 'CARD', 'CARE', 'CAREFUL']);

      // All words should be valid
      expect(validator.isValidWord('CAT')).toBe(true);
      expect(validator.isValidWord('CAR')).toBe(true);
      expect(validator.isValidWord('CARD')).toBe(true);
      expect(validator.isValidWord('CARE')).toBe(true);
      expect(validator.isValidWord('CAREFUL')).toBe(true);

      // Prefix should be shared
      expect(validator.hasPrefix('CA')).toBe(true);
      expect(validator.hasPrefix('CAR')).toBe(true);
      expect(validator.hasPrefix('CARE')).toBe(true);
    });

    it('should handle completely different words', () => {
      validator.loadDictionary(['APPLE', 'BANANA', 'CHERRY']);

      expect(validator.isValidWord('APPLE')).toBe(true);
      expect(validator.isValidWord('BANANA')).toBe(true);
      expect(validator.isValidWord('CHERRY')).toBe(true);

      expect(validator.hasPrefix('A')).toBe(true);
      expect(validator.hasPrefix('B')).toBe(true);
      expect(validator.hasPrefix('C')).toBe(true);
    });
  });

  describe('Language-specific validation', () => {
    // Import actual dictionaries for language-specific tests
    const { POLISH_DICTIONARY, ENGLISH_DICTIONARY } = require('../../data/dictionaries');

    describe('Polish language mode', () => {
      beforeEach(() => {
        validator.loadDictionary(POLISH_DICTIONARY);
      });

      it('should accept common Polish words', () => {
        // Common Polish words that should be in the dictionary
        const polishWords = ['KOT', 'PIES', 'DOM', 'OKO', 'NOS', 'KINO', 'MAMA', 'TATA'];

        polishWords.forEach(word => {
          expect(validator.isValidWord(word)).toBe(true);
        });
      });

      it('should reject English-only words not in Polish', () => {
        // English words that do NOT exist in Polish
        const englishOnlyWords = ['THE', 'AND', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM'];

        englishOnlyWords.forEach(word => {
          expect(validator.isValidWord(word)).toBe(false);
        });
      });

      it('should accept Polish words with diacritics base forms', () => {
        // Words that use Polish letters (testing base forms commonly found)
        const polishSpecificWords = ['TAK', 'NIE', 'JAK', 'ALE', 'CZY', 'TEN', 'TYM'];

        polishSpecificWords.forEach(word => {
          expect(validator.isValidWord(word)).toBe(true);
        });
      });

      it('should have loaded approximately 100k Polish words', () => {
        const wordCount = validator.getWordCount();
        // Polish dictionary should have ~100,000+ words (minus words < 3 chars)
        expect(wordCount).toBeGreaterThan(90000);
        expect(wordCount).toBeLessThan(110000);
      });
    });

    describe('English language mode', () => {
      beforeEach(() => {
        validator.loadDictionary(ENGLISH_DICTIONARY);
      });

      it('should accept common English words', () => {
        const englishWords = ['THE', 'AND', 'CAT', 'DOG', 'HOUSE', 'WORD', 'GAME'];

        englishWords.forEach(word => {
          expect(validator.isValidWord(word)).toBe(true);
        });
      });

      it('should reject Polish-only words not in English', () => {
        // Polish words that do NOT exist in English
        // Note: 'ALE' excluded because it's an English word (type of beer)
        // Note: 'KINO' excluded because it's an English word (type of tree gum)
        const polishOnlyWords = ['TAK', 'NIE', 'CZY', 'PIES'];

        polishOnlyWords.forEach(word => {
          expect(validator.isValidWord(word)).toBe(false);
        });
      });

      it('should have loaded approximately 38k English words', () => {
        const wordCount = validator.getWordCount();
        // English dictionary should have ~38,000 words (minus words < 3 chars)
        expect(wordCount).toBeGreaterThan(35000);
        expect(wordCount).toBeLessThan(42000);
      });
    });

    describe('Dictionary switching', () => {
      it('should completely replace dictionary when switching languages', () => {
        // Start with English
        validator.loadDictionary(ENGLISH_DICTIONARY);
        expect(validator.isValidWord('THE')).toBe(true);
        expect(validator.isValidWord('KOT')).toBe(false); // KOT is Polish

        // Switch to Polish
        validator.loadDictionary(POLISH_DICTIONARY);
        expect(validator.isValidWord('THE')).toBe(false); // THE should now be invalid
        expect(validator.isValidWord('KOT')).toBe(true);  // KOT should now be valid
      });

      it('should update word count when switching dictionaries', () => {
        validator.loadDictionary(ENGLISH_DICTIONARY);
        const englishCount = validator.getWordCount();

        validator.loadDictionary(POLISH_DICTIONARY);
        const polishCount = validator.getWordCount();

        // Polish dictionary should have more words
        expect(polishCount).toBeGreaterThan(englishCount);
      });
    });
  });
});
