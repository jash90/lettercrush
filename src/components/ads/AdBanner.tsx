/**
 * AdBanner Component
 * Displays a banner ad at the bottom of the game screen
 * Styled to match the "Nighttime Candy" theme
 */

import React, { memo, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BannerAd, BannerAdSize, useForeground } from 'react-native-google-mobile-ads';
import { colors, spacing } from '../../theme';
import { adConfig } from '../../config/adConfig';
import { logger } from '../../utils/logger';

interface AdBannerProps {
  visible?: boolean;
  testID?: string;
}

export const AdBanner = memo(function AdBanner({
  visible = true,
  testID = 'ad-banner',
}: AdBannerProps) {
  const { t } = useTranslation('common');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const bannerRef = useRef<BannerAd>(null);

  // iOS: Reload ad when app returns to foreground
  // WKWebView can terminate when app is suspended, causing empty banner
  useForeground(() => {
    Platform.OS === 'ios' && bannerRef.current?.load();
  });

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
      accessibilityLabel={t('ads.label')}
      accessibilityRole="none"
    >
      <BannerAd
        ref={bannerRef}
        unitId={adConfig.unitIds.banner}
        size={BannerAdSize.BANNER}
        requestOptions={adConfig.banner.requestOptions}
        onAdLoaded={() => {
          logger.log('[AdBanner] Ad loaded');
          setIsLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          logger.error('[AdBanner] Failed to load:', error);
          setHasError(true);
        }}
      />
      {!isLoaded && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{t('ads.loading')}</Text>
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
