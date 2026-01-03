/**
 * StarRating Component
 * Displays star rating based on score with optional animation
 * Uses useStarRating hook for calculation
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useStarRating } from '../../../hooks';
import { Star } from './Star';
import { spacing } from '../../../theme';

interface StarRatingProps {
  /** Score to calculate rating from */
  score: number;
  /** Whether to animate star appearance */
  animated?: boolean;
  /** Base delay before animation starts (ms) */
  animationDelay?: number;
}

export const StarRating = memo(function StarRating({
  score,
  animated = false,
  animationDelay = 800,
}: StarRatingProps) {
  const { stars } = useStarRating(score);

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={`Rating: ${stars.filter(s => s.filled).length} out of 5 stars`}
    >
      {stars.map((star) => (
        <Star
          key={star.index}
          filled={star.filled}
          index={star.index}
          animated={animated}
          baseDelay={animationDelay}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
