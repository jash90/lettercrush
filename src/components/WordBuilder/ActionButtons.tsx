/**
 * ActionButtons Component
 * Submit and Clear buttons for word building
 * Memoized for optimal re-rendering
 * Phase-aware: disables buttons during non-idle phases
 */

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../ui';
import { spacing, colors, fontSize } from '../../theme';
import type { GamePhase } from '../../types/game.types';

interface ActionButtonsProps {
  wordLength: number;
  phase: GamePhase;
  isDictionaryReady: boolean;
  blockedReason: string | null;
  onSubmit: () => void;
  onClear: () => void;
}

export const ActionButtons = memo(function ActionButtons({
  wordLength,
  phase,
  isDictionaryReady,
  blockedReason,
  onSubmit,
  onClear,
}: ActionButtonsProps) {
  // Determine if actions should be blocked
  const isIdle = phase === 'idle';
  const isProcessing = phase === 'validating' || phase === 'matching' || phase === 'cascading' || phase === 'refilling';
  const isBlocked = !isIdle || !isDictionaryReady;

  // Compute button states
  const canSubmit = wordLength >= 3 && !isBlocked;
  const canClear = wordLength > 0 && !isBlocked;

  // Dynamic button text
  const getSubmitText = (): string => {
    if (!isDictionaryReady) return 'Loading...';
    if (phase === 'validating') return 'Checking...';
    if (isProcessing) return 'Wait...';
    return 'Submit';
  };

  return (
    <View style={styles.container}>
      {/* Show blocked reason when relevant */}
      {blockedReason && isBlocked && (
        <Text style={styles.blockedReason}>{blockedReason}</Text>
      )}
      <View style={styles.buttonRow}>
        <Button
          title="Clear"
          onPress={onClear}
          variant="secondary"
          disabled={!canClear}
          accessibilityHint={!canClear ? 'Button disabled' : 'Clear selected letters'}
        />
        <Button
          title={getSubmitText()}
          onPress={onSubmit}
          variant="primary"
          disabled={!canSubmit}
          accessibilityHint={!canSubmit ? blockedReason || 'Button disabled' : 'Submit word for validation'}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  blockedReason: {
    textAlign: 'center',
    color: colors.accent.warning,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
});
