/**
 * GameOverModal Component
 * Displayed when no valid moves remain
 * Refactored to use sub-components for better separation of concerns
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { GameOverReason } from '../types/game.types';
import { haptics } from '../utils/haptics';
import {
  ScoreSection,
  NewHighScoreBadge,
  StatsSection,
  type GameStats,
} from './modals/GameOverModal';

/** Game data passed to the modal */
export interface GameOverData {
  score: number;
  moves: number;
  highScore: number;
  isNewHighScore: boolean;
  wordsFound: number;
  longestWord: string;
  bestCombo: number;
  gameOverReason?: GameOverReason;
}

interface GameOverModalProps {
  visible: boolean;
  gameData: GameOverData;
  onPlayAgain: () => void;
}

/** Legacy props interface for backward compatibility */
interface LegacyGameOverModalProps {
  visible: boolean;
  score: number;
  moves: number;
  highScore: number;
  isNewHighScore: boolean;
  wordsFound: number;
  longestWord: string;
  bestCombo: number;
  gameOverReason?: GameOverReason;
  onPlayAgain: () => void;
}

/** Normalize props to support both legacy and new API */
function normalizeProps(
  props: GameOverModalProps | LegacyGameOverModalProps
): { visible: boolean; gameData: GameOverData; onPlayAgain: () => void } {
  if ('gameData' in props) {
    return props;
  }
  // Legacy format - convert to new format
  const { visible, onPlayAgain, ...rest } = props;
  return { visible, gameData: rest, onPlayAgain };
}

export const GameOverModal = memo(function GameOverModal(
  props: GameOverModalProps | LegacyGameOverModalProps
) {
  const { t } = useTranslation('game');
  const { visible, gameData, onPlayAgain } = normalizeProps(props);
  const {
    score,
    moves,
    highScore,
    isNewHighScore,
    wordsFound,
    longestWord,
    bestCombo,
    gameOverReason,
  } = gameData;

  // Get title and emoji based on game over reason
  const getGameOverDisplay = () => {
    switch (gameOverReason) {
      case 'timeout':
        return { emoji: '⏰', title: t('gameOver.timesUp') };
      case 'strikes':
        return { emoji: '❌', title: t('gameOver.strikes') };
      case 'noMoves':
      default:
        return { emoji: '🏆', title: t('gameOver.title') };
    }
  };

  const { emoji, title } = getGameOverDisplay();

  const handlePlayAgain = useCallback(() => {
    haptics.impact('light');
    onPlayAgain();
  }, [onPlayAgain]);

  const stats: GameStats = {
    wordsFound,
    longestWord,
    bestCombo,
    moves,
    highScore,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Animated.View
          entering={SlideInUp.duration(200)}
          exiting={SlideOutDown.duration(150)}
          style={styles.modal}
          accessibilityRole="alert"
          accessibilityLabel={t('gameOver.accessibility', { score })}
        >
          <Text style={styles.trophy}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>

          <ScoreSection
            score={score}
            isNewHighScore={isNewHighScore}
            visible={visible}
          />

          <NewHighScoreBadge visible={isNewHighScore} />

          <StatsSection stats={stats} />

          <Animated.View entering={FadeIn.delay(600)}>
            <Pressable
              style={({ pressed }) => [
                styles.playAgainButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePlayAgain}
              accessibilityRole="button"
              accessibilityLabel={t('gameOver.playAgain')}
              accessibilityHint={t('gameOver.playAgainHint')}
            >
              <Text style={styles.playAgainIcon}>🔄</Text>
              <Text style={styles.playAgainText}>{t('gameOver.playAgain')}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  trophy: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: 3,
  },
  playAgainButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 200,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  playAgainIcon: {
    fontSize: fontSize.xl,
  },
  playAgainText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.button.text,
    letterSpacing: 2,
  },
});
