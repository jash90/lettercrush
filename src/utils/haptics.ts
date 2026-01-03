/**
 * Haptics Utility
 * Platform-safe haptic feedback for iOS/Android
 * Silent on web platform
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

/**
 * Haptic feedback utilities with platform safety
 */
export const haptics = {
  /**
   * Light selection feedback - use for tile selection
   */
  selection: (): void => {
    if (isNative) {
      Haptics.selectionAsync();
    }
  },

  /**
   * Success notification - use for valid word submission
   */
  success: (): void => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Error notification - use for invalid word rejection
   */
  error: (): void => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Warning notification - use for game over, low moves
   */
  warning: (): void => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Impact feedback - configurable intensity
   * @param style - 'light' | 'medium' | 'heavy'
   */
  impact: (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
    if (!isNative) return;

    const styles = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };

    Haptics.impactAsync(styles[style]);
  },
};
