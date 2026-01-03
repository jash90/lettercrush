/**
 * LanguageButton Component
 * Language selection button for onboarding
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export interface LanguageButtonProps {
  flag: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function LanguageButton({ flag, title, subtitle, onPress }: LanguageButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.languageButton,
        pressed && styles.languageButtonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${title}`}
    >
      <Text style={styles.flag}>{flag}</Text>
      <Text style={styles.languageTitle}>{title}</Text>
      <Text style={styles.languageSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    flex: 1,
    maxWidth: 160,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
  },
  languageButtonPressed: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.accent.primary,
    transform: [{ scale: 0.98 }],
  },
  flag: {
    fontSize: 48,
    marginBottom: 12,
  },
  languageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  languageSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
