/**
 * WordPopup Component
 * Animated word and score display
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import { getEffectLevel } from './useSparkles';

interface WordPopupProps {
  word: string;
  score: number;
  onAnimationComplete?: () => void;
}

export function WordPopup({ word, score, onAnimationComplete }: WordPopupProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scoreScale = useSharedValue(0);

  const effectLevel = getEffectLevel(score);
  const hasGlow = effectLevel >= 2;

  useEffect(() => {
    // Entry animation: Scale 0 → 1.2 → 1 with fade in
    opacity.value = withTiming(1, { duration: 150 });

    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Score pops in slightly after
    scoreScale.value = withDelay(
      100,
      withSequence(
        withTiming(1.3, { duration: 100 }),
        withTiming(1, { duration: 100 })
      )
    );

    // Exit animation after 2 seconds
    const exitTimeout = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });

      scale.value = withTiming(0.8, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });

      translateY.value = withTiming(-30, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, 2000);

    return () => clearTimeout(exitTimeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={[
        styles.word,
        hasGlow && styles.wordGlow,
      ]}>
        {word}
      </Text>
      <Animated.View style={scoreStyle}>
        <Text style={styles.score}>+{score}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: colors.accent.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wordGlow: {
    textShadowColor: colors.accent.gold,
    textShadowRadius: 10,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginTop: 4,
    textShadowColor: colors.background.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
