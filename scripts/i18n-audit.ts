/**
 * i18n Audit Script - Hardcoded String Detection & Translation Generation
 *
 * Scans all TSX files for hardcoded user-facing strings,
 * generates a detailed report, and creates translation suggestions.
 *
 * Usage: npx ts-node scripts/i18n-audit.ts
 *        npx ts-node scripts/i18n-audit.ts --json  (output JSON report)
 *        npx ts-node scripts/i18n-audit.ts --fix   (generate translation entries)
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const APP_DIR = path.join(__dirname, '../app');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

interface HardcodedString {
  file: string;
  line: number;
  column: number;
  type: 'jsx-text' | 'attribute' | 'template-literal' | 'string-prop';
  originalText: string;
  context: string;
  suggestedKey: string;
  suggestedNamespace: string;
}

interface AuditReport {
  timestamp: string;
  totalFiles: number;
  filesWithIssues: number;
  totalHardcodedStrings: number;
  findings: HardcodedString[];
  suggestedTranslations: {
    en: Record<string, unknown>;
    pl: Record<string, unknown>;
  };
}

// Patterns to detect hardcoded strings
const DETECTION_PATTERNS = {
  // JSX text content: >Some Text< (at least 2 chars, starts with letter/number)
  jsxText: />(\s*)([A-Za-z0-9][A-Za-z0-9\s'!?.,:\-()]+?)(\s*)</g,

  // String attributes that typically contain user-facing text
  stringAttributes:
    /(?:title|placeholder|aria-label|alt|accessibilityLabel|accessibilityHint|headerTitle|headerBackTitle)=["']([^"']+)["']/g,

  // String attributes in navigation options
  navigationOptions: /(?:name|title):\s*["']([A-Z][a-zA-Z\s]+)["']/g,

  // Text props commonly used for user-facing content
  textProps: /(?:buttonText|errorMessage|successMessage|label|hint|description)=["']([^"']+)["']/g,

  // Template literals with static text in JSX: {`Some text`}
  templateLiterals: /\{`([A-Za-z][^`${}]+)`\}/g,
};

// Patterns to skip (false positives)
const SKIP_PATTERNS = [
  /^[0-9.%]+$/, // Numbers and percentages
  /^#[0-9a-fA-F]+$/, // Hex colors
  /^\s*$/, // Whitespace only
  /^[a-z]+(-[a-z]+)*$/, // CSS class names (lowercase-hyphenated)
  /^[A-Z_]+$/, // Constants (ALL_CAPS)
  /^\/.*$/, // Paths starting with /
  /^https?:\/\//, // URLs
  /^\.\.\.$/, // Ellipsis
  /^@/, // Decorators/mentions
  /^[a-z]+\.[a-z.]+$/i, // Object paths like colors.text.primary
  /^\d+x\d+$/, // Dimensions like 16x16
  /^[a-z]+_[a-z_]+$/i, // Snake_case identifiers
  /^[a-z]+[A-Z][a-zA-Z]*$/, // camelCase identifiers
  /^testID$/, // Test IDs
  /^\*+$/, // Asterisks
  /^--/, // CSS variables
  /^rgba?\(/, // Color functions
  /^(flex|row|column|center|stretch|auto|none|absolute|relative)$/, // Layout values
  /^[+-]?\d+(\.\d+)?(px|em|rem|%|vh|vw)?$/, // CSS values
  // Code patterns - filter out JavaScript/TypeScript code
  /^[a-zA-Z]+\s*\?\s*\($/, // Ternary operators like "canPause ? ("
  /^\d+\s*\?\s*\($/, // Numeric ternary like "0 ? ("
  /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*&&/, // Logical AND expressions
  /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\|\|/, // Logical OR expressions
  /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?:===?|!==?|<=?|>=?)/, // Comparison operators (==, ===, !=, !==, <, <=, >, >=)
  /^\(+$/, // Opening parentheses only
  /^\)+$/, // Closing parentheses only
  /^[{}\[\]]+$/, // Brackets only
  /^[a-zA-Z]+\s*:\s*$/, // Object key patterns like "key: "
  /^return\s+/, // Return statements
  /^const\s+/, // Const declarations
  /^let\s+/, // Let declarations
  /^if\s*\(/, // If statements
  /^else\s*/, // Else statements
  /^\?\s*$/, // Single question mark
  /^:\s*$/, // Single colon
  /^[a-zA-Z]+\s*\?\s*[a-zA-Z]+/, // Ternary without parens
  /^\s*null\s*$/, // null keyword
  /^\s*undefined\s*$/, // undefined keyword
  /^\s*true\s*$/, // true keyword
  /^\s*false\s*$/, // false keyword
];

