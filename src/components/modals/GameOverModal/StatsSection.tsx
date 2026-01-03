/**
 * StatsSection Component
 * Displays game statistics in a card layout
 * Pure presentational component
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('game');
  const { wordsFound, longestWord, bestCombo, moves, highScore } = stats;

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={t('stats.accessibility')}
    >
      <Text style={styles.title}>{t('stats.title')}</Text>
      <View style={styles.divider} />

      <StatRow label={t('stats.wordsFound')} value={wordsFound} />
      <StatRow
        label={t('stats.longestWord')}
        value={longestWord || '\u2014'}
        valueStyle={styles.wordValue}
      />
      <StatRow label={t('stats.bestCombo')} value={`\u00D7${bestCombo}`} />
      <StatRow label={t('stats.movesMade')} value={moves} />

      <View style={styles.sectionDivider} />

      <StatRow
        label={t('stats.highScore')}
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
