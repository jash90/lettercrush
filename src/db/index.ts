/**
 * Database exports
 */

export { isWeb, isNative, platformName } from './platform';
export { getDatabase, initDatabase, closeDatabase, isDictionarySeeded } from './database';
export {
  isValidWord,
  loadDictionary,
  getAllWords,
  getWordsWithPrefix,
  getWordCount,
  clearDictionary,
} from './dictionaryDb';
export {
  saveHighscore,
  getTopHighscores,
  getHighestScore,
  isNewHighscore,
  getTotalGamesPlayed,
  getAverageScore,
  clearHighscores,
} from './highscoreDb';
