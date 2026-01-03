/**
 * NewHighScoreBadge Component
 * Displays animated "NEW RECORD!" badge when user achieves new high score
 */

import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, fontSize } from '../../../theme';

interface NewHighScoreBadgeProps {
  /** Whether the badge should be visible */
  visible: boolean;
}

export const NewHighScoreBadge = memo(function NewHighScoreBadge({
  visible,
}: NewHighScoreBadgeProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.delay(900).duration(300)}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>NEW RECORD!</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text.inverse,
    letterSpacing: 1,
  },
});