// Files/patterns to skip entirely
const SKIP_FILES = [
  'node_modules',
  '.test.',
  '.spec.',
  '__tests__',
  '__mocks__',
  '.d.ts',
  'i18n-check.ts',
  'i18n-audit.ts',
];

/**
 * Check if a string should be skipped
 */
function shouldSkipString(str: string): boolean {
  const trimmed = str.trim();
  if (trimmed.length < 2) return true;
  return SKIP_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Check if a file should be skipped
 */
function shouldSkipFile(filePath: string): boolean {
  return SKIP_FILES.some((pattern) => filePath.includes(pattern));
}

/**
 * Check if a file uses useTranslation hook
 */
function fileUsesTranslation(content: string): boolean {
  return /useTranslation\s*\(/m.test(content);
}

/**
 * Convert a string to camelCase key
 */
function toCamelCaseKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('')
    .slice(0, 30); // Limit key length
}

/**
 * Determine the appropriate namespace based on file path
 */
function determineNamespace(filePath: string): string {
  const relativePath = filePath.replace(/.*\/(src|app)\//, '');

  if (relativePath.includes('Error') || relativePath.includes('Fallback')) {
    return 'errors';
  }
  if (relativePath.includes('game') || relativePath.includes('Game')) {
    return 'game';
  }
  if (relativePath.includes('tutorial') || relativePath.includes('Tutorial')) {
    return 'tutorial';
  }

  // Check for specific components
  if (relativePath.includes('components/')) {
    const componentPath = relativePath.replace('components/', '').replace('.tsx', '');
    if (componentPath.includes('WordBuilder')) return 'game';
    if (componentPath.includes('Score')) return 'game';
    if (componentPath.includes('Grid')) return 'game';
  }

  // Layout and navigation
  if (relativePath.includes('_layout') || relativePath.includes('navigation')) {
    return 'common';
  }

  return 'common';
}

/**
 * Generate a suggested translation key
 */
function generateSuggestedKey(str: string, filePath: string, type: string): { key: string; namespace: string } {
  const namespace = determineNamespace(filePath);
  const relativePath = filePath.replace(/.*\/(src|app)\//, '');

  // Extract component/file name
  let prefix = '';
  if (relativePath.includes('components/')) {
    const parts = relativePath.split('/');
    const componentFile = parts[parts.length - 1].replace('.tsx', '');
    prefix = toCamelCaseKey(componentFile);
  } else if (relativePath.includes('app/')) {
    const fileName = relativePath.replace('app/', '').replace('.tsx', '');
    prefix = toCamelCaseKey(fileName);
  }

  const keyValue = toCamelCaseKey(str);

  // Handle specific patterns
  if (type === 'attribute' && str.toLowerCase().includes('accessibility')) {
    return { key: `${prefix}.accessibility.${keyValue}`, namespace };
  }

  if (prefix) {
    return { key: `${prefix}.${keyValue}`, namespace };
  }

  return { key: keyValue, namespace };
}

/**
 * Get line number for a match position
 */
function getLineNumber(content: string, position: number): { line: number; column: number } {
  const lines = content.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Get context around a match
 */
function getContext(content: string, position: number, matchLength: number): string {
  const lines = content.split('\n');
  const { line } = getLineNumber(content, position);
  const lineIndex = line - 1;

  // Get the line containing the match
  const contextLine = lines[lineIndex] || '';
  return contextLine.trim().substring(0, 100);
}

/**
 * Recursively find all TSX files
 */
function findTsxFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...findTsxFiles(fullPath));
        }
      } else if (entry.name.endsWith('.tsx') && !shouldSkipFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory not accessible
  }

  return files;
}

