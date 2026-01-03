/**
 * Game Screen - Main gameplay interface
 */

import React, { useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grid } from '../src/components/Grid';
import { ScoreDisplay } from '../src/components/Score';
import { CurrentWord, ActionButtons } from '../src/components/WordBuilder';
import { GameOverModal } from '../src/components/GameOverModal';
import { PauseModal } from '../src/components/PauseModal';
import { MatchedWordOverlay } from '../src/components/MatchedWordOverlay';
import { AdBanner } from '../src/components/ads';
import { useGame } from '../src/hooks/useGame';
import { useInterstitialAd } from '../src/hooks/useInterstitialAd';
import { colors } from '../src/theme';

export default function GameScreen() {
  const { t } = useTranslation('game');
  const router = useRouter();
  const navigation = useNavigation();
  const {
    grid,
    score,
    moves,
    highScore,
    combo,
    phase,
    isInitialized,
    matchedWords,
    currentWord,
    validationError,
    wordsFound,
    longestWord,
    bestCombo,
    isDictionaryReady,
    blockedReason,
    displayedMatch,
    debugHints,
    // Timer
    formattedTime,
    isLowTime,
    isCriticalTime,
    // Strikes
    strikes,
    maxStrikes,
    gameOverReason,
    handleLetterPress,
    submitWord,
    clearSelection,
    resetGame,
    pauseGame,
    resumeGame,
  } = useGame();
  const { showAd: showInterstitial } = useInterstitialAd();

  // Handle quit - navigate back to home
  const handleQuit = () => {
    resetGame();
    router.replace('/');
  };

  // Handle play again - show ad first, then reset game
  const handlePlayAgain = useCallback(async () => {
    await showInterstitial();
    resetGame();
  }, [showInterstitial, resetGame]);

  // Check if pause button should be visible
  const canPause = phase === 'idle' || phase === 'selecting';

  // Set pause button in navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        canPause ? (
          <Pressable
            style={styles.pauseButton}
            onPress={pauseGame}
            accessibilityRole="button"
            accessibilityLabel={t('pauseButton.accessibility')}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </Pressable>
        ) : null,
    });
    
  }, [navigation, canPause, pauseGame]);

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScoreDisplay
        score={score}
        moves={moves}
        highScore={highScore}
        formattedTime={formattedTime}
        isLowTime={isLowTime}
        isCriticalTime={isCriticalTime}
        strikes={strikes}
        maxStrikes={maxStrikes}
      />

      {/* Animated matched word overlay with fireworks */}
      <MatchedWordOverlay match={displayedMatch} />

      {/* Current word display */}
      <CurrentWord
        word={currentWord}
        error={validationError}
        combo={combo}
      />

      <View style={styles.gridContainer}>
        <Grid
          grid={grid}
          onTilePress={handleLetterPress}
          debugHints={debugHints}
        />
      </View>

      {/* Submit and Clear buttons */}
      <ActionButtons
        wordLength={currentWord.length}
        phase={phase}
        isDictionaryReady={isDictionaryReady}
        blockedReason={blockedReason}
        onSubmit={submitWord}
        onClear={clearSelection}
      />

      {/* Banner ad - hidden during game over and paused states */}
      <View style={styles.adContainer}>
        <AdBanner visible={phase !== 'gameOver' && phase !== 'paused'} />
      </View>

      {/* <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Tap letters to spell a word, then submit
        </Text>
      </View> */}

      <GameOverModal
        visible={phase === 'gameOver'}
        score={score}
        moves={moves}
        highScore={highScore}
        isNewHighScore={score === highScore && score > 0}
        wordsFound={wordsFound}
        longestWord={longestWord}
        bestCombo={bestCombo}
        gameOverReason={gameOverReason}
        onPlayAgain={handlePlayAgain}
      />

      <PauseModal
        visible={phase === 'paused'}
        onResume={resumeGame}
        onQuit={handleQuit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text.primary,
  },
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  instructionText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  pauseButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
  },
  adContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
});
