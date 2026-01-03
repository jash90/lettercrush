/**
 * i18n Validation Script
 * Compares translation keys between EN and PL files
 * Reports missing translations, orphaned keys, and unused keys
 *
 * Usage: npx ts-node scripts/i18n-check.ts
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const SRC_DIR = path.join(__dirname, '../src');
const APP_DIR = path.join(__dirname, '../app');

// Consolidated translation file paths
const EN_FILE = path.join(LOCALES_DIR, 'en.json');
const PL_FILE = path.join(LOCALES_DIR, 'pl.json');

interface TranslationObject {
  [key: string]: string | TranslationObject | string[];
}

/**
 * Recursively extract all keys from a translation object
 */
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      // Arrays are treated as leaf values (e.g., proTips.tips)
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as TranslationObject, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Load and parse a JSON translation file
 */
function loadTranslationFile(filePath: string): TranslationObject | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Get all namespaces from a consolidated translation file
 */
function getNamespacesFromFile(filePath: string): string[] {
  const data = loadTranslationFile(filePath);
  if (!data) return [];
  return Object.keys(data);
}

/**
 * Recursively find all source files
 */
function findSourceFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...findSourceFiles(fullPath, extensions));
        }
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist or is not readable
  }

  return files;
}

/**
 * Extract translation key usages from source files
 */
function extractUsedKeys(files: string[]): Set<string> {
  const usedKeys = new Set<string>();

  // Patterns to match t() calls with various quote styles
  const patterns = [
    /t\(['"]([^'"]+)['"]/g,
    /t\(`([^`]+)`/g,
    /useTranslation\(['"]([^'"]+)['"]\)/g,
  ];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          usedKeys.add(match[1]);
        }
        // Reset regex state
        pattern.lastIndex = 0;
      }
    } catch {
      // File not readable
    }
  }

  return usedKeys;
}

interface ValidationResult {
  namespace: string;
  missingInPL: string[];
  missingInEN: string[];
  enKeyCount: number;
  plKeyCount: number;
}

/**
 * Plural suffixes for different languages
 * English: _one, _other
 * Polish: _one, _few, _many
 */
const PLURAL_SUFFIXES = ['_one', '_other', '_few', '_many', '_zero'];

/**
 * Get the base key without plural suffix
 */
function getBaseKey(key: string): string {
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
  }
  return key;
}

/**
 * Check if a key is a plural form
 */
function isPluralKey(key: string): boolean {
  return PLURAL_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Filter out plural key mismatches (different languages use different plural forms)
 */
function filterPluralMismatches(keys: string[], otherKeys: string[]): string[] {
  const otherBaseKeys = new Set(otherKeys.map(getBaseKey));
  return keys.filter((key) => {
    if (isPluralKey(key)) {
      // For plural keys, check if the base key exists in other language
      const baseKey = getBaseKey(key);
      return !otherBaseKeys.has(baseKey);
    }
    return true;
  });
}

/**
 * Compare translations between EN and PL for a namespace in consolidated files
 */
function compareNamespace(namespace: string, enData: TranslationObject, plData: TranslationObject): ValidationResult {
  const enNamespaceData = enData[namespace] as TranslationObject | undefined;
  const plNamespaceData = plData[namespace] as TranslationObject | undefined;

  const enKeys = enNamespaceData ? extractKeys(enNamespaceData) : [];
  const plKeys = plNamespaceData ? extractKeys(plNamespaceData) : [];

  const enKeySet = new Set(enKeys);
  const plKeySet = new Set(plKeys);

  // Get raw missing keys
  const rawMissingInPL = enKeys.filter((key) => !plKeySet.has(key));
  const rawMissingInEN = plKeys.filter((key) => !enKeySet.has(key));

  // Filter out expected plural form differences
  const missingInPL = filterPluralMismatches(rawMissingInPL, plKeys);
  const missingInEN = filterPluralMismatches(rawMissingInEN, enKeys);

  return {
    namespace,
    missingInPL,
    missingInEN,
    enKeyCount: enKeys.length,
    plKeyCount: plKeys.length,
  };
}

/**
 * Main validation function
 */
function validate(): void {
  console.log('🔍 LetterCrush i18n Validation\n');
  console.log('='.repeat(50));

  // Load consolidated translation files
  const enData = loadTranslationFile(EN_FILE);
  const plData = loadTranslationFile(PL_FILE);

  if (!enData) {
    console.log('\n❌ English translation file not found: en.json\n');
    process.exit(1);
  }

  if (!plData) {
    console.log('\n❌ Polish translation file not found: pl.json\n');
    process.exit(1);
  }

  // Get namespaces from consolidated files
  const enNamespaces = Object.keys(enData);
  const plNamespaces = Object.keys(plData);
  const allNamespaces = [...new Set([...enNamespaces, ...plNamespaces])];

  if (allNamespaces.length === 0) {
    console.log('\n❌ No namespaces found in translation files!\n');
    process.exit(1);
  }

  console.log(`\n📁 Consolidated files: en.json, pl.json`);
  console.log(`📋 Found ${allNamespaces.length} namespace(s): ${allNamespaces.join(', ')}\n`);

  let totalMissingInPL = 0;
  let totalMissingInEN = 0;
  let totalKeys = 0;

  // Compare each namespace
  for (const namespace of allNamespaces) {
    const result = compareNamespace(namespace, enData, plData);
    totalKeys += result.enKeyCount;

    console.log(`\n📋 Namespace: ${namespace}`);
    console.log(`   EN keys: ${result.enKeyCount} | PL keys: ${result.plKeyCount}`);

    if (result.missingInPL.length > 0) {
      totalMissingInPL += result.missingInPL.length;
      console.log(`\n   ⚠️  Missing in PL (${result.missingInPL.length}):`);
      result.missingInPL.forEach((key) => console.log(`      - ${key}`));
    }

    if (result.missingInEN.length > 0) {
      totalMissingInEN += result.missingInEN.length;
      console.log(`\n   ⚠️  Orphaned in PL (missing in EN) (${result.missingInEN.length}):`);
      result.missingInEN.forEach((key) => console.log(`      - ${key}`));
    }

    if (result.missingInPL.length === 0 && result.missingInEN.length === 0) {
      console.log(`   ✅ All keys synchronized`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Total namespaces: ${allNamespaces.length}`);
  console.log(`   Total EN keys: ${totalKeys}`);
  console.log(`   Missing in PL: ${totalMissingInPL}`);
  console.log(`   Orphaned in PL: ${totalMissingInEN}`);

  // Find unused keys (optional - can be slow for large codebases)
  console.log('\n🔎 Checking for unused keys...');

  const sourceFiles = [...findSourceFiles(SRC_DIR), ...findSourceFiles(APP_DIR)];
  const usedKeys = extractUsedKeys(sourceFiles);

  console.log(`   Found ${sourceFiles.length} source files`);
  console.log(`   Found ${usedKeys.size} translation key references\n`);

  // Final status
  if (totalMissingInPL === 0 && totalMissingInEN === 0) {
    console.log('✅ All translations are synchronized!\n');
    process.exit(0);
  } else {
    console.log('❌ Translation issues found. Please fix the above issues.\n');
    process.exit(1);
  }
}

// Run validation
validate();