/**
 * Check if a position is inside a JSX comment
 */
function isInsideJsxComment(content: string, position: number): boolean {
  // Find all JSX comments {/* ... */}
  const jsxCommentPattern = /\{\/\*[\s\S]*?\*\/\}/g;
  let match;
  while ((match = jsxCommentPattern.exec(content)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position >= start && position <= end) {
      return true;
    }
  }
  return false;
}

/**
 * Scan a file for hardcoded strings
 */
function scanFile(filePath: string): HardcodedString[] {
  const findings: HardcodedString[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check each detection pattern
    for (const [patternName, pattern] of Object.entries(DETECTION_PATTERNS)) {
      let match;
      // Reset regex
      pattern.lastIndex = 0;

      while ((match = pattern.exec(content)) !== null) {
        // Skip strings inside JSX comments
        if (isInsideJsxComment(content, match.index)) continue;

        // Get the actual text (might be in different capture groups)
        let text = '';
        if (patternName === 'jsxText') {
          text = match[2]; // Text is in group 2 for JSX
        } else {
          text = match[1];
        }

        if (!text || shouldSkipString(text)) continue;

        const { line, column } = getLineNumber(content, match.index);
        const context = getContext(content, match.index, match[0].length);
        const type = getPatternType(patternName);
        const { key, namespace } = generateSuggestedKey(text, filePath, type);

        findings.push({
          file: filePath.replace(path.join(__dirname, '..') + '/', ''),
          line,
          column,
          type,
          originalText: text.trim(),
          context,
          suggestedKey: key,
          suggestedNamespace: namespace,
        });
      }
    }
  } catch {
    // File not readable
  }

  return findings;
}

/**
 * Map pattern name to type
 */
function getPatternType(patternName: string): HardcodedString['type'] {
  switch (patternName) {
    case 'jsxText':
      return 'jsx-text';
    case 'stringAttributes':
    case 'navigationOptions':
      return 'attribute';
    case 'textProps':
      return 'string-prop';
    case 'templateLiterals':
      return 'template-literal';
    default:
      return 'jsx-text';
  }
}

/**
 * Group findings by namespace and build translation object
 */
function buildTranslationSuggestions(findings: HardcodedString[]): { en: Record<string, unknown>; pl: Record<string, unknown> } {
  const en: Record<string, unknown> = {};
  const pl: Record<string, unknown> = {};

  for (const finding of findings) {
    const { suggestedNamespace, suggestedKey, originalText } = finding;

    // Initialize namespace if needed
    if (!en[suggestedNamespace]) {
      en[suggestedNamespace] = {};
      pl[suggestedNamespace] = {};
    }

    // Build nested structure
    const keyParts = suggestedKey.split('.');
    let enCurrent = en[suggestedNamespace] as Record<string, unknown>;
    let plCurrent = pl[suggestedNamespace] as Record<string, unknown>;

    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i];
      if (!enCurrent[part]) {
        enCurrent[part] = {};
        plCurrent[part] = {};
      }
      enCurrent = enCurrent[part] as Record<string, unknown>;
      plCurrent = plCurrent[part] as Record<string, unknown>;
    }

    const finalKey = keyParts[keyParts.length - 1];
    enCurrent[finalKey] = originalText;
    // Polish placeholder - needs manual translation
    plCurrent[finalKey] = `[PL] ${originalText}`;
  }

  return { en, pl };
}

/**
 * Print the audit report
 */
