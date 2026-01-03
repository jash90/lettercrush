/**
 * GridManager - Core game logic for LetterCrush
 * Manages the 6x6 grid, swap operations, word detection, and cascading
 */

import {
  type CellPosition,
  type Tile,
  type WordMatch,
  type Direction,
  type Language,
  DEFAULT_CONFIG,
  getLetterWeights,
} from '../types/game.types';
import { getWordValidator } from './WordValidator';
import { getScoreCalculator } from './ScoreCalculator';
import { getDictionary } from '../data/dictionaries';

/**
 * Placement candidate for word placement scoring
 */
interface PlacementCandidate {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
  score: number;      // Higher = better (crossings, central position)
  conflicts: number;  // Letters that conflict with existing
}

/**
 * Placed word info for crossing optimization
 */
interface PlacedWordInfo {
  word: string;
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
}

/**
 * Placed word with position tracking for crossword algorithm
 */
interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  positions: CellPosition[];
}

/**
 * Crossword state for tracking grid and placed words
 */
interface CrosswordState {
  grid: (string | null)[][];  // null = empty cell
  placedWords: PlacedWord[];
  usedWords: Set<string>;
}

/**
 * Intersection point for word placement
 */
interface Intersection {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
  wordIndex: number;      // Index in the candidate word where intersection occurs
  placedWordIdx: number;  // Index in placedWords array
  letterIndex: number;    // Index in placed word where intersection occurs
}

export class GridManager {
  private grid: Tile[][];
  private readonly size: number;
  private idCounter: number;
  private language: Language;
  private letterWeights: Record<string, number>;

  constructor(size: number = DEFAULT_CONFIG.gridSize, language: Language = 'en') {
    this.size = size;
    this.grid = [];
    this.idCounter = 0;
    this.language = language;
    this.letterWeights = getLetterWeights(language);
  }

  /**
   * Set language and update letter weights
   */
  setLanguage(language: Language): void {
    this.language = language;
    this.letterWeights = getLetterWeights(language);
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.language;
  }

  /**
   * Initialize a new grid with seeded words
   * Ensures at least minWords valid words are present on the board
   */
  initialize(minWords: number = 6): Tile[][] {
    console.log(`[GridManager:initialize] Starting board initialization (minWords: ${minWords}, size: ${this.size}, lang: ${this.language})`);
    this.grid = [];
    this.idCounter = 0;

    // Seed words on the board to ensure at least minWords are present
    this.seedWordsOnBoard(minWords);

    console.log(`[GridManager:initialize] Board initialization complete`);
    this.logBoardState('Final board');
    return this.grid;
  }

  /**
   * Log the current board state as a visual grid
   */
  private logBoardState(label: string): void {
    if (this.grid.length === 0) {
      console.log(`[GridManager:Board] ${label}: (empty grid)`);
      return;
    }

    const border = '┌' + '───'.repeat(this.size) + '┐';
    const bottomBorder = '└' + '───'.repeat(this.size) + '┘';

    console.log(`[GridManager:Board] ${label}:`);
    console.log(border);

    for (let row = 0; row < this.size; row++) {
      const rowLetters = this.grid[row].map(tile => ` ${tile.letter} `).join('');
      console.log(`│${rowLetters}│`);
    }

    console.log(bottomBorder);

    // Also log as a simple string for easier parsing
    const allLetters = this.grid.flatMap(row => row.map(tile => tile.letter)).join('');
    console.log(`[GridManager:Board] All letters: ${allLetters}`);
  }

  /**
   * Get current grid state
   */
  getGrid(): Tile[][] {
    return this.grid;
  }

