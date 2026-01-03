/**
 * Tutorial Screen - How to Play
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { TutorialSection, StepItem, ScoreRow, TipItem } from '../src/components/tutorial';
import { colors } from '../src/theme';

export default function TutorialScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Game Objective */}
          <TutorialSection
            icon="flag"
            title="Objective"
            color={colors.accent.primary}
          >
            <Text style={styles.text}>
              Swap adjacent letters to form valid words (3+ letters).
              Words can be formed horizontally or vertically.
              Score as many points as possible!
            </Text>
          </TutorialSection>

          {/* How to Swap */}
          <TutorialSection
            icon="swap-horizontal"
            title="How to Swap"
            color={colors.accent.secondary}
          >
            <View style={styles.stepList}>
              <StepItem number={1} text="Tap a letter tile to select it" />
              <StepItem number={2} text="Tap an adjacent tile to swap them" />
              <Text style={styles.orText}>— OR —</Text>
              <StepItem number={1} text="Swipe in any direction on a tile" />
              <StepItem number={2} text="The tile swaps with its neighbor" />
            </View>
          </TutorialSection>

          {/* Scoring */}
          <TutorialSection
            icon="star"
            title="Scoring"
            color={colors.accent.gold}
          >
            <View style={styles.scoreTable}>
              <ScoreRow label="3-letter word" value="100 pts" />
              <ScoreRow label="4-letter word" value="200 pts" />
              <ScoreRow label="5-letter word" value="400 pts" />
              <ScoreRow label="6+ letter word" value="800+ pts" />
              <ScoreRow label="Combo bonus" value="x1.5 per chain" />
            </View>
            <Text style={styles.tipText}>
              💡 Longer words and combos give bonus points!
            </Text>
          </TutorialSection>

          {/* Language Support */}
          <TutorialSection
            icon="globe"
            title="Languages"
            color={colors.accent.orange}
          >
            <Text style={styles.text}>
              Switch between English 🇬🇧 and Polish 🇵🇱 dictionaries
              using the language toggle at the top of the game screen.
            </Text>
            <Text style={styles.tipText}>
              💡 Each language has its own dictionary with common words.
            </Text>
          </TutorialSection>

          {/* Game Over */}
          <TutorialSection
            icon="alert-circle"
            title="Game Over"
            color={colors.accent.warning}
          >
            <Text style={styles.text}>
              The game ends when no more valid moves are available
              (no adjacent tiles can be swapped to form words).
            </Text>
            <Text style={styles.tipText}>
              💡 Plan ahead to keep the game going!
            </Text>
          </TutorialSection>

          {/* Tips */}
          <TutorialSection
            icon="bulb"
            title="Pro Tips"
            color={colors.accent.success}
          >
            <View style={styles.tipsList}>
              <TipItem text="Look for common word patterns like 'THE', 'AND', 'ING'" />
              <TipItem text="Create chain reactions for massive combo bonuses" />
              <TipItem text="Longer words give exponentially more points" />
              <TipItem text="New tiles fall from above after matches" />
            </View>
          </TutorialSection>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  text: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  stepList: {
    gap: 12,
  },
  orText: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    marginVertical: 8,
  },
  scoreTable: {
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  tipsList: {
    gap: 12,
  },
});
