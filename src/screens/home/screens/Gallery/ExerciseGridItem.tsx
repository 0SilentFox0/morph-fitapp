import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../../../theme';

const { colors, radius, typography, spacing } = theme;

/**
 * Minimal shape the grid card renders. Both the trainer gallery's `Exercise`
 * and the client catalog's `ProgramExercise` satisfy it, so the same card
 * powers exercise picking on both sides.
 */
export interface GridExercise {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  durationLabel?: string;
}

export interface ExerciseGridItemProps {
  item: GridExercise;
  isSelected: boolean;
  isExisting: boolean;
  onPress: () => void;
}

/** Single selectable exercise card in the gallery grid. */
function ExerciseGridItemBase({
  item,
  isSelected,
  isExisting,
  onPress,
}: ExerciseGridItemProps) {
  return (
    <TouchableOpacity
      style={[styles.gridItem, isExisting && styles.gridItemExisting]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.gridThumb}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridPlaceholder}>
            <Ionicons
              name="barbell-outline"
              size={28}
              color={colors.neutral5}
            />
          </View>
        )}
        {isSelected && (
          <View
            style={[styles.checkbox, isExisting && styles.checkboxExisting]}
          >
            <Ionicons name="checkmark" size={14} color={colors.white} />
          </View>
        )}
        <View style={styles.gridOverlay}>
          <Text style={styles.gridName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.gridMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={10} color={colors.neutral9} />
              <Text style={styles.metaText}>{item.durationLabel ?? '12m'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ExerciseGridItem = React.memo(ExerciseGridItemBase);

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
  },
  gridItemExisting: {
    opacity: 0.7,
  },
  gridThumb: {
    width: '100%',
    aspectRatio: 0.93,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: colors.overlay,
  },
  gridName: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  gridMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 10,
    color: colors.neutral9,
  },
  checkbox: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxExisting: {
    backgroundColor: colors.Success,
  },
});
