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
import { useTranslation } from 'react-i18next';
import { TutorialSection, StepItem, ScoreRow, TipItem } from '../src/components/tutorial';
import { colors } from '../src/theme';

export default function TutorialScreen() {
  const { t } = useTranslation('tutorial');
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
            title={t('objective.title')}
            color={colors.accent.primary}
          >
            <Text style={styles.text}>
              {t('objective.text')}
            </Text>
          </TutorialSection>

          {/* How to Swap */}
          <TutorialSection
            icon="swap-horizontal"
            title={t('howToSwap.title')}
            color={colors.accent.secondary}
          >
            <View style={styles.stepList}>
              <StepItem number={1} text={t('howToSwap.method1.step1')} />
              <StepItem number={2} text={t('howToSwap.method1.step2')} />
              <Text style={styles.orText}>{t('howToSwap.or')}</Text>
              <StepItem number={1} text={t('howToSwap.method2.step1')} />
              <StepItem number={2} text={t('howToSwap.method2.step2')} />
            </View>
          </TutorialSection>

          {/* Scoring */}
          <TutorialSection
            icon="star"
            title={t('scoring.title')}
            color={colors.accent.gold}
          >
            <View style={styles.scoreTable}>
              <ScoreRow label={t('scoring.3letter')} value={t('scoring.points.3letter')} />
              <ScoreRow label={t('scoring.4letter')} value={t('scoring.points.4letter')} />
              <ScoreRow label={t('scoring.5letter')} value={t('scoring.points.5letter')} />
              <ScoreRow label={t('scoring.6letter')} value={t('scoring.points.6letter')} />
              <ScoreRow label={t('scoring.combo')} value={t('scoring.points.combo')} />
            </View>
            <Text style={styles.tipText}>
              {t('scoring.tip')}
            </Text>
          </TutorialSection>

          {/* Language Support */}
          <TutorialSection
            icon="globe"
            title={t('languages.title')}
            color={colors.accent.orange}
          >
            <Text style={styles.text}>
              {t('languages.text')}
            </Text>
            <Text style={styles.tipText}>
              {t('languages.tip')}
            </Text>
          </TutorialSection>

          {/* Game Over */}
          <TutorialSection
            icon="alert-circle"
            title={t('gameOver.title')}
            color={colors.accent.warning}
          >
            <Text style={styles.text}>
              {t('gameOver.text')}
            </Text>
            <Text style={styles.tipText}>
              {t('gameOver.tip')}
            </Text>
          </TutorialSection>

          {/* Tips */}
          <TutorialSection
            icon="bulb"
            title={t('proTips.title')}
            color={colors.accent.success}
          >
            <View style={styles.tipsList}>
              {(t('proTips.tips', { returnObjects: true }) as string[]).map((tip, index) => (
                <TipItem key={index} text={tip} />
              ))}
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
