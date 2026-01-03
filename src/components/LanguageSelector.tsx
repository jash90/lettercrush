/**
 * LanguageSelector Component
 * Toggle button for switching between English and Polish
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Language } from '../types/game.types';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface LanguageSelectorProps {
  language: Language;
  onChangeLanguage: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  language,
  onChangeLanguage,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => !disabled && onChangeLanguage('en')}
        style={[
          styles.option,
          language === 'en' && styles.activeOption,
          disabled && styles.disabledOption,
        ]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Switch to English"
        accessibilityState={{ selected: language === 'en', disabled }}
      >
        <Text style={styles.flag}>🇬🇧</Text>
        <Text style={[
          styles.label,
          language === 'en' && styles.activeLabel,
        ]}>
          EN
        </Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={() => !disabled && onChangeLanguage('pl')}
        style={[
          styles.option,
          language === 'pl' && styles.activeOption,
          disabled && styles.disabledOption,
        ]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Switch to Polish"
        accessibilityState={{ selected: language === 'pl', disabled }}
      >
        <Text style={styles.flag}>🇵🇱</Text>
        <Text style={[
          styles.label,
          language === 'pl' && styles.activeLabel,
        ]}>
          PL
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.background.secondary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  activeOption: {
    backgroundColor: colors.accent.primary,
  },
  disabledOption: {
    opacity: 0.5,
  },
  flag: {
    fontSize: fontSize.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  activeLabel: {
    color: colors.button.text,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.background.secondary,
    marginHorizontal: 2,
  },
});
