/**
 * Grid Component
 * 6x6 letter grid with gesture handling
 * Memoized to prevent re-renders when parent state changes
 */

import React, { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Tile } from './Tile';
import type { Tile as TileType, CellPosition } from '../../types/game.types';
import { DEFAULT_CONFIG } from '../../types/game.types';
import { colors, borderRadius, spacing } from '../../theme';

interface GridProps {
  grid: TileType[][];
  onTilePress: (position: CellPosition) => void;
  debugHints?: CellPosition[];
}

export const Grid = memo(function Grid({ grid, onTilePress, debugHints = [] }: GridProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calculate tile size based on available space
  // Height-aware sizing: grid fills available space while remaining square
  const gridPadding = 20;
  const NON_GRID_HEIGHT = 340; // Estimated height for score, word, buttons, ad banner, matchedContainer
  const availableWidth = screenWidth - gridPadding * 2;
  const availableHeight = screenHeight - NON_GRID_HEIGHT;

  // Use smaller of width/height to maintain square grid, cap at 500px max
  const maxGridSize = Math.min(availableWidth, availableHeight, 500);
  const minGridSize = 240; // Minimum 40px per tile for readability
  const gridSize = Math.max(maxGridSize, minGridSize);

  const tileSize = gridSize / DEFAULT_CONFIG.gridSize;

  if (grid.length === 0) {
    return (
      <View style={[styles.container, { width: gridSize, height: gridSize }]}>
        <View style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: gridSize, height: gridSize }]}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile) => {
            const isHint = debugHints.some(
              (p) => p.row === rowIndex && p.col === tile.position.col
            );
            return (
              <Tile
                key={tile.id}
                tile={tile}
                size={tileSize}
                onPress={onTilePress}
                isHint={isHint}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
});
