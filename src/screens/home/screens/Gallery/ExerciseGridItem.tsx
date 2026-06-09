import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../theme/colors';
import { radius } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import type { Exercise } from '../../../../services/exerciseApi';

export interface ExerciseGridItemProps {
  item: Exercise;
  isSelected: boolean;
  isExisting: boolean;
  onPress: () => void;
}

/** Single selectable exercise card in the gallery grid. */
function ExerciseGridItemBase({ item, isSelected, isExisting, onPress }: ExerciseGridItemProps) {
  return (
    <TouchableOpacity
      style={[styles.gridItem, isExisting && styles.gridItemExisting]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.gridThumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.gridImage} resizeMode="cover" />
        ) : (
          <View style={styles.gridPlaceholder}>
            <Ionicons name="barbell-outline" size={28} color={colors.neutral5} />
          </View>
        )}
        {isSelected && (
          <View style={[styles.checkbox, isExisting && styles.checkboxExisting]}>
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
              <Text style={styles.metaText}>12m</Text>
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
