/**
 * Dictionary Seeder Service
 * Handles loading dictionary words from files into database on app start
 */

import type { Language } from '../types/game.types';
import {
  loadDictionary,
  clearDictionary,
  isDictionarySeeded,
  getSeededLanguage,
  setSeededLanguage,
  getWordCount,
} from '../db/dictionaryDb';
import { initDatabase } from '../db';

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
 * Seed dictionary if needed (not already seeded with same language)
 */
export async function seedDictionaryIfNeeded(
  language: Language
): Promise<SeedResult> {
  const seededLanguage = getSeededLanguage();
  const isSeeded = isDictionarySeeded();

  // Already seeded with same language - skip
  if (isSeeded && seededLanguage === language) {
    const wordCount = getWordCount();
    console.log(
      `[DictionarySeeder] Already seeded with ${language}, ${wordCount} words`
    );
    return {
      success: true,
      wordCount,
      language,
      wasReseeded: false,
    };
  }

  // Need to reseed - clear existing if any
  if (isSeeded) {
    console.log(
      `[DictionarySeeder] Language changed from ${seededLanguage} to ${language}, reseeding...`
    );
    await clearDictionary();
  }

  // Load and seed dictionary
  console.log(`[DictionarySeeder] Seeding dictionary for ${language}...`);
  const startTime = Date.now();

  const dictionary = getDictionaryForLanguage(language);
  const words = flattenDictionary(dictionary);
  const wordCount = await loadDictionary(words);

  await setSeededLanguage(language);

  const duration = Date.now() - startTime;
  console.log(
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
  console.log(`[DictionarySeeder] Force reseeding with ${language}...`);

  // Ensure database is initialized before operations
  await initDatabase();
  await clearDictionary();

  const dictionary = getDictionaryForLanguage(language);
  const words = flattenDictionary(dictionary);
  const wordCount = await loadDictionary(words);

  await setSeededLanguage(language);

  return {
    success: true,
    wordCount,
    language,
    wasReseeded: true,
  };
}
