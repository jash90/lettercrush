/**
 * Language Selection Screen - First-run onboarding
 * Shown on initial app launch to select preferred language
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../src/stores/languageStore';
import { LanguageButton } from '../src/components/LanguageButton';
import { colors } from '../src/theme';
import type { Language } from '../src/types/game.types';

export default function LanguageSelectScreen() {
  const { t } = useTranslation('common');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  const { setLanguage, completeFirstRun } = useLanguageStore(
    useShallow((state) => ({
      setLanguage: state.setLanguage,
      completeFirstRun: state.completeFirstRun,
    }))
  );

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectLanguage = async (language: Language) => {
    await setLanguage(language);
    await completeFirstRun();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Logo & Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔤</Text>
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={styles.subtitle}>{t('languageSelect.title')}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageContainer}>
          <LanguageButton
            flag="🇬🇧"
            title="English"
            subtitle={t('languageSelect.playInEnglish')}
            onPress={() => handleSelectLanguage('en')}
          />
          <LanguageButton
            flag="🇵🇱"
            title="Polski"
            subtitle={t('languageSelect.playInPolish')}
            onPress={() => handleSelectLanguage('pl')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('languageSelect.hint')}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.accent.primary,
    textShadowColor: 'rgba(240, 74, 140, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 20,
    color: colors.text.primary,
    marginTop: 16,
    fontWeight: '500',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.muted,
  },
});
