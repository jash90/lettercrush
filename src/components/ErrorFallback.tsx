/**
 * ErrorFallback Component
 * Standalone fallback UI for use with ErrorBoundary or directly
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export interface ErrorFallbackProps {
  error?: Error;
  errorMessage?: string;
  onReset?: () => void;
  showDevDetails?: boolean;
}

export function ErrorFallback({
  error,
  errorMessage,
  onReset,
  showDevDetails = false,
}: ErrorFallbackProps) {
  const displayMessage = errorMessage || error?.message || 'Something went wrong. Please try again.';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>{displayMessage}</Text>

        {showDevDetails && __DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        {onReset && (
          <Pressable
            style={styles.button}
            onPress={onReset}
            accessibilityRole="button"
            accessibilityLabel="Try Again"
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  errorTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.status.error,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.button.text,
  },
});
