/**
 * PauseModal Component
 * Displayed when game is paused - allows resume, settings, and quit
 * Follows BMAD specification for non-destructive pause experience
 * Refactored to use settingsStore for persistent settings
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { haptics } from '../utils/haptics';
import { useSettingsStore, settingsSelectors } from '../stores/settingsStore';
import { SettingsToggle } from './modals/PauseModal';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseModal = memo(function PauseModal({
  visible,
  onResume,
  onQuit,
}: PauseModalProps) {
  // Use persisted settings from store
  const soundEnabled = useSettingsStore(settingsSelectors.soundEnabled);
  const hapticsEnabled = useSettingsStore(settingsSelectors.hapticsEnabled);
  const setSoundEnabled = useSettingsStore(state => state.setSoundEnabled);
  const setHapticsEnabled = useSettingsStore(state => state.setHapticsEnabled);

  const handleResume = useCallback(() => {
    if (hapticsEnabled) {
      haptics.impact('light');
    }
    onResume();
  }, [hapticsEnabled, onResume]);

  const handleToggleSound = useCallback(() => {
    if (hapticsEnabled) {
      haptics.selection();
    }
    setSoundEnabled(!soundEnabled);
  }, [hapticsEnabled, soundEnabled, setSoundEnabled]);

  const handleToggleHaptics = useCallback(() => {
    // Trigger haptic before toggling off
    if (hapticsEnabled) {
      haptics.selection();
    }
    setHapticsEnabled(!hapticsEnabled);
  }, [hapticsEnabled, setHapticsEnabled]);

  const handleQuit = useCallback(() => {
    if (hapticsEnabled) {
      haptics.warning();
    }
    Alert.alert(
      'Quit Game?',
      'Your current progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: onQuit,
        },
      ],
      { cancelable: true }
    );
  }, [hapticsEnabled, onQuit]);

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
          accessibilityLabel="Game Paused"
        >
          {/* Pause Icon */}
          <View style={styles.pauseIconContainer}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>

          <Text style={styles.title}>PAUSED</Text>

          {/* Resume Button - Primary */}
          <Pressable
            style={({ pressed }) => [
              styles.resumeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleResume}
            accessibilityRole="button"
            accessibilityLabel="Resume Game"
            accessibilityHint="Continues the game from where you left off"
          >
            <Text style={styles.resumeIcon}>▶</Text>
            <Text style={styles.resumeText}>RESUME</Text>
          </Pressable>

          {/* Settings Toggles */}
          <View style={styles.togglesContainer}>
            <SettingsToggle
              enabled={soundEnabled}
              onToggle={handleToggleSound}
              iconEnabled="🔊"
              iconDisabled="🔇"
              label="Sound"
              accessibilityLabel="Sound"
            />
            <SettingsToggle
              enabled={hapticsEnabled}
              onToggle={handleToggleHaptics}
              iconEnabled="📳"
              iconDisabled="📴"
              label="Haptics"
              accessibilityLabel="Haptics"
            />
          </View>

          {/* Quit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.quitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleQuit}
            accessibilityRole="button"
            accessibilityLabel="Quit Game"
            accessibilityHint="Returns to the home screen. Progress will be lost."
          >
            <Text style={styles.quitIcon}>🚪</Text>
            <Text style={styles.quitText}>Quit Game</Text>
          </Pressable>
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
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  pauseIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pauseBar: {
    width: 12,
    height: 40,
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.sm,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xl,
    letterSpacing: 4,
  },
  resumeButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    marginBottom: spacing['2xl'],
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    gap: spacing.sm,
  },
  resumeIcon: {
    fontSize: fontSize.xl,
    color: colors.button.text,
  },
  resumeText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.button.text,
    letterSpacing: 2,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  togglesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  quitButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent.error,
  },
  quitIcon: {
    fontSize: fontSize.lg,
  },
  quitText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.accent.error,
  },
});
