/**
 * StatsSection Component
 * Displays game statistics in a card layout
 * Pure presentational component
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatRow } from './StatRow';
import { colors, spacing, borderRadius, fontSize } from '../../../theme';

/** Game statistics data */
export interface GameStats {
  wordsFound: number;
  longestWord: string;
  bestCombo: number;
  moves: number;
  highScore: number;
}

interface StatsSectionProps {
  stats: GameStats;
}

export const StatsSection = memo(function StatsSection({
  stats,
}: StatsSectionProps) {
  const { wordsFound, longestWord, bestCombo, moves, highScore } = stats;

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel="Game statistics"
    >
      <Text style={styles.title}>Stats</Text>
      <View style={styles.divider} />

      <StatRow label="Words Found" value={wordsFound} />
      <StatRow
        label="Longest Word"
        value={longestWord || '\u2014'}
        valueStyle={styles.wordValue}
      />
      <StatRow label="Best Combo" value={`\u00D7${bestCombo}`} />
      <StatRow label="Moves Made" value={moves} />

      <View style={styles.sectionDivider} />

      <StatRow
        label="High Score"
        value={highScore.toLocaleString()}
        valueStyle={styles.highScoreValue}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.background.primary,
    marginVertical: spacing.sm,
  },
  wordValue: {
    textTransform: 'uppercase',
    color: colors.accent.primary,
  },
  highScoreValue: {
    color: colors.accent.gold,
  },
});
