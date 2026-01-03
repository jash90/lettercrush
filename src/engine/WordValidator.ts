/**
 * WordValidator - Trie-based dictionary for fast word validation
 * Efficiently validates words using a prefix tree (Trie) data structure
 */

class TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;

  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

export class WordValidator {
  private root: TrieNode;
  private wordCount: number;

  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  /**
   * Load dictionary from an array of words
   */
  loadDictionary(words: string[]): void {
    this.root = new TrieNode();
    this.wordCount = 0;

    for (const word of words) {
      this.addWord(word.toUpperCase());
    }
  }

  /**
   * Add a single word to the dictionary
   */
  addWord(word: string): void {
    if (word.length < 3) return; // Minimum word length

    let node = this.root;
    const upperWord = word.toUpperCase();

    for (const char of upperWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }

    if (!node.isWord) {
      node.isWord = true;
      this.wordCount++;
    }
  }

  /**
   * Check if a word exists in the dictionary
   */
  isValidWord(word: string): boolean {
    if (word.length < 3) return false;

    const node = this.findNode(word.toUpperCase());
    return node !== null && node.isWord;
  }

  /**
   * Check if a prefix exists in the dictionary
   * Useful for early termination during word search
   */
  hasPrefix(prefix: string): boolean {
    return this.findNode(prefix.toUpperCase()) !== null;
  }

  /**
   * Find all valid words starting with a prefix
   */
  findWordsWithPrefix(prefix: string, maxResults: number = 10): string[] {
    const results: string[] = [];
    const node = this.findNode(prefix.toUpperCase());

    if (node) {
      this.collectWords(node, prefix.toUpperCase(), results, maxResults);
    }

    return results;
  }

  /**
   * Get total word count
   */
  getWordCount(): number {
    return this.wordCount;
  }

  /**
   * Find node for a given string
   */
  private findNode(str: string): TrieNode | null {
    let node = this.root;

    for (const char of str) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }

    return node;
  }

  /**
   * Recursively collect words from a node
   */
  private collectWords(
    node: TrieNode,
    prefix: string,
    results: string[],
    maxResults: number
  ): void {
    if (results.length >= maxResults) return;

    if (node.isWord) {
      results.push(prefix);
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, results, maxResults);
    }
  }
}

// Singleton instance
let validatorInstance: WordValidator | null = null;

export function getWordValidator(): WordValidator {
  if (!validatorInstance) {
    validatorInstance = new WordValidator();
  }
  return validatorInstance;
}

export function resetWordValidator(): void {
  validatorInstance = null;
}

/**
 * Factory function for creating new WordValidator instances
 * Use for testing or when you need isolated validation contexts
 */
export function createWordValidator(): WordValidator {
  return new WordValidator();
}
