/**
 * Star Component
 * Individual star for rating display with optional animation
 */

import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../../../theme';

interface StarProps {
  /** Whether the star is filled (active) */
  filled: boolean;
  /** Star index for animation delay calculation */
  index: number;
  /** Whether to animate the star appearance */
  animated: boolean;
  /** Base delay before animation starts (ms) */
  baseDelay: number;
}

export const Star = memo(function Star({
  filled,
  index,
  animated,
  baseDelay,
}: StarProps) {
  const starContent = (
    <Text style={[styles.star, filled && styles.starFilled]}>
      {filled ? '\u2605' : '\u2606'}
    </Text>
  );

  if (!animated) {
    return starContent;
  }

  return (
    <Animated.Text
      entering={FadeIn.delay(baseDelay + index * 100).duration(200)}
      style={[styles.star, filled && styles.starFilled]}
    >
      {filled ? '\u2605' : '\u2606'}
    </Animated.Text>
  );
});

const styles = StyleSheet.create({
  star: {
    fontSize: 28,
    color: colors.text.secondary,
  },
  starFilled: {
    color: colors.accent.gold,
  },
});
