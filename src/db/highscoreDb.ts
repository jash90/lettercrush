/**
 * Platform-Adaptive Highscore Database Operations
 * Uses localStorage on web, expo-sqlite on native
 */

import { isWeb } from './platform';
import { getDatabase } from './database';
import type { HighScoreEntry } from '../types/game.types';

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
    console.log(`[Highscore] Web: Saved score ${score}`);
    return newId;
  }

  const database = getDatabase();
  if (!database) return 0;

  const result = await database.runAsync(
    'INSERT INTO highscores (score, moves) VALUES (?, ?)',
    [score, moves]
  );
  console.log(`[Highscore] SQLite: Saved score ${score}`);
  return result.lastInsertRowId;
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

  const database = getDatabase();
  if (!database) return [];

  interface HighscoreRow {
    id: number;
    score: number;
    moves: number;
    created_at: string;
  }
  const results = database.getAllSync(
    'SELECT id, score, moves, created_at FROM highscores ORDER BY score DESC LIMIT ?',
    [limit]
  ) as HighscoreRow[];

  return results.map((r: HighscoreRow) => ({
    id: r.id,
    score: r.score,
    createdAt: r.created_at,
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

  const database = getDatabase();
  if (!database) return 0;

  const result = database.getFirstSync(
    'SELECT MAX(score) as max_score FROM highscores'
  ) as { max_score: number } | null;
  return result?.max_score ?? 0;
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

  const database = getDatabase();
  if (!database) return 0;

  const result = database.getFirstSync(
    'SELECT COUNT(*) as count FROM highscores'
  ) as { count: number } | null;
  return result?.count ?? 0;
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

  const database = getDatabase();
  if (!database) return 0;

  const result = database.getFirstSync(
    'SELECT AVG(score) as avg_score FROM highscores'
  ) as { avg_score: number } | null;
  return Math.round(result?.avg_score ?? 0);
}

/**
 * Clear all highscores
 */
export async function clearHighscores(): Promise<void> {
  if (isWeb) {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify([]));
    console.log('[Highscore] Web: Cleared all highscores');
    return;
  }

  const database = getDatabase();
  if (!database) return;

  await database.execAsync('DELETE FROM highscores');
  console.log('[Highscore] SQLite: Cleared all highscores');
}
