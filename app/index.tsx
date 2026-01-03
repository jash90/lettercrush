  /**
   * Home Screen - Main Menu
   */

  import React from 'react';
  import {
    View,
    StyleSheet,
    Animated,
    Image,
  } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { router } from 'expo-router';
  import { useTranslation } from 'react-i18next';
  import { getHighestScore, getTotalGamesPlayed } from '../src/db';
  import { MenuButton } from '../src/components/ui/MenuButton';
  import { colors } from '../src/theme';
  import * as Sentry from '@sentry/react-native';

  export default function HomeScreen() {
    const { t } = useTranslation();
    const [highScore, setHighScore] = React.useState(0);
    const [gamesPlayed, setGamesPlayed] = React.useState(0);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
      setHighScore(getHighestScore());
      setGamesPlayed(getTotalGamesPlayed());

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <SafeAreaView style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
        <View style={styles.logoContainer}>
             <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
        </View>
       

        {/* Main Menu Buttons */}
        <View style={styles.menuContainer}>
          <MenuButton
            icon="play"
            title={t('menu.play.title')}
            subtitle={t('menu.play.subtitle')}
            color={colors.accent.primary}
            onPress={() => router.push('/game')}
          />
          <MenuButton
            icon="trophy"
            title={t('menu.highscores.title')}
            subtitle={t('menu.highscores.subtitle')}
            color={colors.accent.gold}
            onPress={() => router.push('/stats')}
          />
          <MenuButton
            icon="help-circle"
            title={t('menu.howToPlay.title')}
            subtitle={t('menu.howToPlay.subtitle')}
            color={colors.accent.orange}
            onPress={() => router.push('/tutorial')}
          />
          <MenuButton
            icon="settings"
            title={t('menu.settings.title')}
            subtitle={t('menu.settings.subtitle')}
            color={colors.text.secondary}
            onPress={() => router.push('/settings')}
          />
          {/* TEMPORARY: Test Sentry integration - remove after verification */}
          <MenuButton
            icon="alert-circle"
            title={t('menu.testSentry.title')}
            subtitle={t('menu.testSentry.subtitle')}
            color="#FF4444"
            onPress={ () => { Sentry.captureException(new Error('Test Sentry Error')) }}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  
  },
  content: {
    flex: 1,
  },
  logo: {
    width: '90%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    height: '35%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.accent.primary,
    textShadowColor: 'rgba(240, 74, 140, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.accent.secondary,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  menuContainer: {
    height: '60%',
    gap: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.muted,
  },
});
