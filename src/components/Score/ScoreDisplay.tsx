/**
 * ScoreDisplay Component
 * Shows current score, moves, and combo
 * Memoized to prevent re-renders from unrelated state changes
 */

import React, { memo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, fontSize } from '../../theme';

interface ScoreDisplayProps {
  score: number;
  moves: number;
  highScore: number;
  // Timer props
  formattedTime?: string;
  isLowTime?: boolean;
  isCriticalTime?: boolean;
  // Strikes props
  strikes?: number;
  maxStrikes?: number;
}

export const ScoreDisplay = memo(function ScoreDisplay({
  score,
  moves,
  highScore,
  formattedTime,
  isLowTime,
  isCriticalTime,
  strikes,
  maxStrikes,
}: ScoreDisplayProps) {
  const { t } = useTranslation('game');
  const scoreScale = useSharedValue(1);

  // Memoize animation trigger to fix dependency issue
  const triggerScoreAnimation = useCallback(() => {
    scoreScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  }, [scoreScale]);

  // Animate score on change
  useEffect(() => {
    if (score > 0) {
      triggerScoreAnimation();
    }
  }, [score, triggerScoreAnimation]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const formatScore = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Timer display */}
      {formattedTime !== undefined && (
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('stats.time')}</Text>
          <Text
            style={[
              styles.statValue,
              isLowTime && styles.lowTimeValue,
              isCriticalTime && styles.criticalTimeValue,
            ]}
          >
            {formattedTime}
          </Text>
        </View>
      )}

      <View style={styles.mainScore}>
        <Text style={styles.label}>{t('stats.score')}</Text>
        <Animated.Text style={[styles.score, scoreAnimatedStyle]}>
          {formatScore(score)}
        </Animated.Text>
      </View>

      {/* Strikes display */}
      {strikes !== undefined && maxStrikes !== undefined && (
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('stats.strikes')}</Text>
          <Text
            style={[
              styles.statValue,
              strikes >= 2 && styles.lowTimeValue,
              strikes >= maxStrikes && styles.criticalTimeValue,
            ]}
          >
            {strikes}/{maxStrikes}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 2,
  },
  score: {
    fontSize: fontSize['4xl'],
    fontWeight: 'bold',
    color: colors.accent.gold,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  lowTimeValue: {
    color: colors.accent.warning || '#FFA500',
  },
  criticalTimeValue: {
    color: colors.accent.error || '#FF4444',
  },
});
