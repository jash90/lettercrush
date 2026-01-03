/**
 * SettingsToggle Component
 * Reusable toggle button for settings (sound, haptics, etc.)
 * Pure presentational component with accessibility support
 */

import React, { memo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../../theme';

interface SettingsToggleProps {
  /** Whether the setting is enabled */
  enabled: boolean;
  /** Callback when toggle is pressed */
  onToggle: () => void;
  /** Icon to display when enabled */
  iconEnabled: string;
  /** Icon to display when disabled */
  iconDisabled: string;
  /** Label text for the toggle */
  label: string;
  /** Accessibility label for screen readers */
  accessibilityLabel: string;
  /** Label to display when enabled (e.g., "ON") */
  onLabel: string;
  /** Label to display when disabled (e.g., "OFF") */
  offLabel: string;
}

export const SettingsToggle = memo(function SettingsToggle({
  enabled,
  onToggle,
  iconEnabled,
  iconDisabled,
  label,
  accessibilityLabel,
  onLabel,
  offLabel,
}: SettingsToggleProps) {
  return (
    <Pressable
      style={[styles.toggleButton, enabled && styles.toggleActive]}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: enabled }}
    >
      <Text style={styles.toggleIcon}>{enabled ? iconEnabled : iconDisabled}</Text>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleStatus}>{enabled ? onLabel : offLabel}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  toggleButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleActive: {
    borderColor: colors.accent.primary,
  },
  toggleIcon: {
    fontSize: fontSize['2xl'],
    marginBottom: spacing.xs,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  toggleStatus: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});
