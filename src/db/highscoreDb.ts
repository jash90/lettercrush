/**
 * Platform-Adaptive Highscore Database Operations
 * Uses localStorage on web, MMKV on native
 */

import { isWeb } from './platform';
import type { HighScoreEntry } from '../types/game.types';
import { logger } from '../utils/logger';
import {
  getHighscoresFromStorage,
  addHighscoreToStorage,
  saveHighscoresToStorage,
  clearHighscoresStorage,
  type StoredHighscore,
} from './mmkvStorage';

// LocalStorage key for web
const HIGHSCORES_KEY = 'lettercrush_highscores';

interface WebHighscore {
  id: number;
  score: number;
  moves: number;
  createdAt: string;
}

/**
 * Get highscores from localStorage (web only)
 */
function getWebHighscores(): WebHighscore[] {
  try {
    const data = localStorage.getItem(HIGHSCORES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save highscores to localStorage (web only)
 */
function saveWebHighscores(highscores: WebHighscore[]): void {
  localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highscores));
}

/**
 * Save a new highscore
 */
export async function saveHighscore(score: number, moves: number = 0): Promise<number> {
  if (isWeb) {
    const highscores = getWebHighscores();
    const newId = highscores.length > 0 ? Math.max(...highscores.map(h => h.id)) + 1 : 1;
    const newEntry: WebHighscore = {
      id: newId,
      score,
      moves,
      createdAt: new Date().toISOString(),
    };
    highscores.push(newEntry);
    // Keep only top 100 scores
    highscores.sort((a, b) => b.score - a.score);
    if (highscores.length > 100) {
      highscores.length = 100;
    }
    saveWebHighscores(highscores);
    logger.log(`[Highscore] Web: Saved score ${score}`);
    return newId;
  }

  // Native: Use MMKV
  const newId = addHighscoreToStorage(score, moves);
  logger.log(`[Highscore] MMKV: Saved score ${score}`);
  return newId;
}

/**
 * Get top highscores
 */
export function getTopHighscores(limit: number = 10): HighScoreEntry[] {
  if (isWeb) {
    const highscores = getWebHighscores();
    return highscores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(h => ({
        id: h.id,
        score: h.score,
        createdAt: h.createdAt,
      }));
  }

  // Native: Use MMKV
  const highscores = getHighscoresFromStorage();
  return highscores
    .sort((a: StoredHighscore, b: StoredHighscore) => b.score - a.score)
    .slice(0, limit)
    .map((h: StoredHighscore) => ({
      id: h.id,
      score: h.score,
      createdAt: h.createdAt,
    }));
}

/**
 * Get the highest score ever
 */
export function getHighestScore(): number {
  if (isWeb) {
    const highscores = getWebHighscores();
    if (highscores.length === 0) return 0;
    return Math.max(...highscores.map(h => h.score));
  }

  // Native: Use MMKV
  const highscores = getHighscoresFromStorage();
  if (highscores.length === 0) return 0;
  return Math.max(...highscores.map((h: StoredHighscore) => h.score));
}

/**
 * Check if a score is a new highscore
 */
export function isNewHighscore(score: number): boolean {
  const currentHigh = getHighestScore();
  return score > currentHigh;
}

/**
 * Get total games played
 */
export function getTotalGamesPlayed(): number {
  if (isWeb) {
    return getWebHighscores().length;
  }

  // Native: Use MMKV
  return getHighscoresFromStorage().length;
}

/**
 * Get average score
 */
export function getAverageScore(): number {
  if (isWeb) {
    const highscores = getWebHighscores();
    if (highscores.length === 0) return 0;
    const total = highscores.reduce((sum, h) => sum + h.score, 0);
    return Math.round(total / highscores.length);
  }

  // Native: Use MMKV
  const highscores = getHighscoresFromStorage();
  if (highscores.length === 0) return 0;
  const total = highscores.reduce((sum: number, h: StoredHighscore) => sum + h.score, 0);
  return Math.round(total / highscores.length);
}

/**
 * Clear all highscores
 */
export async function clearHighscores(): Promise<void> {
  if (isWeb) {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify([]));
    logger.log('[Highscore] Web: Cleared all highscores');
    return;
  }

  // Native: Use MMKV
  clearHighscoresStorage();
  logger.log('[Highscore] MMKV: Cleared all highscores');
}
