/**
 * AdBanner Component
 * Displays a banner ad at the bottom of the game screen
 * Styled to match the "Nighttime Candy" theme
 */

import React, { memo, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { colors, spacing } from '../../theme';
import { adConfig } from '../../config/adConfig';

interface AdBannerProps {
  visible?: boolean;
  testID?: string;
}

export const AdBanner = memo(function AdBanner({
  visible = true,
  testID = 'ad-banner',
}: AdBannerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Don't render if not visible or if there was an error
  if (!visible || hasError) {
    return null;
  }

  // Don't render on web (AdMob doesn't support web)
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel="Advertisement"
      accessibilityRole="none"
    >
      <BannerAd
        unitId={adConfig.unitIds.banner}
        size={BannerAdSize.BANNER}
        requestOptions={adConfig.banner.requestOptions}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded');
          setIsLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdBanner] Failed to load:', error);
          setHasError(true);
        }}
      />
      {!isLoaded && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Ad loading...</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
    minHeight: 50, // Standard banner height
  },
  placeholder: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 320,
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  placeholderText: {
    color: colors.text.muted,
    fontSize: 12,
  },
});
