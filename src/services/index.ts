export {
  getGameOrchestrator,
  resetGameOrchestrator,
  createGameOrchestrator,
  type AnimationConfig,
  type ValidationResult,
  type ProcessWordResult,
  type PhaseCallbacks,
  type GameStateSnapshot,
} from './GameOrchestrator';

export {
  seedDictionaryIfNeeded,
  forceReseedDictionary,
  type SeedResult,
} from './dictionarySeeder';
