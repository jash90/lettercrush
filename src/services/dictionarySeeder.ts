/**
 * Dictionary Seeder Service
 * Handles loading dictionary words from files into database on app start
 */

import type { Language } from '../types/game.types';
import {
  loadDictionary,
  clearDictionary,
  getSeededLanguage,
  setSeededLanguage,
} from '../db/dictionaryDb';
import { initDatabase } from '../db';
import { logger } from '../utils/logger';

// Dictionary file imports
import { words as englishWords } from '../../dictonary/eng';
import { words as polishWords } from '../../dictonary/pl';

interface DictionaryWords {
  words3Letters: readonly string[];
  words4Letters: readonly string[];
  words5Letters: readonly string[];
  words6Letters: readonly string[];
}

/**
 * Flatten dictionary object into single array of words
 */
function flattenDictionary(dict: DictionaryWords): string[] {
  return [
    ...dict.words3Letters,
    ...dict.words4Letters,
    ...dict.words5Letters,
    ...dict.words6Letters,
  ];
}

/**
 * Get dictionary words for a specific language
 */
function getDictionaryForLanguage(language: Language): DictionaryWords {
  switch (language) {
    case 'pl':
      return polishWords;
    case 'en':
    default:
      return englishWords;
  }
}

export interface SeedResult {
  success: boolean;
  wordCount: number;
  language: Language;
  wasReseeded: boolean;
}

/**
 * Seed dictionary on every app start
 * Always reloads dictionary to ensure fresh data
 */
export async function seedDictionaryIfNeeded(
  language: Language
): Promise<SeedResult> {
  // Ensure database is initialized before operations
  await initDatabase();

  const seededLanguage = getSeededLanguage();

  // Always clear existing dictionary before seeding
  if (seededLanguage) {
    logger.log(
      `[DictionarySeeder] Clearing previous dictionary (${seededLanguage}) before seeding ${language}...`
    );
    await clearDictionary();
  }

  // Load and seed dictionary
  logger.log(`[DictionarySeeder] Seeding dictionary for ${language}...`);
  const startTime = Date.now();

  const dictionary = getDictionaryForLanguage(language);
  const words = flattenDictionary(dictionary);
  const wordCount = await loadDictionary(words, language);

  await setSeededLanguage(language);

  const duration = Date.now() - startTime;
  logger.log(
    `[DictionarySeeder] Seeded ${wordCount} words in ${duration}ms`
  );

  return {
    success: true,
    wordCount,
    language,
    wasReseeded: true,
  };
}

/**
 * Force reseed dictionary with specified language
 */
export async function forceReseedDictionary(
  language: Language
): Promise<SeedResult> {
  logger.log(`[DictionarySeeder] Force reseeding with ${language}...`);

  // Ensure database is initialized before operations
  await initDatabase();
  await clearDictionary();

  const dictionary = getDictionaryForLanguage(language);
  const words = flattenDictionary(dictionary);
  const wordCount = await loadDictionary(words, language);

  await setSeededLanguage(language);

  return {
    success: true,
    wordCount,
    language,
    wasReseeded: true,
  };
}
