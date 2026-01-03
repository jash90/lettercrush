/**
 * Mock for Expo's winter runtime
 * Prevents runtime errors during Jest tests
 */

// Provide structuredClone if not available (Node < 17)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

module.exports = {};
