/**
 * Accessibility Utilities
 * Screen reader announcements for VoiceOver/TalkBack
 */

import { AccessibilityInfo } from 'react-native';

/**
 * Announce message to screen readers
 * Use for game events that need audio feedback
 */
export const announce = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Game-specific announcement helpers
 */
export const gameAnnouncements = {
  /**
   * Announce word submission result
   */
  wordAccepted: (word: string, points: number): void => {
    announce(`${word} accepted! Plus ${points} points`);
  },

  /**
   * Announce invalid word
   */
  wordInvalid: (word: string): void => {
    announce(`${word} is not a valid word`);
  },

  /**
   * Announce game over
   */
  gameOver: (score: number): void => {
    announce(`Game over. Your score is ${score}`);
  },

  /**
   * Announce new high score
   */
  newHighScore: (score: number): void => {
    announce(`New high score! ${score} points`);
  },

  /**
   * Announce combo
   */
  combo: (multiplier: number): void => {
    announce(`Combo times ${multiplier}!`);
  },

  /**
   * Announce tile selection
   */
  tileSelected: (letter: string, position: number): void => {
    announce(`${letter} selected, position ${position}`);
  },

  /**
   * Announce tile deselected
   */
  tileDeselected: (letter: string): void => {
    announce(`${letter} deselected`);
  },
};
