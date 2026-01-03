/**
 * LanguageOption Component
 * Language selection option for settings
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import type { Language } from '../../types/game.types';

export interface LanguageOptionProps {
  flag: string;
  name: string;
  code: Language;
  selected: boolean;
  onSelect: () => void;
}

export function LanguageOption({ flag, name, selected, onSelect }: LanguageOptionProps) {
  return (
    <Pressable
      style={[styles.languageOption, selected && styles.languageOptionSelected]}
      onPress={onSelect}
    >
      <Text style={styles.languageFlag}>{flag}</Text>
      <Text style={[styles.languageName, selected && styles.languageNameSelected]}>
        {name}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={20} color={colors.accent.success} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: colors.accent.success,
    backgroundColor: colors.accent.success + '10',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  languageNameSelected: {
    fontWeight: '600',
  },
});
