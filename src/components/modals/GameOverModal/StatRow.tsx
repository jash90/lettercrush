/**
 * StatRow Component
 * Single row displaying a label-value pair for game statistics
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, fontSize } from '../../../theme';

interface StatRowProps {
  /** Label text displayed on the left */
  label: string;
  /** Value displayed on the right */
  value: string | number;
  /** Optional custom style for the value text */
  valueStyle?: TextStyle;
}

export const StatRow = memo(function StatRow({
  label,
  value,
  valueStyle,
}: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  statLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});
