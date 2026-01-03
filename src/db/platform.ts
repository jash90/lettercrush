/**
 * Platform Detection Utility
 * Determines if running on web or native platform
 */

import { Platform } from 'react-native';

/**
 * Check if running on web platform
 */
export const isWeb = Platform.OS === 'web';

/**
 * Check if running on native platform (iOS/Android)
 */
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Get current platform name
 */
export const platformName = Platform.OS;
