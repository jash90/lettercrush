/**
 * ScoreRow Component
 * Score table row for tutorial
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export interface ScoreRowProps {
  label: string;
  value: string;
}

export function ScoreRow({ label, value }: ScoreRowProps) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  scoreLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.accent.gold,
  },
});