function printReport(report: AuditReport, showJson: boolean): void {
  console.log('\n');
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(65)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  i18n AUDIT REPORT - Hardcoded Strings Detection${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(65)}${colors.reset}`);
  console.log(`${colors.dim}  Generated: ${report.timestamp}${colors.reset}`);
  console.log();

  // Group findings by file
  const fileGroups = new Map<string, HardcodedString[]>();
  for (const finding of report.findings) {
    if (!fileGroups.has(finding.file)) {
      fileGroups.set(finding.file, []);
    }
    fileGroups.get(finding.file)!.push(finding);
  }

  // Print findings by file
  for (const [file, findings] of fileGroups) {
    console.log(`${colors.blue}📁 ${file}${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(65)}${colors.reset}`);

    for (const finding of findings) {
      const typeIcon =
        finding.type === 'jsx-text'
          ? '📝'
          : finding.type === 'attribute'
            ? '🏷️'
            : finding.type === 'template-literal'
              ? '📋'
              : '🔤';

      console.log(
        `  ${colors.yellow}Line ${finding.line}:${colors.reset} ${typeIcon} "${colors.bright}${finding.originalText}${colors.reset}"`
      );
      console.log(
        `    ${colors.dim}→ ${colors.green}${finding.suggestedNamespace}.${finding.suggestedKey}${colors.reset}`
      );
    }
    console.log();
  }

  // Summary
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(65)}${colors.reset}`);
  console.log(`${colors.bright}  SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(65)}${colors.reset}`);
  console.log(`  📊 Total files scanned: ${colors.bright}${report.totalFiles}${colors.reset}`);
  console.log(`  📁 Files with issues: ${colors.bright}${report.filesWithIssues}${colors.reset}`);
  console.log(
    `  🔤 Hardcoded strings found: ${colors.bright}${colors.yellow}${report.totalHardcodedStrings}${colors.reset}`
  );
  console.log();

  // Show suggested translations
  if (report.totalHardcodedStrings > 0) {
    console.log(`${colors.bright}${colors.green}📋 GENERATED TRANSLATIONS (en.json additions):${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(65)}${colors.reset}`);
    console.log(JSON.stringify(report.suggestedTranslations.en, null, 2));
    console.log();

    console.log(`${colors.bright}${colors.magenta}📋 GENERATED TRANSLATIONS (pl.json - needs manual translation):${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(65)}${colors.reset}`);
    console.log(JSON.stringify(report.suggestedTranslations.pl, null, 2));
    console.log();
  }

  // JSON output if requested
  if (showJson) {
    console.log(`${colors.bright}${colors.blue}📄 FULL JSON REPORT:${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(65)}${colors.reset}`);
    console.log(JSON.stringify(report, null, 2));
  }
}

/**
 * Main audit function
 */
function audit(): void {
  const args = process.argv.slice(2);
  const showJson = args.includes('--json');
  const generateFix = args.includes('--fix');

  // Find all TSX files
  const appFiles = findTsxFiles(APP_DIR);
  const srcFiles = findTsxFiles(SRC_DIR);
  const allFiles = [...appFiles, ...srcFiles];

  console.log(`\n${colors.cyan}🔍 Scanning ${allFiles.length} TSX files for hardcoded strings...${colors.reset}\n`);

  // Scan all files
  const allFindings: HardcodedString[] = [];
  const filesWithIssues = new Set<string>();

  for (const file of allFiles) {
    const findings = scanFile(file);
    if (findings.length > 0) {
      allFindings.push(...findings);
      filesWithIssues.add(file);
    }
  }

  // Build translation suggestions
  const suggestedTranslations = buildTranslationSuggestions(allFindings);

  // Create report
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    filesWithIssues: filesWithIssues.size,
    totalHardcodedStrings: allFindings.length,
    findings: allFindings,
    suggestedTranslations,
  };

  // Print report
  printReport(report, showJson);

  // Generate fix file if requested
  if (generateFix && allFindings.length > 0) {
    const reportPath = path.join(__dirname, 'i18n-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`${colors.green}✅ Report saved to: scripts/i18n-audit-report.json${colors.reset}\n`);
  }

  // Exit with appropriate code
  if (allFindings.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Found ${allFindings.length} hardcoded strings that need translation.${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ No hardcoded strings found! All text is properly internationalized.${colors.reset}\n`);
    process.exit(0);
  }
}

// Run audit
audit();
