/**
 * Sparkle Component
 * Single animated sparkle/particle effect
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import type { SparkleConfig } from './useSparkles';

interface SparkleProps {
  config: SparkleConfig;
}

export function Sparkle({ config }: SparkleProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(config.x);
  const translateY = useSharedValue(config.y);
  const scale = useSharedValue(config.scale);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Calculate end position based on direction and distance
    const endX = config.x + Math.cos(config.direction) * config.distance;
    const endY = config.y + Math.sin(config.direction) * config.distance;

    // Start animation with delay
    opacity.value = withDelay(
      config.delay,
      withTiming(1, { duration: 100 }, () => {
        // Fade out after appearing
        opacity.value = withTiming(0, {
          duration: config.duration - 100,
          easing: Easing.out(Easing.quad),
        });
      })
    );

    // Move outward
    translateX.value = withDelay(
      config.delay,
      withTiming(endX, {
        duration: config.duration,
        easing: Easing.out(Easing.quad),
      })
    );

    translateY.value = withDelay(
      config.delay,
      withTiming(endY, {
        duration: config.duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Scale down as it moves
    scale.value = withDelay(
      config.delay,
      withTiming(0, {
        duration: config.duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Rotate
    rotation.value = withDelay(
      config.delay,
      withTiming(360, {
        duration: config.duration,
        easing: Easing.linear,
      })
    );
  }, [config]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { backgroundColor: config.color },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
