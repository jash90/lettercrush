/**
 * Tile Component
 * Individual letter tile in the game grid with selection order badge
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Tile as TileType, CellPosition } from '../../types/game.types';
import { colors, spacing, borderRadius, fontSize } from '../../theme';

interface TileProps {
  tile: TileType;
  size: number;
  onPress: (position: CellPosition) => void;
  isHint?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Tile = memo(function Tile({ tile, size, onPress, isHint }: TileProps) {
  const handlePress = () => {
    onPress(tile.position);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = tile.isSelected
      ? withTiming(1.05, { duration: 150 })
      : withTiming(1, { duration: 150 });

    const opacity = tile.isMatched
      ? withSequence(
          withTiming(0.5, { duration: 100 }),
          withTiming(0, { duration: 200 })
        )
      : 1;

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [tile.isSelected, tile.isMatched]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Letter ${tile.letter}, row ${tile.position.row + 1}, column ${tile.position.col + 1}`}
      accessibilityState={{ selected: tile.isSelected }}
      accessibilityHint={tile.isSelected ? 'Double tap to deselect' : 'Double tap to select for word'}
    >
      <View
        style={[
          styles.tile,
          isHint && styles.hint,
          tile.isSelected && styles.selected,
          tile.isMatched && styles.matched,
        ]}
      >
        <Text style={[styles.letter, tile.isSelected && styles.selectedLetter]}>
          {tile.letter}
        </Text>

        {/* Selection order badge */}
        {tile.isSelected && tile.selectionOrder !== undefined && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{tile.selectionOrder}</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.tile.background,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.tile.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hint: {
    borderColor: '#4CAF50', // Debug Green
    backgroundColor: 'rgba(76, 175, 80, 0.15)', // Light green tint
  },
  selected: {
    backgroundColor: colors.selection.background,
    borderColor: colors.selection.border,
    borderWidth: 3,
    shadowColor: colors.selection.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  matched: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.gold,
  },
  letter: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  selectedLetter: {
    color: colors.button.text,
    textShadowColor: colors.selection.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  orderBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.gold,
  },
  orderText: {
    fontSize: fontSize.sm - 1,
    fontWeight: 'bold',
    color: colors.button.text,
  },
});
