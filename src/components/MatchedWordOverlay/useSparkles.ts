/**
 * useSparkles Hook
 * Generates sparkle configurations based on score
 */

import { useMemo } from 'react';
import { colors } from '../../theme';

export interface SparkleConfig {
  id: number;
  x: number;           // X offset from center
  y: number;           // Y offset from center
  color: string;       // Sparkle color
  delay: number;       // Animation delay (ms)
  duration: number;    // Animation duration (ms)
  scale: number;       // Initial scale
  direction: number;   // Movement angle (radians)
  distance: number;    // How far to travel
}

// Sparkle colors from theme
const SPARKLE_COLORS = [
  colors.accent.gold,      // Gold
  colors.accent.primary,   // Pink
  colors.accent.orange,    // Orange
];

// Get sparkle count based on score
function getSparkleCount(score: number): number {
  if (score >= 50) return 30;  // Full fireworks
  if (score >= 21) return 20;  // Burst effect
  if (score >= 11) return 10;  // Enhanced
  return 5;                     // Basic
}

// Get effect level (1-4) based on score
export function getEffectLevel(score: number): number {
  if (score >= 50) return 4;
  if (score >= 21) return 3;
  if (score >= 11) return 2;
  return 1;
}

export function useSparkles(score: number): SparkleConfig[] {
  return useMemo(() => {
    const count = getSparkleCount(score);
    const effectLevel = getEffectLevel(score);
    const sparkles: SparkleConfig[] = [];

    for (let i = 0; i < count; i++) {
      // Random angle for direction (full circle)
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;

      // Distance varies with effect level
      const baseDistance = 50 + effectLevel * 20;
      const distance = baseDistance + Math.random() * 40;

      // Initial position offset (around the word)
      const startRadius = 20 + Math.random() * 30;
      const startAngle = (Math.PI * 2 * i) / count;

      sparkles.push({
        id: i,
        x: Math.cos(startAngle) * startRadius,
        y: Math.sin(startAngle) * startRadius,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        delay: Math.random() * 200, // Staggered start
        duration: 600 + Math.random() * 400, // 600-1000ms
        scale: 0.5 + Math.random() * 0.5, // 0.5-1.0
        direction: angle,
        distance,
      });
    }

    return sparkles;
  }, [score]);
}
