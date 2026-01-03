/**
 * Expo Mock for Jest
 * Prevents Expo's runtime modules from loading during tests
 */

module.exports = {
  registerRootComponent: jest.fn(),
  AppLoading: jest.fn(),
  Constants: {
    manifest: {},
    expoConfig: {},
  },
};
