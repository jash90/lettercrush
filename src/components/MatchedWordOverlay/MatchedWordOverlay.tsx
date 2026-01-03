/**
 * MatchedWordOverlay Component
 * Full-screen overlay for animated matched word display with fireworks
 */

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { WordMatch } from '../../types/game.types';
import { WordPopup } from './WordPopup';
import { Sparkle } from './Sparkle';
import { useSparkles } from './useSparkles';

interface MatchedWordOverlayProps {
  match: WordMatch | null;
  onAnimationComplete?: () => void;
}

export function MatchedWordOverlay({ match, onAnimationComplete }: MatchedWordOverlayProps) {
  const { width, height } = useWindowDimensions();
  const sparkles = useSparkles(match?.score ?? 0);

  if (!match) {
    return null;
  }

  return (
    <View
      style={[
        styles.overlay,
        { width, height },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        {/* Sparkles render first (behind the word) */}
        {sparkles.map((config) => (
          <Sparkle key={config.id} config={config} />
        ))}

        {/* Word popup in center */}
        <WordPopup
          word={match.word}
          score={match.score}
          onAnimationComplete={onAnimationComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
