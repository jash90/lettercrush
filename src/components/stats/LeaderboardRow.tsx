/**
 * LeaderboardRow Component
 * Leaderboard entry row for stats page
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export interface LeaderboardRowProps {
  rank: number;
  score: number;
  date: string;
}

export function LeaderboardRow({ rank, score, date }: LeaderboardRowProps) {
  const getMedalColor = () => {
    switch (rank) {
      case 1:
        return colors.accent.gold;
      case 2:
        return '#c0c0c0'; // Silver
      case 3:
        return '#cd7f32'; // Bronze
      default:
        return colors.text.muted;
    }
  };

  const getMedalIcon = (): keyof typeof Ionicons.glyphMap => {
    if (rank <= 3) return 'medal';
    return 'ellipse';
  };

  return (
    <View style={styles.leaderboardRow}>
      <View style={styles.rankContainer}>
        <Ionicons name={getMedalIcon()} size={rank <= 3 ? 24 : 8} color={getMedalColor()} />
        {rank > 3 && <Text style={styles.rankText}>#{rank}</Text>}
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.leaderboardScore}>{score.toLocaleString()}</Text>
        <Text style={styles.leaderboardDate}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  rankContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rankText: {
    fontSize: 14,
    color: colors.text.muted,
    marginLeft: 4,
  },
  scoreContainer: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  leaderboardDate: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
});
