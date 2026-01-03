
import { GridManager } from '../GridManager';
import { WordValidator, getWordValidator } from '../WordValidator';

describe('Debug Mode Logic Verification', () => {
  let gridManager: GridManager;
  let validator: WordValidator;

  beforeEach(() => {
    gridManager = new GridManager(6, 'en');
    validator = getWordValidator();
    // Reset validator
    validator.loadDictionary([]);
  });

  test('findWordsWithPositions identifies specific words correctly', () => {
    // Setup a grid with a known word "CAT" and random junk
    // We use a manual setup to avoid the random seeding
    const grid = gridManager.initialize(0); 
    
    // Clear grid to be safe
    for(let r=0; r<6; r++) {
        for(let c=0; c<6; c++) {
            grid[r][c].letter = 'X'; // Fill with X
        }
    }

    // Manually set "CAT" at (0,0), (0,1), (0,2)
    grid[0][0].letter = 'C';
    grid[0][1].letter = 'A';
    grid[0][2].letter = 'T';
    
    // Mock dictionary with just "CAT"
    validator.loadDictionary(['CAT']);

    const matches = gridManager.findWordsWithPositions();
    
    // Should find CAT
    const catMatch = matches.find(m => m.word === 'CAT');
    expect(catMatch).toBeDefined();
    
    // Should NOT find XXX if not in dictionary
    const junkMatch = matches.find(m => m.word === 'XXX');
    expect(junkMatch).toBeUndefined();

    // Collect all highlighted positions
    const uniquePos = new Set<string>();
    matches.forEach(m => {
      m.positions.forEach(p => uniquePos.add(`${p.row},${p.col}`));
    });

    // Expect exactly 3 positions to be highlighted (0,0), (0,1), (0,2)
    expect(uniquePos.size).toBe(3);
    expect(uniquePos.has('0,0')).toBe(true);
    expect(uniquePos.has('0,1')).toBe(true);
    expect(uniquePos.has('0,2')).toBe(true);
  });

  test('High density grid highlights most letters', () => {
    const grid = gridManager.initialize(0);
    
    // Fill with "A"
    for(let r=0; r<6; r++) {
        for(let c=0; c<6; c++) {
            grid[r][c].letter = 'A';
        }
    }

    // Dictionary "AAA"
    validator.loadDictionary(['AAA']);

    const matches = gridManager.findWordsWithPositions();
    
    const uniquePos = new Set<string>();
    matches.forEach(m => {
      m.positions.forEach(p => uniquePos.add(`${p.row},${p.col}`));
    });

    // In a grid of all A's, with "AAA" as a word, EVERY tile should be part of some "AAA" 
    // (horizontal, vertical, diagonal)
    expect(uniquePos.size).toBe(36);
  });

  test('Filtering logic reduces noise', () => {
    // Setup a grid
    const grid = gridManager.initialize(0);
    for(let r=0; r<6; r++) for(let c=0; c<6; c++) grid[r][c].letter = 'X';

    // Set "CATS" (4)
    grid[0][0].letter = 'C';
    grid[0][1].letter = 'A';
    grid[0][2].letter = 'T';
    grid[0][3].letter = 'S';

    // Set "DOG" (3)
    grid[1][0].letter = 'D';
    grid[1][1].letter = 'O';
    grid[1][2].letter = 'G';

    // Dictionary
    validator.loadDictionary(['CATS', 'DOG']);

    const matches = gridManager.findWordsWithPositions();
    
    // Apply filtering logic (simulation of useGame.ts)
    let interestingMatches = matches.filter(m => m.word.length >= 4);
    if (interestingMatches.length === 0) {
        interestingMatches = matches;
    }

    const uniquePos = new Set<string>();
    interestingMatches.forEach(m => {
      m.positions.forEach(p => uniquePos.add(`${p.row},${p.col}`));
    });

    // Should only have 4 positions (CATS), ignoring DOG because we found a 4-letter word
    expect(uniquePos.size).toBe(4);
  });
});
