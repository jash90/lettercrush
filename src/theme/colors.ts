/**
 * Theme Colors
 * Centralized color tokens for LetterCrush
 * Dark "Nighttime Candy" palette - deep backgrounds with glowing accents
 */

export const colors = {
  // Background colors - Deep eggplant/berry tones
  background: {
    primary: '#1F1218',    // Deep Eggplant - main app background
    secondary: '#2D1F26',  // Dark Berry - cards, modals, sections
    tertiary: '#3A2A32',   // Dark Plum - elevated surfaces
  },

  // Accent colors - Vibrant, glowing against dark
  accent: {
    primary: '#F04A8C',    // Vibrant Pink - primary CTA, highlights
    secondary: '#F576A3',  // Raspberry Pink - secondary accents
    gold: '#FFD700',       // Luminous Gold - sparkles, rewards
    orange: '#FC9E57',     // Warm Orange - secondary buttons, badges
    success: '#4ade80',    // Semantic green
    warning: '#FC9E57',    // Warm Orange
    error: '#ef4444',      // Semantic red
  },

  // Text colors - Light text on dark backgrounds
  text: {
    primary: '#F2F0F5',    // Soft White - main titles, body text
    secondary: '#B3A6B0',  // Muted Rose Gray - subtitles, descriptions
    muted: '#8A7B82',      // Dark Rose - inactive, hints
    inverse: '#1F1218',    // Deep Eggplant - text on light backgrounds
  },

  // Tile colors - Glowing candies on dark
  tile: {
    background: '#F576A3', // Raspberry Pink base
    border: '#F04A8C',     // Vibrant Pink border
    selected: '#FC9E57',   // Warm Orange when selected
    matched: '#FFD700',    // Luminous Gold when matched
    gradient: {
      start: '#FFD700',    // Luminous Gold (top)
      middle: '#FC9E57',   // Warm Orange (middle)
      end: '#F04A8C',      // Vibrant Pink (bottom)
    },
  },

  // Button colors
  button: {
    primary: '#F04A8C',    // Vibrant Pink
    secondary: '#FC9E57',  // Warm Orange
    disabled: '#4A3840',   // Muted dark berry
    text: '#F2F0F5',       // Soft White
  },

  // Overlay colors
  overlay: {
    dark: 'rgba(31, 18, 24, 0.85)',    // Deep eggplant overlay
    light: 'rgba(242, 240, 245, 0.1)', // Subtle light overlay
  },

  // Status colors (semantic)
  status: {
    success: '#4ade80',    // Green
    warning: '#FC9E57',    // Warm Orange
    error: '#ef4444',      // Red
    info: '#F576A3',       // Raspberry Pink
  },

  // Selection colors
  selection: {
    background: '#3A2A32', // Dark Plum
    border: '#F04A8C',     // Vibrant Pink
    glow: '#F576A3',       // Raspberry Pink
  },
} as const;

// Type for accessing nested color values
export type Colors = typeof colors;
export type ColorKey = keyof Colors;
