/**
 * TipItem Component
 * Tip list item for tutorial
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export interface TipItemProps {
  text: string;
}

export function TipItem({ text }: TipItemProps) {
  return (
    <View style={styles.tipItem}>
      <Ionicons name="checkmark-circle" size={18} color={colors.accent.success} />
      <Text style={styles.tipItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipItemText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
});
