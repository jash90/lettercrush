/**
 * Root Layout - Navigation configuration
 * Wraps app with ErrorBoundary for graceful error handling
 * Handles first-run language selection redirect
 * Loads dictionary on app start
 */

import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useLanguageStore } from '../src/stores/languageStore';
import { seedDictionaryIfNeeded } from '../src/services/dictionarySeeder';
import { initDatabase } from '../src/db';
import { getAdService } from '../src/services/AdService';
import { colors } from '../src/theme';
import { logger } from '../src/utils/logger';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
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
      setLoadingMessage('Loading dictionary...');
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
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
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
              title: 'LetterCrush',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="game"
            options={{
              title: 'LetterCrush',
              headerBackTitle: 'Menu',
            }}
          />
          <Stack.Screen
            name="stats"
            options={{
              title: 'Highscores',
              headerBackTitle: 'Menu',
            }}
          />
          <Stack.Screen
            name="tutorial"
            options={{
              title: 'How to Play',
              headerBackTitle: 'Menu',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerBackTitle: 'Menu',
            }}
          />
          <Stack.Screen
            name="language-select"
            options={{
              title: 'Select Language',
              headerShown: false,
            }}
          />
        </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

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
