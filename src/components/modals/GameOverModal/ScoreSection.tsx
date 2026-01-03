/**
 * ScoreSection Component
 * Displays animated score count-up with star rating
 * Uses useScoreCountUp hook for animation
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useScoreCountUp } from '../../../hooks';
import { StarRating } from './StarRating';
import { haptics } from '../../../utils/haptics';
import { colors, spacing, fontSize } from '../../../theme';

interface ScoreSectionProps {
  /** Target score to animate to */
  score: number;
  /** Whether this is a new high score */
  isNewHighScore: boolean;
  /** Whether the modal is visible (triggers animation) */
  visible: boolean;
}

export const ScoreSection = memo(function ScoreSection({
  score,
  isNewHighScore,
  visible,
}: ScoreSectionProps) {
  const { t } = useTranslation('game');
  const { displayValue, isComplete } = useScoreCountUp({
    targetValue: score,
    duration: 800,
    steps: 30,
    enabled: visible,
    onComplete: () => {
      if (isNewHighScore) {
        haptics.success();
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('stats.score')}</Text>
      <Text style={styles.value}>{displayValue.toLocaleString()}</Text>
      <StarRating
        score={score}
        animated={isComplete}
        animationDelay={800}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.gold,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
