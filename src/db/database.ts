/**
 * Platform-Adaptive Database Setup
 * Uses MMKV on native, localStorage on web
 */

import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { initMMKV, isDictionaryLoaded } from './mmkvStorage';

export const isWeb = Platform.OS === 'web';

/**
 * Initialize database/storage (platform-adaptive)
 */
export async function initDatabase(): Promise<void> {
  if (isWeb) {
    // Web: Initialize localStorage keys if not present
    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem('lettercrush_highscores')) {
        localStorage.setItem('lettercrush_highscores', JSON.stringify([]));
      }
      if (!localStorage.getItem('lettercrush_dictionary_loaded')) {
        localStorage.setItem('lettercrush_dictionary_loaded', 'false');
      }
    }
    logger.log('[Database] Web storage initialized');
    return;
  }

  // Native: Use MMKV
  try {
    initMMKV();
    logger.log('[Database] MMKV initialized successfully');
  } catch (error) {
    logger.error('[Database] MMKV initialization failed:', error);
  }
}

/**
 * Close database connection (no-op for MMKV)
 */
export function closeDatabase(): void {
  // MMKV doesn't need explicit closing
  logger.log('[Database] Storage closed');
}

/**
 * Check if database has been seeded with dictionary
 */
export async function isDictionarySeeded(): Promise<boolean> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('lettercrush_dictionary_loaded') === 'true';
    }
    return false;
  }

  return isDictionaryLoaded();
}
