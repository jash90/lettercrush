/**
 * Jest Globals Setup
 * Runs before test environment is set up
 * Sets up globals needed for Expo SDK 54+
 */

// Provide structuredClone polyfill for Node < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    if (obj === undefined) return undefined;
    if (obj === null) return null;
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock Expo's import meta registry before any modules load
global.__ExpoImportMetaRegistry = {
  get: () => undefined,
  set: () => {},
};

// Mock import.meta for ESM compatibility
if (typeof globalThis.import === 'undefined') {
  globalThis.import = {};
}
