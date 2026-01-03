/**
 * Dictionary Index
 * Central export for language-specific dictionaries
 */

import { ENGLISH_DICTIONARY } from './english';
import { POLISH_DICTIONARY } from './polish';
import type { Language } from '../../types/game.types';

/**
 * Get dictionary words for the specified language
 */
export function getDictionary(language: Language): string[] {
  switch (language) {
    case 'pl':
      return POLISH_DICTIONARY;
    case 'en':
    default:
      return ENGLISH_DICTIONARY;
  }
}

/**
 * Get dictionary word count for the specified language
 */
export function getDictionarySize(language: Language): number {
  return getDictionary(language).length;
}

// Re-export dictionaries for direct access if needed
export { ENGLISH_DICTIONARY, POLISH_DICTIONARY };
