/**
 * Platform-Adaptive Database Setup
 * Uses expo-sqlite on native, localStorage on web
 */

import { Platform } from 'react-native';
import { logger } from '../utils/logger';

export const isWeb = Platform.OS === 'web';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQLiteModule: any = null;

/**
 * Get database instance (native only)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDatabase(): any {
  if (isWeb) {
    return null;
  }

  if (!db && SQLiteModule) {
    db = SQLiteModule.openDatabaseSync('lettercrush.db');
  }
  return db;
}

/**
 * Initialize database (platform-adaptive)
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

  // Native: Use SQLite via conditional require
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SQLiteModule = require('expo-sqlite');
    const database = getDatabase();

    if (database) {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS dictionary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS highscores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          score INTEGER NOT NULL,
          moves INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
        CREATE INDEX IF NOT EXISTS idx_highscores_score ON highscores(score DESC);
      `);

      logger.log('[Database] SQLite initialized successfully');
    }
  } catch (error) {
    logger.error('[Database] SQLite initialization failed:', error);
  }
}

/**
 * Close database connection (native only)
 */
export function closeDatabase(): void {
  if (!isWeb && db) {
    try {
      db.closeSync();
    } catch (error) {
      logger.error('[Database] Close failed:', error);
    }
    db = null;
  }
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

  try {
    const database = getDatabase();
    if (!database) return false;

    const result = database.getFirstSync(
      'SELECT COUNT(*) as count FROM dictionary'
    ) as { count: number } | null;
    return (result?.count ?? 0) > 0;
  } catch {
    return false;
  }
}
