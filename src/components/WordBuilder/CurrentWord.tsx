/**
 * CurrentWord Component
 * Displays the word being built from selected letters
 * Memoized for optimal re-rendering
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme';

interface CurrentWordProps {
  word: string;
  error: string | null;
  combo: number;
}

export const CurrentWord = memo(function CurrentWord({ word, error, combo }: CurrentWordProps) {
  const isEmpty = word.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.wordContainer}>
        {isEmpty ? (
          <Text style={styles.placeholder}>Tap letters to spell a word...</Text>
        ) : (
          <View style={styles.wordRow}>
            <Text style={styles.word}>{word}</Text>
            {combo > 1 && (
              <View style={styles.comboBadge}>
                <Text style={styles.comboText}>x{combo}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!isEmpty && !error && (
        <Text style={styles.hint}>
          {word.length < 3
            ? `Need ${3 - word.length} more letter${3 - word.length > 1 ? 's' : ''}`
            : 'Ready to submit!'
          }
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    height: 70
  },
  wordContainer: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.background.tertiary,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  comboBadge: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  comboText: {
    color: colors.accent.gold,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  word: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.accent.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  error: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.status.error,
    fontWeight: '500',
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
});
