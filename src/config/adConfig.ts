/**
 * AdMob Configuration
 * Uses test ad unit IDs for development
 * Replace with production IDs before release
 */

import { Platform } from 'react-native';

// Google's official test ad unit IDs
const TEST_IDS = {
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
};

// Production IDs (to be replaced with your actual AdMob IDs)
const PRODUCTION_IDS = {
  banner: {
    ios: 'YOUR_IOS_BANNER_ID',
    android: 'YOUR_ANDROID_BANNER_ID',
  },
  interstitial: {
    ios: 'YOUR_IOS_INTERSTITIAL_ID',
    android: 'YOUR_ANDROID_INTERSTITIAL_ID',
  },
};

const isDev = __DEV__;

export const adConfig = {
  appId: {
    ios: isDev ? 'ca-app-pub-3940256099942544~1458002511' : 'YOUR_IOS_APP_ID',
    android: isDev ? 'ca-app-pub-3940256099942544~3347511713' : 'YOUR_ANDROID_APP_ID',
  },
  unitIds: {
    banner: Platform.select({
      ios: isDev ? TEST_IDS.banner.ios : PRODUCTION_IDS.banner.ios,
      android: isDev ? TEST_IDS.banner.android : PRODUCTION_IDS.banner.android,
      default: TEST_IDS.banner.android,
    }),
    interstitial: Platform.select({
      ios: isDev ? TEST_IDS.interstitial.ios : PRODUCTION_IDS.interstitial.ios,
      android: isDev ? TEST_IDS.interstitial.android : PRODUCTION_IDS.interstitial.android,
      default: TEST_IDS.interstitial.android,
    }),
  },
  // Banner configuration
  banner: {
    requestOptions: {
      requestNonPersonalizedAdsOnly: true,
    },
  },
  // Interstitial configuration
  interstitial: {
    showOnGameOver: true,
    preloadOnInit: true,
  },
} as const;
