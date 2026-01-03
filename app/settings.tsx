/**
 * Settings Screen - App configuration
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { clearHighscores, getWordCount } from '../src/db';
import { useLanguageStore } from '../src/stores/languageStore';
import { SettingsSection, LanguageOption } from '../src/components/settings';
import { colors } from '../src/theme';
import type { Language } from '../src/types/game.types';
import packageJson from '../package.json';

export default function SettingsScreen() {
  const [wordCount, setWordCount] = React.useState(0);
  const { language, setLanguage } = useLanguageStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Refresh word count when screen is focused or language changes
  useFocusEffect(
    useCallback(() => {
      setWordCount(getWordCount());
    }, [language])
  );

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClearScores = () => {
    Alert.alert(
      'Clear All Scores',
      'Are you sure you want to delete all your highscores? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearHighscores();
            Alert.alert('Done', 'All highscores have been cleared.');
          },
        },
      ]
    );
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Language Selection */}
          <SettingsSection title="Language" icon="globe" color={colors.accent.secondary}>
            <View style={styles.languageOptions}>
              <LanguageOption
                flag="🇬🇧"
                name="English"
                code="en"
                selected={language === 'en'}
                onSelect={() => handleLanguageChange('en')}
              />
              <LanguageOption
                flag="🇵🇱"
                name="Polski"
                code="pl"
                selected={language === 'pl'}
                onSelect={() => handleLanguageChange('pl')}
              />
            </View>
          </SettingsSection>

          {/* Dictionary Info */}
          <SettingsSection title="Dictionary" icon="book" color={colors.accent.orange}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current language</Text>
              <Text style={styles.infoValue}>
                {language === 'en' ? '🇬🇧 English' : '🇵🇱 Polski'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Words loaded</Text>
              <Text style={styles.infoValue}>{wordCount.toLocaleString()}</Text>
            </View>
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection title="Data" icon="server" color={colors.accent.warning}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && styles.dangerButtonPressed,
              ]}
              onPress={handleClearScores}
            >
              <Ionicons name="trash-outline" size={20} color={colors.accent.error} />
              <Text style={styles.dangerButtonText}>Clear All Highscores</Text>
            </Pressable>
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About" icon="information-circle" color={colors.accent.success}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{packageJson.version}</Text>
            </View>
          </SettingsSection>

          {/* Credits */}
          <View style={styles.credits}>
            <Text style={styles.creditsText}>Made with Raccoon Software</Text>
            <Image source={require('../assets/raccoon.png')} style={styles.raccoonSoftwareLogo} />
            <Text style={styles.creditsSubtext}>LetterCrush © 2026</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  languageOptions: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.text.muted,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: colors.accent.error + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent.error,
    gap: 8,
  },
  dangerButtonPressed: {
    backgroundColor: colors.accent.error + '40',
  },
  dangerButtonText: {
    fontSize: 15,
    color: colors.accent.error,
    fontWeight: '600',
  },
  credits: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  creditsText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  creditsSubtext: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  raccoonSoftwareLogo: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});
