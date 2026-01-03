/**
 * Stats Screen - Highscores and Statistics
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getTopHighscores,
  getHighestScore,
  getTotalGamesPlayed,
  getAverageScore,
} from '../src/db';
import { StatCard, LeaderboardRow } from '../src/components/stats';
import { colors } from '../src/theme';
import type { HighScoreEntry } from '../src/types/game.types';

export default function StatsScreen() {
  const [highscores, setHighscores] = React.useState<HighScoreEntry[]>([]);
  const [stats, setStats] = React.useState({
    highest: 0,
    games: 0,
    average: 0,
  });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const scores = getTopHighscores(10);
    setHighscores(scores);
    setStats({
      highest: getHighestScore(),
      games: getTotalGamesPlayed(),
      average: getAverageScore(),
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="trophy"
              value={stats.highest.toLocaleString()}
              label="Best Score"
              color={colors.accent.gold}
            />
            <StatCard
              icon="game-controller"
              value={stats.games.toString()}
              label="Games Played"
              color={colors.accent.orange}
            />
            <StatCard
              icon="stats-chart"
              value={stats.average.toLocaleString()}
              label="Average Score"
              color={colors.accent.primary}
            />
          </View>

          {/* Leaderboard */}
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>

            {highscores.length > 0 ? (
              <View style={styles.leaderboard}>
                {highscores.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.id}
                    rank={index + 1}
                    score={entry.score}
                    date={formatDate(entry.createdAt)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="game-controller-outline" size={64} color={colors.text.muted} />
                <Text style={styles.emptyTitle}>No scores yet</Text>
                <Text style={styles.emptySubtitle}>
                  Play some games to see your scores here!
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  leaderboardSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  leaderboard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
