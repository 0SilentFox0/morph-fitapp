import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCard } from '../../../../components/ui';
import { SET_NOTES } from '../../../../constants';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme';
import type { ProgramExercise } from '../../../../mocks';

export interface ExercisesSectionProps {
  exercises: ProgramExercise[];
  onBrowse: () => void;
}

/**
 * "Exercises" section of the add-to-library form: the set-type legend, the
 * current exercise list (or an empty prompt), and the "add more" action.
 */
export function ExercisesSection({ exercises, onBrowse }: ExercisesSectionProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Exercises</Text>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Set type icons</Text>
        <View style={styles.legendGrid}>
          {SET_NOTES.map((n) => (
            <View key={n.key} style={styles.legendItem}>
              <Ionicons
                name={n.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={n.key === 'regular' ? colors.neutral6 : colors.accent}
              />
              <Text style={styles.legendText}>{n.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.legendHint}>Tap icon to cycle · Long press to remove set</Text>
      </View>

      {exercises.length > 0 ? (
        exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)
      ) : (
        <TouchableOpacity style={styles.addExerciseEmpty} onPress={onBrowse}>
          <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
          <Text style={styles.addExerciseEmptyText}>Tap to browse exercises</Text>
        </TouchableOpacity>
      )}

      {exercises.length > 0 && (
        <TouchableOpacity style={styles.addMoreBtn} onPress={onBrowse}>
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addMoreText}>Add more exercises</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  legend: {
    backgroundColor: colors.neutral2,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  legendTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.neutral8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    rowGap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexBasis: '45%',
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral9,
  },
  legendHint: {
    fontSize: 10,
    color: colors.neutral6,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  addExerciseEmpty: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addExerciseEmptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  addMoreText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
});
