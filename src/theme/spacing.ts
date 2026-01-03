/**
 * Theme Spacing
 * Consistent spacing scale for LetterCrush
 */

export const spacing = {
  // Base spacing scale (in pixels)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Font sizes
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
} as const;

// Animation durations (in ms)
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Types
export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
export type BorderRadius = typeof borderRadius;
export type FontSize = typeof fontSize;
export type Animation = typeof animation;