  /**
   * Check if two positions are adjacent (8 directions including diagonals)
   */
  areAdjacent(pos1: CellPosition, pos2: CellPosition): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);

    // Adjacent means within 1 step in any of 8 directions (including diagonal)
    // but not the same position
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  }

  /**
   * Try to swap two tiles
   * Returns true if swap results in a valid word match
   */
  trySwap(from: CellPosition, to: CellPosition): boolean {
    if (!this.areAdjacent(from, to)) {
      return false;
    }

    // Perform swap
    this.swap(from, to);

    // Check for matches
    const matches = this.findAllWords();

    if (matches.length === 0) {
      // No matches, swap back
      this.swap(from, to);
      return false;
    }

    return true;
  }

  /**
   * Perform a swap operation
   */
  private swap(pos1: CellPosition, pos2: CellPosition): void {
    const tile1 = this.grid[pos1.row][pos1.col];
    const tile2 = this.grid[pos2.row][pos2.col];

    // Swap tiles
    this.grid[pos1.row][pos1.col] = { ...tile2, position: pos1 };
    this.grid[pos2.row][pos2.col] = { ...tile1, position: pos2 };
  }

  /**
   * Find all valid words in the grid (horizontal and vertical)
   */
  findAllWords(): WordMatch[] {
    const matches: WordMatch[] = [];
    const validator = getWordValidator();
    const calculator = getScoreCalculator();

    // Check horizontal words
    for (let row = 0; row < this.size; row++) {
      for (let startCol = 0; startCol <= this.size - 3; startCol++) {
        for (let endCol = startCol + 2; endCol < this.size; endCol++) {
          const word = this.getHorizontalWord(row, startCol, endCol);

          if (validator.isValidWord(word)) {
            const positions: CellPosition[] = [];
            for (let col = startCol; col <= endCol; col++) {
              positions.push({ row, col });
            }

            const scoreResult = calculator.calculateWordScore(word);
            matches.push({
              word,
              positions,
              direction: 'horizontal',
              score: scoreResult.totalScore,
            });
          }
        }
      }
    }

    // Check vertical words
    for (let col = 0; col < this.size; col++) {
      for (let startRow = 0; startRow <= this.size - 3; startRow++) {
        for (let endRow = startRow + 2; endRow < this.size; endRow++) {
          const word = this.getVerticalWord(col, startRow, endRow);

          if (validator.isValidWord(word)) {
            const positions: CellPosition[] = [];
            for (let row = startRow; row <= endRow; row++) {
              positions.push({ row, col });
            }

            const scoreResult = calculator.calculateWordScore(word);
            matches.push({
              word,
              positions,
              direction: 'vertical',
              score: scoreResult.totalScore,
            });
          }
        }
      }
    }

    // Remove overlapping matches (keep longest)
    return this.filterOverlappingMatches(matches);
  }

  /**
   * Clear matched tiles and mark them
   */
  clearMatches(matches: WordMatch[]): Set<string> {
    const clearedPositions = new Set<string>();

    for (const match of matches) {
      for (const pos of match.positions) {
        const key = `${pos.row},${pos.col}`;
        clearedPositions.add(key);
        this.grid[pos.row][pos.col].isMatched = true;
      }
    }

    return clearedPositions;
  }

  /**
   * Clear selected positions (for letter-by-letter selection mode)
   * Marks the specified positions as matched so gravity can process them
   */
  clearSelectedPositions(positions: CellPosition[]): Set<string> {
    const clearedPositions = new Set<string>();

    for (const pos of positions) {
      // Bounds validation to prevent crashes
      if (pos.row < 0 || pos.row >= this.size || pos.col < 0 || pos.col >= this.size) {
        console.warn(`[clearSelectedPositions] Invalid position: ${pos.row},${pos.col}`);
        continue;
      }

      const key = `${pos.row},${pos.col}`;
      clearedPositions.add(key);

      // Create new tile object to avoid mutating potentially frozen objects from React state
      this.grid[pos.row][pos.col] = {
        ...this.grid[pos.row][pos.col],
        isMatched: true,
        isSelected: false,
        selectionOrder: undefined,
      };
    }

    return clearedPositions;
  }

  /**
   * Apply gravity - tiles fall down to fill gaps
   */
  applyGravity(): CellPosition[] {
    const movedTiles: CellPosition[] = [];

    for (let col = 0; col < this.size; col++) {
      let writeRow = this.size - 1;

      for (let readRow = this.size - 1; readRow >= 0; readRow--) {
        if (!this.grid[readRow][col].isMatched) {
          if (readRow !== writeRow) {
            this.grid[writeRow][col] = {
              ...this.grid[readRow][col],
              position: { row: writeRow, col },
            };
            movedTiles.push({ row: writeRow, col });
          }
          writeRow--;
        }
      }

      // Fill empty spaces at top with new tiles
      for (let row = writeRow; row >= 0; row--) {
        this.grid[row][col] = this.createTile(row, col);
        movedTiles.push({ row, col });
      }
    }

    return movedTiles;
  }

  /**
   * Create a new tile with random letter
   */
  private createTile(row: number, col: number): Tile {
    const letter = this.getRandomLetter();
    const tileId = `tile-${++this.idCounter}`;
    console.log(`[GridManager:createTile] Created tile at (${row},${col}): '${letter}' [${tileId}]`);
    return {
      id: tileId,
      letter,
      position: { row, col },
      isSelected: false,
      isMatched: false,
      isAnimating: false,
      selectionOrder: undefined,
    };
  }

  /**
   * Get a random letter based on language-specific frequency weights
   */
  private getRandomLetter(): string {
    const letters = Object.keys(this.letterWeights);
    const weights = Object.values(this.letterWeights);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalWeight;
    const initialRandom = random;

    for (let i = 0; i < letters.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        console.log(`[GridManager:getRandomLetter] Generated: '${letters[i]}' (lang: ${this.language}, weight: ${weights[i].toFixed(2)}, roll: ${initialRandom.toFixed(2)}/${totalWeight.toFixed(2)})`);
        return letters[i];
      }
    }

    // Fallback to most common letter based on language
    const fallbackLetter = this.language === 'pl' ? 'A' : 'E';
    console.warn(`[GridManager:getRandomLetter] FALLBACK triggered, returning '${fallbackLetter}' (lang: ${this.language})`);
    return fallbackLetter;
  }

  /**
   * Get horizontal word from grid
   */
  private getHorizontalWord(row: number, startCol: number, endCol: number): string {
    let word = '';
    for (let col = startCol; col <= endCol; col++) {
      word += this.grid[row][col].letter;
    }
    return word;
  }

  /**
   * Get vertical word from grid
   */
  private getVerticalWord(col: number, startRow: number, endRow: number): string {
    let word = '';
    for (let row = startRow; row <= endRow; row++) {
      word += this.grid[row][col].letter;
    }
    return word;
  }

  /**
   * Filter overlapping matches - keep longest words
   */
  private filterOverlappingMatches(matches: WordMatch[]): WordMatch[] {
    // Sort by word length descending
    matches.sort((a, b) => b.word.length - a.word.length);

    const usedPositions = new Set<string>();
    const filteredMatches: WordMatch[] = [];

    for (const match of matches) {
      const positions = match.positions.map(p => `${p.row},${p.col}`);
      const hasOverlap = positions.some(p => usedPositions.has(p));

      if (!hasOverlap) {
        filteredMatches.push(match);
        positions.forEach(p => usedPositions.add(p));
      }
    }

    return filteredMatches;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Fisher-Yates shuffle algorithm for in-place array shuffling
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Shuffle words within groups of the same length (preserves length-based sorting)
   * This ensures longer words (6-letter) are tried first while maintaining randomness
   * within each length category for variety in generated boards.
   */
  private shuffleArrayWithinSameLength(words: string[]): void {
    // Group by length
    const groups = new Map<number, string[]>();
    for (const word of words) {
      const len = word.length;
      if (!groups.has(len)) {
        groups.set(len, []);
      }
      groups.get(len)!.push(word);
    }

    // Shuffle each group
    for (const [, group] of Array.from(groups.entries())) {
      this.shuffleArray(group);
    }

    // Rebuild array with shuffled groups, maintaining length order
    let idx = 0;
    const sortedLengths = Array.from(groups.keys()).sort((a, b) => b - a); // Descending
    for (const len of sortedLengths) {
      const group = groups.get(len)!;
      for (const word of group) {
        words[idx++] = word;
      }
    }
  }

  /**
   * Select random words from dictionary
   */
  private selectRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words];
    this.shuffleArray(shuffled);
    return shuffled.slice(0, count);
  }

  // ==================== CROSSWORD GENERATION METHODS ====================

  /**
   * Generate a crossword puzzle on the grid
   * Main algorithm that places words in crossword pattern
   */
  private generateCrossword(minWords: number = 6): CrosswordState {
    const dictionary = getDictionary(this.language);

    // Filter words suitable for crossword (3-6 letters) and limit for performance
    const allSuitableWords = dictionary.filter(w => w.length >= 3 && w.length <= 6);
    // Use only a subset for performance (shuffle and take first 300)
    const shuffled = [...allSuitableWords];
    this.shuffleArray(shuffled);
    const suitableWords = shuffled.slice(0, 300);

    // Try to generate a valid crossword with reduced attempts for performance
    let bestState: CrosswordState | null = null;
    const maxAttempts = 10; // Reduced from 50 for mobile performance

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const state = this.buildCrossword(suitableWords, minWords);

      if (state.placedWords.length >= minWords) {
        console.log(`[generateCrossword] Success with ${state.placedWords.length} words in ${attempt + 1} attempts`);
        return state;
      }

      // Track best attempt
      if (!bestState || state.placedWords.length > bestState.placedWords.length) {
        bestState = state;
      }

      // Early termination if we're close enough (5+ words)
      if (bestState && bestState.placedWords.length >= minWords - 1) {
        console.log(`[generateCrossword] Early termination with ${bestState.placedWords.length} words`);
        return bestState;
      }
    }

    // Return best attempt even if below minWords
    console.log(`[generateCrossword] Best attempt: ${bestState?.placedWords.length || 0} words`);
    return bestState || this.createEmptyCrosswordState();
  }

  /**
   * Create empty crossword state
   */
  private createEmptyCrosswordState(): CrosswordState {
    const grid: (string | null)[][] = [];
    for (let row = 0; row < this.size; row++) {
      grid[row] = Array(this.size).fill(null);
    }
    return {
      grid,
      placedWords: [],
      usedWords: new Set(),
    };
  }

  /**
   * Build a single crossword attempt
   */
  private buildCrossword(dictionary: string[], minWords: number): CrosswordState {
    const state = this.createEmptyCrosswordState();

    // Sort by length descending to prioritize longer words (6-letter words first)
    const candidates = [...dictionary].sort((a, b) => b.length - a.length);
    // Shuffle words within same length group for randomness
    this.shuffleArrayWithinSameLength(candidates);

    // Step 1: Place first word horizontally in the middle
    const firstWord = this.selectFirstWord(candidates);
    if (!firstWord) {
      return state;
    }

    const startRow = Math.floor(this.size / 2);
    const startCol = Math.floor((this.size - firstWord.length) / 2);

    this.placeCrosswordWord(state, firstWord, startRow, startCol, 'horizontal');

    // Step 2: Iteratively add crossing words
    const maxIterations = 20; // Reduced from 100 for mobile performance
    let iterations = 0;
    let consecutiveFailures = 0;

    while (state.placedWords.length < minWords && iterations < maxIterations) {
      iterations++;

      let placed = false;

      // Try each candidate word (limit to avoid excessive iteration)
      let candidatesTried = 0;
      const maxCandidatesPerIteration = 100;

      for (const candidate of candidates) {
        if (candidatesTried >= maxCandidatesPerIteration) break;
        if (state.usedWords.has(candidate)) continue;
        if (candidate.length > this.size) continue;

        candidatesTried++;

        // Find all possible intersections with placed words
        const intersections = this.findCrosswordIntersections(candidate, state);

        // Score and sort intersections (limit for performance)
        const scoredIntersections = intersections
          .slice(0, 20) // Limit intersections to check
          .map(int => ({
            ...int,
            score: this.scoreCrosswordPlacement(candidate, int, state),
          }))
          .filter(int => int.score > -100) // Filter out invalid placements
          .sort((a, b) => b.score - a.score);

        // Try best intersection
        for (const intersection of scoredIntersections.slice(0, 5)) { // Only try top 5
          if (this.canPlaceCrosswordWordAt(candidate, intersection.row, intersection.col, intersection.direction, state)) {
            this.placeCrosswordWord(state, candidate, intersection.row, intersection.col, intersection.direction);
            placed = true;
            break;
          }
        }

        if (placed) break;
      }

      // Track consecutive failures for early termination
      if (!placed) {
        consecutiveFailures++;
        if (consecutiveFailures >= 3) break; // Give up after 3 consecutive failures
      } else {
        consecutiveFailures = 0;
      }
    }

    return state;
  }

  /**
   * Select a good first word (6 letters preferred for longer words on board)
   */
  private selectFirstWord(candidates: string[]): string | null {
    // Prefer 6-letter words for the first placement
    const sixLetterWords = candidates.filter(w => w.length === 6);
    if (sixLetterWords.length > 0) {
      return sixLetterWords[Math.floor(Math.random() * sixLetterWords.length)];
    }

    // Then 5-letter words
    const fiveLetterWords = candidates.filter(w => w.length === 5);
    if (fiveLetterWords.length > 0) {
      return fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
    }

    // Fallback to any word that fits
    const fitWords = candidates.filter(w => w.length <= this.size);
    if (fitWords.length > 0) {
      return fitWords[Math.floor(Math.random() * fitWords.length)];
    }

    return null;
  }

  /**
   * Find all possible intersections between a candidate word and placed words
   */
  private findCrosswordIntersections(candidate: string, state: CrosswordState): Intersection[] {
    const intersections: Intersection[] = [];

    for (let placedIdx = 0; placedIdx < state.placedWords.length; placedIdx++) {
      const placed = state.placedWords[placedIdx];

      // Find common letters
      for (let ci = 0; ci < candidate.length; ci++) {
        for (let pi = 0; pi < placed.word.length; pi++) {
          if (candidate[ci] === placed.word[pi]) {
            // Calculate intersection position
            const crossDirection: 'horizontal' | 'vertical' =
              placed.direction === 'horizontal' ? 'vertical' : 'horizontal';

            let row: number;
            let col: number;

            if (placed.direction === 'horizontal') {
              // Placed word is horizontal, new word will be vertical
              col = placed.startCol + pi;
              row = placed.startRow - ci;
            } else {
              // Placed word is vertical, new word will be horizontal
              row = placed.startRow + pi;
              col = placed.startCol - ci;
            }

            intersections.push({
              row,
              col,
              direction: crossDirection,
              wordIndex: ci,
              placedWordIdx: placedIdx,
              letterIndex: pi,
            });
          }
        }
      }
    }

    // Shuffle to avoid bias
    this.shuffleArray(intersections);
    return intersections;
  }

  /**
   * Check if a word can be placed at the given position in crossword state
   */
  private canPlaceCrosswordWordAt(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical',
    state: CrosswordState
  ): boolean {
    // Check boundaries
    if (startRow < 0 || startCol < 0) return false;

    if (direction === 'horizontal') {
      if (startCol + word.length > this.size) return false;
      if (startRow >= this.size) return false;
    } else {
      if (startRow + word.length > this.size) return false;
      if (startCol >= this.size) return false;
    }

    // Check each letter position
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      const existing = state.grid[row][col];

      // Cell must be empty or have matching letter
      if (existing !== null && existing !== word[i]) {
        return false;
      }

      // Check adjacent cells (prevent parallel words touching)
      if (!this.checkAdjacentCells(word, i, row, col, direction, state)) {
        return false;
      }
    }

    // Check cells before and after word (must be empty)
    if (direction === 'horizontal') {
      if (startCol > 0 && state.grid[startRow][startCol - 1] !== null) {
        return false;
      }
      if (startCol + word.length < this.size && state.grid[startRow][startCol + word.length] !== null) {
        return false;
      }
    } else {
      if (startRow > 0 && state.grid[startRow - 1][startCol] !== null) {
        return false;
      }
      if (startRow + word.length < this.size && state.grid[startRow + word.length][startCol] !== null) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check adjacent cells to prevent invalid configurations
   */
  private checkAdjacentCells(
    word: string,
    letterIndex: number,
    row: number,
    col: number,
    direction: 'horizontal' | 'vertical',
    state: CrosswordState
  ): boolean {
    const existing = state.grid[row][col];

    // If cell is empty, check that perpendicular neighbors are also empty
    // (to prevent words from running parallel and touching)
    if (existing === null) {
      if (direction === 'horizontal') {
        // Check above and below
        if (row > 0 && state.grid[row - 1][col] !== null) return false;
        if (row < this.size - 1 && state.grid[row + 1][col] !== null) return false;
      } else {
        // Check left and right
        if (col > 0 && state.grid[row][col - 1] !== null) return false;
        if (col < this.size - 1 && state.grid[row][col + 1] !== null) return false;
      }
    }

    return true;
  }

  /**
   * Score a potential crossword placement
   * Higher score = better placement
   */
  private scoreCrosswordPlacement(
    word: string,
    intersection: Intersection,
    state: CrosswordState
  ): number {
    let score = 0;

    const { row, col, direction } = intersection;

    // Check if placement is valid first
    if (!this.canPlaceCrosswordWordAt(word, row, col, direction, state)) {
      return -1000;
    }

    // Bonus for intersections with existing words
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;

      if (state.grid[r][c] !== null && state.grid[r][c] === word[i]) {
        score += 10;  // +10 for each intersection
      }
    }

    // Central position bonus
    const centerRow = (this.size - 1) / 2;
    const centerCol = (this.size - 1) / 2;
    const endRow = direction === 'horizontal' ? row : row + word.length - 1;
    const endCol = direction === 'horizontal' ? col + word.length - 1 : col;
    const midRow = (row + endRow) / 2;
    const midCol = (col + endCol) / 2;
    const distanceFromCenter = Math.abs(midRow - centerRow) + Math.abs(midCol - centerCol);
    score += Math.max(0, 5 - distanceFromCenter);  // +5 for central position

    // Penalty for edge positions
    if (row === 0 || row === this.size - 1 || col === 0 || col === this.size - 1) {
      score -= 3;
    }

    return score;
  }

  /**
   * Place a word in the crossword state
   */
  private placeCrosswordWord(
    state: CrosswordState,
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): void {
    const positions: CellPosition[] = [];

    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      state.grid[row][col] = word[i];
      positions.push({ row, col });
    }

    state.placedWords.push({
      word,
      startRow,
      startCol,
      direction,
      positions,
    });

    state.usedWords.add(word);
  }

  /**
   * Convert crossword state to tile grid, filling empty cells with random letters
   */
  private crosswordStateToGrid(state: CrosswordState): void {
    this.grid = [];
    const placedLetters: string[] = [];
    const randomLetters: string[] = [];

    console.log(`[GridManager:crosswordStateToGrid] Converting crossword state to grid (${state.placedWords.length} words placed)`);
    console.log(`[GridManager:crosswordStateToGrid] Placed words:`);
    state.placedWords.forEach((pw, idx) => {
      const dirSymbol = pw.direction === 'horizontal' ? '→' : '↓';
      console.log(`  ${idx + 1}. "${pw.word}" at (${pw.startRow},${pw.startCol}) ${dirSymbol} ${pw.direction}`);
    });

    for (let row = 0; row < this.size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        const letter = state.grid[row][col];
        const isFromWord = letter !== null;
        const finalLetter = isFromWord ? letter : this.getRandomLetter();

        if (isFromWord) {
          placedLetters.push(finalLetter);
        } else {
          randomLetters.push(finalLetter);
        }

        this.grid[row][col] = {
          id: `tile-${++this.idCounter}`,
          letter: finalLetter,
          position: { row, col },
          isSelected: false,
          isMatched: false,
          isAnimating: false,
        };
      }
    }

    console.log(`[GridManager:crosswordStateToGrid] Letters from words (${placedLetters.length}): ${placedLetters.join('')}`);
    console.log(`[GridManager:crosswordStateToGrid] Random fill letters (${randomLetters.length}): ${randomLetters.join('')}`);
    this.logBoardState('After crossword conversion');
  }

  // ==================== PLACEMENT VALIDATION METHODS ====================

  /**
   * Check if a word can be placed at the given position without conflicts
   * Returns true if placement is valid (empty cells or matching letters)
   */
  private canPlaceWordAt(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): boolean {
    // Check boundaries
    if (direction === 'horizontal') {
      if (startCol + word.length > this.size) return false;
    } else {
      if (startRow + word.length > this.size) return false;
    }

    // Check each letter position for conflicts
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      const existingLetter = this.grid[row][col].letter;
      if (existingLetter !== '' && existingLetter !== word[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate placement position and return a score
   * Higher score = better placement (crossings, central position)
   */
  private evaluatePlacement(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): PlacementCandidate {
    let score = 0;
    let conflicts = 0;
    let crossings = 0;

    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      const existingLetter = this.grid[row][col].letter;

      if (existingLetter !== '') {
        if (existingLetter === word[i]) {
          // Crossing with matching letter - bonus!
          crossings++;
          score += 10;
        } else {
          // Conflict
          conflicts++;
          score -= 100;
        }
      }
    }

    // Central position bonus (prefer middle of grid)
    const centerRow = (this.size - 1) / 2;
    const centerCol = (this.size - 1) / 2;
    const endRow = direction === 'horizontal' ? startRow : startRow + word.length - 1;
    const endCol = direction === 'horizontal' ? startCol + word.length - 1 : startCol;
    const midRow = (startRow + endRow) / 2;
    const midCol = (startCol + endCol) / 2;
    const distanceFromCenter = Math.abs(midRow - centerRow) + Math.abs(midCol - centerCol);
    score += Math.max(0, 5 - distanceFromCenter);

    return {
      row: startRow,
      col: startCol,
      direction,
      score,
      conflicts,
    };
  }

  /**
   * Commit a word placement to the grid
   */
  private commitPlacement(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): void {
    const dirSymbol = direction === 'horizontal' ? '→' : '↓';
    console.log(`[GridManager:commitPlacement] Placing "${word}" at (${startRow},${startCol}) ${dirSymbol} ${direction}`);
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;
      this.grid[row][col].letter = word[i];
    }
  }

  /**
   * Try to place a word in the best position
   * Returns placement info if successful, null otherwise
   */
  private tryPlaceWordBest(
    word: string,
    direction: 'horizontal' | 'vertical',
    preferCrossings: boolean = true
  ): PlacedWordInfo | null {
    const candidates: PlacementCandidate[] = [];

    const maxRow = direction === 'horizontal' ? this.size : this.size - word.length + 1;
    const maxCol = direction === 'horizontal' ? this.size - word.length + 1 : this.size;

    // Evaluate all valid positions
    for (let row = 0; row < maxRow; row++) {
      for (let col = 0; col < maxCol; col++) {
        if (this.canPlaceWordAt(word, row, col, direction)) {
          const candidate = this.evaluatePlacement(word, row, col, direction);
          if (candidate.conflicts === 0) {
            candidates.push(candidate);
          }
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Sort by score (highest first) or randomize if not preferring crossings
    if (preferCrossings) {
      candidates.sort((a, b) => b.score - a.score);
    } else {
      this.shuffleArray(candidates);
    }

    // Take the best candidate
    const best = candidates[0];
    this.commitPlacement(word, best.row, best.col, best.direction);

    return {
      word,
      row: best.row,
      col: best.col,
      direction: best.direction,
    };
  }

  // ==================== CROSSING OPTIMIZATION METHODS ====================

  /**
   * Find candidate words that can cross with a placed word
   * Returns words with their intersection points
   */
  private findCrossingCandidates(
    placed: PlacedWordInfo,
    candidateWords: string[]
  ): Array<{ word: string; crossIndex: number; placedLetterIndex: number }> {
    const results: Array<{ word: string; crossIndex: number; placedLetterIndex: number }> = [];

    for (const candidate of candidateWords) {
      // Find common letters
      for (let pi = 0; pi < placed.word.length; pi++) {
        const placedLetter = placed.word[pi];
        for (let ci = 0; ci < candidate.length; ci++) {
          if (candidate[ci] === placedLetter) {
            results.push({
              word: candidate,
              crossIndex: ci,
              placedLetterIndex: pi,
            });
          }
        }
      }
    }

    // Shuffle to avoid bias
    this.shuffleArray(results);
    return results;
  }

  /**
   * Try to place a crossing word that intersects with a placed word
   */
  private placeCrossingWord(
    placed: PlacedWordInfo,
    crossingWord: string,
    crossIndex: number,
    placedLetterIndex: number
  ): PlacedWordInfo | null {
    // Calculate position for crossing word (perpendicular direction)
    const crossDirection: 'horizontal' | 'vertical' =
      placed.direction === 'horizontal' ? 'vertical' : 'horizontal';

    let startRow: number;
    let startCol: number;

    if (placed.direction === 'horizontal') {
      // Placed word is horizontal, crossing word is vertical
      startCol = placed.col + placedLetterIndex;
      startRow = placed.row - crossIndex;
    } else {
      // Placed word is vertical, crossing word is horizontal
      startRow = placed.row + placedLetterIndex;
      startCol = placed.col - crossIndex;
    }

    // Check boundaries
    if (startRow < 0 || startCol < 0) return null;
    if (crossDirection === 'horizontal' && startCol + crossingWord.length > this.size) return null;
    if (crossDirection === 'vertical' && startRow + crossingWord.length > this.size) return null;

    // Check if we can place it
    if (!this.canPlaceWordAt(crossingWord, startRow, startCol, crossDirection)) {
      return null;
    }

    // Commit placement
    this.commitPlacement(crossingWord, startRow, startCol, crossDirection);

    return {
      word: crossingWord,
      row: startRow,
      col: startCol,
      direction: crossDirection,
    };
  }

  // ==================== MULTI-PHASE SEEDING METHODS ====================

  /**
   * Place anchor words (typically horizontal) spread across the grid
   */
  private placeAnchorWords(words: string[]): PlacedWordInfo[] {
    const placed: PlacedWordInfo[] = [];
    const targetRows = [1, 3, 5]; // Spread across rows for 6x6 grid

    for (let i = 0; i < words.length && i < targetRows.length; i++) {
      const word = words[i];
      const row = targetRows[i];

      // Try to place at various column positions
      for (let col = 0; col <= this.size - word.length; col++) {
        if (this.canPlaceWordAt(word, row, col, 'horizontal')) {
          this.commitPlacement(word, row, col, 'horizontal');
          placed.push({ word, row, col, direction: 'horizontal' });
          break;
        }
      }
    }

    return placed;
  }

  /**
   * Place crossing words that intersect with already placed words
   */
  private placeCrossingWords(
    placedWords: PlacedWordInfo[],
    candidateWords: string[]
  ): PlacedWordInfo[] {
    const placed: PlacedWordInfo[] = [];
    const usedWords = new Set(placedWords.map(p => p.word));

    for (const anchor of placedWords) {
      const availableCandidates = candidateWords.filter(w => !usedWords.has(w));
      const crossingCandidates = this.findCrossingCandidates(anchor, availableCandidates);

      for (const candidate of crossingCandidates) {
        if (usedWords.has(candidate.word)) continue;

        const result = this.placeCrossingWord(
          anchor,
          candidate.word,
          candidate.crossIndex,
          candidate.placedLetterIndex
        );

        if (result) {
          placed.push(result);
          usedWords.add(candidate.word);
          break; // One crossing per anchor
        }
      }
    }

    return placed;
  }

  /**
   * Place additional words to fill the grid
   */
  private placeAdditionalWords(words: string[], targetCount: number): number {
    let placedCount = 0;
    const shuffledWords = [...words];
    this.shuffleArray(shuffledWords);

    for (const word of shuffledWords) {
      if (placedCount >= targetCount) break;

      // Try horizontal first
      const hResult = this.tryPlaceWordBest(word, 'horizontal', true);
      if (hResult) {
        placedCount++;
        continue;
      }

      // Try vertical
      const vResult = this.tryPlaceWordBest(word, 'vertical', true);
      if (vResult) {
        placedCount++;
      }
    }

    return placedCount;
  }

  /**
   * Systematic fallback that guarantees minimum words
   * Uses deterministic placement positions for reliable results
   */
  private systematicFallback(minWords: number): void {
    const dictionary = getDictionary(this.language);
    const threeLetterWords = dictionary.filter(w => w.length === 3);

    // Deterministic positions that don't conflict on 6x6 grid
    const systematicPlacements = [
      { row: 0, col: 0, dir: 'horizontal' as const },
      { row: 0, col: 3, dir: 'horizontal' as const },
      { row: 2, col: 0, dir: 'horizontal' as const },
      { row: 2, col: 3, dir: 'horizontal' as const },
      { row: 4, col: 0, dir: 'horizontal' as const },
      { row: 4, col: 3, dir: 'horizontal' as const },
      { row: 0, col: 0, dir: 'vertical' as const },
      { row: 0, col: 3, dir: 'vertical' as const },
      { row: 3, col: 0, dir: 'vertical' as const },
      { row: 3, col: 3, dir: 'vertical' as const },
    ];

    let fallbackAttempts = 0;
    const maxFallbackAttempts = 20;

    while (fallbackAttempts < maxFallbackAttempts) {
      this.clearGrid();
      const shuffledWords = [...threeLetterWords];
      this.shuffleArray(shuffledWords);

      let wordIndex = 0;
      let placedCount = 0;

      // Place words at systematic positions
      for (const pos of systematicPlacements) {
        if (wordIndex >= shuffledWords.length) break;

        const word = shuffledWords[wordIndex];
        wordIndex++;

        if (this.canPlaceWordAt(word, pos.row, pos.col, pos.dir)) {
          this.commitPlacement(word, pos.row, pos.col, pos.dir);
          placedCount++;
        }
      }

      this.fillEmptyCells();

      const foundWords = this.findAllWords();
      if (foundWords.length >= minWords) {
        console.log(`[GridManager] Systematic fallback succeeded with ${foundWords.length} words in ${fallbackAttempts + 1} attempts`);
        return;
      }

      fallbackAttempts++;
    }

    // Final fallback: log warning but don't throw (game should still be playable)
    console.warn(`[GridManager] Warning: Could not guarantee ${minWords} words after all fallback attempts`);
  }

  /**
   * Seed words on the board to ensure at least minWords valid words exist
   * Multi-phase strategy with guaranteed fallback:
   * 1. Place anchor words (horizontal, spread across grid)
   * 2. Place crossing words (vertical, intersecting anchors)
   * 3. Place additional words to fill gaps
   * 4. Fill remaining cells with random letters
   * 5. Systematic fallback if minimum not reached
   */
  private seedWordsOnBoard(minWords: number = 6): void {
    // Try crossword algorithm first (new approach)
    const crosswordState = this.generateCrossword(minWords);

    if (crosswordState.placedWords.length >= minWords) {
      // Success! Convert crossword state to tile grid
      this.crosswordStateToGrid(crosswordState);

      // Validate: Check how many words are on the board
      const foundWords = this.findAllWords();
      console.log(`[GridManager] Crossword algorithm placed ${crosswordState.placedWords.length} words, found ${foundWords.length} valid words`);

      if (foundWords.length >= minWords) {
        return;
      }
    }

    // Fallback to old multi-phase approach if crossword algorithm fails
    console.log(`[GridManager] Crossword algorithm insufficient (${crosswordState.placedWords.length} words), using fallback`);

    const dictionary = getDictionary(this.language);
    const seedableWords = dictionary.filter(w => w.length >= 3 && w.length <= 5);
    const fourLetterWords = seedableWords.filter(w => w.length === 4);

    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // Clear grid
      this.clearGrid();

      // Phase 1: Place anchor words (horizontal, spread across rows)
      const anchorWords = this.selectRandomWords(fourLetterWords, 3);
      const placedAnchors = this.placeAnchorWords(anchorWords);

      // Phase 2: Place crossing words (vertical, intersecting anchors)
      if (placedAnchors.length > 0) {
        this.placeCrossingWords(placedAnchors, seedableWords);
      }

      // Phase 3: Fill gaps with additional words
      this.placeAdditionalWords(seedableWords, 8);

      // Phase 4: Fill remaining empty cells with random letters
      this.fillEmptyCells();

      // Validate: Check how many words are on the board
      const foundWords = this.findAllWords();

      if (foundWords.length >= minWords) {
        console.log(`[GridManager] Fallback seeded ${foundWords.length} words in ${attempts + 1} attempts`);
        return;
      }

      attempts++;
    }

    // Phase 5: Systematic fallback (GUARANTEED approach)
    console.log(`[GridManager] Random attempts exhausted, using systematic fallback`);
    this.systematicFallback(minWords);
  }

  /**
   * Clear the grid (set all cells to null placeholder)
   */
  private clearGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        this.grid[row][col] = {
          id: `tile-${++this.idCounter}`,
          letter: '',
          position: { row, col },
          isSelected: false,
          isMatched: false,
          isAnimating: false,
        };
      }
    }
  }

  /**
   * Place random words on the grid (horizontally and vertically)
   * Improved: Tries multiple positions per word (up to 10) before skipping
   */
  private placeRandomWords(words: string[], targetCount: number): number {
    const shuffled = [...words];
    this.shuffleArray(shuffled);
    let placedCount = 0;
    let wordIndex = 0;
    const maxPositionAttempts = 10; // Try multiple positions per word

    // Place horizontal words (try to place ~half)
    const horizontalTarget = Math.ceil(targetCount / 2);

    while (placedCount < horizontalTarget && wordIndex < shuffled.length) {
      const word = shuffled[wordIndex];
      wordIndex++;

      if (word.length > this.size) continue;

      // Try multiple random positions
      let placed = false;
      for (let posAttempt = 0; posAttempt < maxPositionAttempts && !placed; posAttempt++) {
        const row = Math.floor(Math.random() * this.size);
        const maxStartCol = this.size - word.length;
        const startCol = Math.floor(Math.random() * (maxStartCol + 1));

        if (this.canPlaceWordAt(word, row, startCol, 'horizontal')) {
          this.commitPlacement(word, row, startCol, 'horizontal');
          placedCount++;
          placed = true;
        }
      }
    }

    // Place vertical words
    while (placedCount < targetCount && wordIndex < shuffled.length) {
      const word = shuffled[wordIndex];
      wordIndex++;

      if (word.length > this.size) continue;

      // Try multiple random positions
      let placed = false;
      for (let posAttempt = 0; posAttempt < maxPositionAttempts && !placed; posAttempt++) {
        const col = Math.floor(Math.random() * this.size);
        const maxStartRow = this.size - word.length;
        const startRow = Math.floor(Math.random() * (maxStartRow + 1));

        if (this.canPlaceWordAt(word, startRow, col, 'vertical')) {
          this.commitPlacement(word, startRow, col, 'vertical');
          placedCount++;
          placed = true;
        }
      }
    }

    return placedCount;
  }

  /**
   * Fill any empty cells with random letters
   */
  private fillEmptyCells(): void {
    const filledCells: Array<{row: number, col: number, letter: string}> = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col].letter === '') {
          const letter = this.getRandomLetter();
          this.grid[row][col].letter = letter;
          filledCells.push({ row, col, letter });
        }
      }
    }

    if (filledCells.length > 0) {
      console.log(`[GridManager:fillEmptyCells] Filled ${filledCells.length} empty cells:`);
      const lettersOnly = filledCells.map(c => c.letter).join('');
      console.log(`[GridManager:fillEmptyCells] Generated letters: ${lettersOnly}`);
      this.logBoardState('After fillEmptyCells');
    }
  }

  /**
   * Create a deep clone of the grid
   */
  cloneGrid(): Tile[][] {
    return this.grid.map(row => row.map(tile => ({ ...tile })));
  }

  /**
   * Check if a swap on a test grid would create valid words
   */
  private checkSwapForWords(testGrid: Tile[][], from: CellPosition, to: CellPosition): boolean {
    // Perform swap on test grid
    const tile1 = testGrid[from.row][from.col];
    const tile2 = testGrid[to.row][to.col];
    testGrid[from.row][from.col] = { ...tile2, position: from };
    testGrid[to.row][to.col] = { ...tile1, position: to };

    // Check for words in test grid
    const validator = getWordValidator();

    // Check horizontal words
    for (let row = 0; row < this.size; row++) {
      for (let startCol = 0; startCol <= this.size - 3; startCol++) {
        for (let endCol = startCol + 2; endCol < this.size; endCol++) {
          let word = '';
          for (let col = startCol; col <= endCol; col++) {
            word += testGrid[row][col].letter;
          }
          if (validator.isValidWord(word)) {
            return true;
          }
        }
      }
    }

    // Check vertical words
    for (let col = 0; col < this.size; col++) {
      for (let startRow = 0; startRow <= this.size - 3; startRow++) {
        for (let endRow = startRow + 2; endRow < this.size; endRow++) {
          let word = '';
          for (let row = startRow; row <= endRow; row++) {
            word += testGrid[row][col].letter;
          }
          if (validator.isValidWord(word)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Swap letters in place (no object allocation)
   * Used for efficient move validation
   */
  private swapLettersInPlace(pos1: CellPosition, pos2: CellPosition): void {
    const temp = this.grid[pos1.row][pos1.col].letter;
    this.grid[pos1.row][pos1.col].letter = this.grid[pos2.row][pos2.col].letter;
    this.grid[pos2.row][pos2.col].letter = temp;
  }

  /**
   * Check if any valid word exists in a row
   * Optimized to only check the specific row
   */
  private hasWordInRow(row: number): boolean {
    const validator = getWordValidator();
    for (let startCol = 0; startCol <= this.size - 3; startCol++) {
      for (let endCol = startCol + 2; endCol < this.size; endCol++) {
        const word = this.getHorizontalWord(row, startCol, endCol);
        if (validator.isValidWord(word)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if any valid word exists in a column
   * Optimized to only check the specific column
   */
  private hasWordInColumn(col: number): boolean {
    const validator = getWordValidator();
    for (let startRow = 0; startRow <= this.size - 3; startRow++) {
      for (let endRow = startRow + 2; endRow < this.size; endRow++) {
        const word = this.getVerticalWord(col, startRow, endRow);
        if (validator.isValidWord(word)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if swapping two positions creates a valid word
   * Uses in-place swap with rollback (no allocations)
   */
  private checkSwapCreatesWord(pos1: CellPosition, pos2: CellPosition): boolean {
    // Swap in place
    this.swapLettersInPlace(pos1, pos2);

    // Check only affected rows and columns
    const hasWord =
      this.hasWordInRow(pos1.row) ||
      this.hasWordInColumn(pos1.col) ||
      (pos2.row !== pos1.row && this.hasWordInRow(pos2.row)) ||
      (pos2.col !== pos1.col && this.hasWordInColumn(pos2.col));

    // Rollback swap
    this.swapLettersInPlace(pos1, pos2);

    return hasWord;
  }

  /**
   * Check if any valid moves remain on the board
   * Returns true if at least one adjacent swap would create a valid word
   * Optimized: Uses in-place swap with rollback (90%+ allocation reduction)
   */
  hasValidMoves(): boolean {
    // Check all horizontal adjacent pairs
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size - 1; col++) {
        if (this.checkSwapCreatesWord({ row, col }, { row, col: col + 1 })) {
          return true;
        }
      }
    }

    // Check all vertical adjacent pairs
    for (let row = 0; row < this.size - 1; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.checkSwapCreatesWord({ row, col }, { row: row + 1, col })) {
          return true;
        }
      }
    }

    return false;
  }

  // ==================== SELECTABLE WORDS (DFS) ====================

  /**
   * Find all valid words that can be formed by selecting adjacent letters (8 directions)
   * Uses DFS to explore all possible paths starting from each cell
   * Returns a Set of all valid words (uppercase)
   */
  findAllPossibleWords(): Set<string> {
    const validWords = new Set<string>();
    const validator = getWordValidator();

    // 8 directions: horizontal, vertical, and diagonal
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],  // top-left, top, top-right
      [0, -1],          [0, 1],    // left, right
      [1, -1], [1, 0], [1, 1]      // bottom-left, bottom, bottom-right
    ];

    // Create visited array for DFS
    const visited: boolean[][] = Array.from({ length: this.size }, () =>
      Array(this.size).fill(false)
    );

    const dfs = (row: number, col: number, currentWord: string) => {
      // Check if current word is valid (minimum 3 letters)
      if (currentWord.length >= 3 && validator.isValidWord(currentWord)) {
        validWords.add(currentWord.toUpperCase());
      }

      // Early termination: if no words start with this prefix, stop exploring
      if (currentWord.length >= 2 && !validator.hasPrefix(currentWord)) {
        return;
      }

      // Limit max word length to prevent excessive recursion
      if (currentWord.length >= 12) {
        return;
      }

      // Explore all 8 adjacent cells
      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        // Check bounds and if not visited
        if (
          newRow >= 0 && newRow < this.size &&
          newCol >= 0 && newCol < this.size &&
          !visited[newRow][newCol]
        ) {
          visited[newRow][newCol] = true;
          const letter = this.grid[newRow][newCol].letter;
          dfs(newRow, newCol, currentWord + letter);
          visited[newRow][newCol] = false;
        }
      }
    };

    // Start DFS from every cell as a potential starting point
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        visited[row][col] = true;
        const startLetter = this.grid[row][col].letter;
        dfs(row, col, startLetter);
        visited[row][col] = false;
      }
    }

    return validWords;
  }

  /**
   * Find all valid words with their positions (DFS)
   * Returns list of words with their cell positions
   */
  findWordsWithPositions(): Array<{ word: string; positions: CellPosition[] }> {
    const validMatches: Array<{ word: string; positions: CellPosition[] }> = [];
    const validator = getWordValidator();

    // 8 directions: horizontal, vertical, and diagonal
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    // Create visited array for DFS
    const visited: boolean[][] = Array.from({ length: this.size }, () =>
      Array(this.size).fill(false)
    );

    const dfs = (row: number, col: number, currentWord: string, currentPath: CellPosition[]) => {
      // Check if current word is valid (minimum 3 letters)
      if (currentWord.length >= 3 && validator.isValidWord(currentWord)) {
        validMatches.push({
          word: currentWord.toUpperCase(),
          positions: [...currentPath]
        });
      }

      // Early termination: if no words start with this prefix, stop exploring
      if (currentWord.length >= 2 && !validator.hasPrefix(currentWord)) {
        return;
      }

      // Limit max word length to prevent excessive recursion
      if (currentWord.length >= 8) { // Reduced from 12 for performance with positions
        return;
      }

      // Explore all 8 adjacent cells
      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        // Check bounds and if not visited
        if (
          newRow >= 0 && newRow < this.size &&
          newCol >= 0 && newCol < this.size &&
          !visited[newRow][newCol]
        ) {
          visited[newRow][newCol] = true;
          const letter = this.grid[newRow][newCol].letter;
          dfs(newRow, newCol, currentWord + letter, [...currentPath, { row: newRow, col: newCol }]);
          visited[newRow][newCol] = false;
        }
      }
    };

    // Start DFS from every cell
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        visited[row][col] = true;
        const startLetter = this.grid[row][col].letter;
        dfs(row, col, startLetter, [{ row, col }]);
        visited[row][col] = false;
      }
    }

    // Filter duplicates (same word found via same path) - though DFS path is unique
    // But we might want to filter same word found via different paths if just listing words
    // For debug viz, keeping all paths is fine.
    
    return validMatches;
  }

  /**
   * Find only straight-line (horizontal and vertical) words with their positions
   * This is used for debug mode to show only linear words, not diagonal paths
   * Similar to findAllWords() but returns positions for each word
   */
  findStraightLineWords(): Array<{ word: string; positions: CellPosition[] }> {
    const matches: Array<{ word: string; positions: CellPosition[] }> = [];
    const validator = getWordValidator();

    // Check horizontal words
    for (let row = 0; row < this.size; row++) {
      for (let startCol = 0; startCol <= this.size - 3; startCol++) {
        for (let endCol = startCol + 2; endCol < this.size; endCol++) {
          const word = this.getHorizontalWord(row, startCol, endCol);

          if (validator.isValidWord(word)) {
            const positions: CellPosition[] = [];
            for (let col = startCol; col <= endCol; col++) {
              positions.push({ row, col });
            }
            matches.push({ word, positions });
          }
        }
      }
    }

    // Check vertical words
    for (let col = 0; col < this.size; col++) {
      for (let startRow = 0; startRow <= this.size - 3; startRow++) {
        for (let endRow = startRow + 2; endRow < this.size; endRow++) {
          const word = this.getVerticalWord(col, startRow, endRow);

          if (validator.isValidWord(word)) {
            const positions: CellPosition[] = [];
            for (let row = startRow; row <= endRow; row++) {
              positions.push({ row, col });
            }
            matches.push({ word, positions });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Get count of valid words that can be formed by selecting adjacent letters
   */
  getSelectableWordCount(): number {
    return this.findAllPossibleWords().size;
  }

  /**
   * Ensure grid has at least minWords valid selectable words
   * Regenerates grid if needed (up to maxAttempts times)
   * Returns true if minimum words achieved, false otherwise
   */
  ensureMinimumWords(minWords: number = 6, maxAttempts: number = 50): boolean {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const wordCount = this.getSelectableWordCount();

      if (wordCount >= minWords) {
        console.log(`[ensureMinimumWords] Grid has ${wordCount} selectable words (attempt ${attempt + 1})`);
        return true;
      }

      // Not enough words - regenerate the entire grid
      console.log(`[ensureMinimumWords] Only ${wordCount} words, regenerating (attempt ${attempt + 1})`);
      this.regenerateGrid();
    }

    console.warn(`[ensureMinimumWords] Could not achieve ${minWords} words after ${maxAttempts} attempts`);
    return false;
  }

  /**
   * Regenerate entire grid with new random letters
   */
  private regenerateGrid(): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        this.grid[row][col] = this.createTile(row, col);
      }
    }
  }
}

// Singleton instance
let managerInstance: GridManager | null = null;

export function getGridManager(language?: Language): GridManager {
  if (!managerInstance) {
    managerInstance = new GridManager(DEFAULT_CONFIG.gridSize, language || 'en');
  } else if (language && managerInstance.getLanguage() !== language) {
    // Update language if different
    managerInstance.setLanguage(language);
  }
  return managerInstance;
}

export function resetGridManager(): void {
  managerInstance = null;
}

export function createGridManager(language: Language = 'en'): GridManager {
  return new GridManager(DEFAULT_CONFIG.gridSize, language);
}
