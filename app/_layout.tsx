/**
 * Root Layout - Navigation configuration
 * Wraps app with ErrorBoundary for graceful error handling
 * Handles first-run language selection redirect
 * Loads dictionary on app start
 */

// Intl polyfills for Hermes engine (must be imported before any i18n usage)
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill-force';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/pl';

// Import i18n configuration (initializes i18next)
import '../src/i18n';

import * as Sentry from '@sentry/react-native';

// Initialize Sentry before any React rendering
Sentry.init({
  dsn: 'https://1c94dcfe1f81ea60f62d5e2ab5e3959f@o303506.ingest.us.sentry.io/4510647836409856',
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  sendDefaultPii: !__DEV__,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  // Learn more at
  // https://docs.sentry.io/platforms/react-native/configuration/options/#traces-sample-rate
  // Enable logs to be sent to Sentry
  // Learn more at https://docs.sentry.io/platforms/react-native/logs/
  enableLogs: !__DEV__,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: !__DEV__ ? 1.0 : 0.1,
  // Record session replays for 100% of errors and 10% of sessions
  replaysOnErrorSampleRate: !__DEV__ ? 1.0 : 0.1,
  replaysSessionSampleRate: !__DEV__ ? 0.1 : 0.01,
  integrations: [Sentry.mobileReplayIntegration()],

});

import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useLanguageStore } from '../src/stores/languageStore';
import { seedDictionaryIfNeeded } from '../src/services/dictionarySeeder';
import { initDatabase } from '../src/db';
import { getAdService } from '../src/services/AdService';
import { colors } from '../src/theme';
import { logger } from '../src/utils/logger';

export default Sentry.wrap(function RootLayout() {
  const { t } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const [isReady, setIsReady] = useState(false);
  const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const segments = useSegments();

  const { isLoaded, isFirstRun, language, loadLanguage } = useLanguageStore(
    useShallow((state) => ({
      isLoaded: state.isLoaded,
      isFirstRun: state.isFirstRun,
      language: state.language,
      loadLanguage: state.loadLanguage,
    }))
  );

  // Load language preferences on mount
  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  // Load dictionary after language is loaded (skip on first run until language selected)
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isFirstRun) {
      // First run - wait for language selection, don't block navigation
      setIsDictionaryLoaded(true);
      return;
    }

    // Reset loaded state to show loading screen while dictionary loads
    setIsDictionaryLoaded(false);

    const loadDictionary = async () => {
      setLoadingMessage('dictionary');
      try {
        await initDatabase();
        const result = await seedDictionaryIfNeeded(language);
        logger.log(`[RootLayout] Dictionary loaded: ${result.wordCount} words`);
      } catch (error) {
        logger.error('[RootLayout] Failed to load dictionary:', error);
      }
      setIsDictionaryLoaded(true);
    };

    loadDictionary();
  }, [isLoaded, isFirstRun, language]);

  // Handle first-run redirect
  useEffect(() => {
    if (!isLoaded || !isDictionaryLoaded) return;

    const inLanguageSelect = segments[0] === 'language-select';

    if (isFirstRun && !inLanguageSelect) {
      // First run: redirect to language selection
      router.replace('/language-select');
    } else if (!isFirstRun && inLanguageSelect) {
      // Not first run but on language select: redirect to home
      router.replace('/');
    }

    setIsReady(true);

    // Request ATT permission on iOS before initializing ads
    const initializeAds = async () => {
      if (Platform.OS === 'ios') {
        await requestTrackingPermissionsAsync();
      }
      getAdService().initialize();
    };
    initializeAds();
  }, [isLoaded, isFirstRun, isDictionaryLoaded, segments]);

  // Show loading screen while checking first-run status or loading dictionary
  if (!isLoaded || !isDictionaryLoaded || !isReady) {
    const displayMessage = loadingMessage === 'dictionary'
      ? tErrors('blocked.dictionary.loading')
      : t('loading');
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>{displayMessage}</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StatusBar style="light" />
          <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: colors.background.primary },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: t('appName'),
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="game"
            options={{
              title: t('appName'),
              headerBackTitle: t('navigation.menu'),
            }}
          />
          <Stack.Screen
            name="stats"
            options={{
              title: t('menu.highscores.title'),
              headerBackTitle: t('navigation.menu'),
            }}
          />
          <Stack.Screen
            name="tutorial"
            options={{
              title: t('menu.howToPlay.title'),
              headerBackTitle: t('navigation.menu'),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: t('menu.settings.title'),
              headerBackTitle: t('navigation.menu'),
            }}
          />
          <Stack.Screen
            name="language-select"
            options={{
              title: t('navigation.selectLanguage'),
              headerShown: false,
            }}
          />
        </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text.primary,
  },
});