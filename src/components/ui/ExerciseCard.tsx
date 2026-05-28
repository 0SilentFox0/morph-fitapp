import React from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useDraftProgramStore } from '../../store/draftProgramStore';
import type { ProgramExercise, ExerciseSet } from '../../mocks';
import { SET_NOTES, SET_NOTE_CYCLE } from '../../constants';
import { radius } from '../../theme';

export interface ExerciseCardProps {
  exercise: ProgramExercise;
}

export const ExerciseCard = React.memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
  const removeExercise = useDraftProgramStore((s) => s.removeExercise);
  const addSet = useDraftProgramStore((s) => s.addSet);
  const removeSet = useDraftProgramStore((s) => s.removeSet);
  const updateSet = useDraftProgramStore((s) => s.updateSet);

  const handleWeightChange = (setIdx: number, text: string) => {
    const num = parseInt(text, 10);
    updateSet(exercise.id, setIdx, { weight: isNaN(num) ? 0 : num });
  };

  const handleRepsChange = (setIdx: number, text: string) => {
    const num = parseInt(text, 10);
    updateSet(exercise.id, setIdx, { reps: isNaN(num) ? 0 : num });
  };

  const cycleNote = (setIdx: number) => {
    const current = exercise.sets[setIdx]?.note ?? 'regular';
    const currentIdx = SET_NOTE_CYCLE.indexOf(current);
    const next = SET_NOTE_CYCLE[(currentIdx + 1) % SET_NOTE_CYCLE.length];
    updateSet(exercise.id, setIdx, { note: next });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {exercise.imageUrl ? (
            <Image source={{ uri: exercise.imageUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbEmpty]}>
              <Ionicons name="barbell-outline" size={16} color={colors.neutral5} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={styles.exerciseCategory}>{exercise.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => removeExercise(exercise.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={colors.neutral7} />
        </TouchableOpacity>
      </View>

      <View style={styles.setsHeader}>
        <Text style={styles.colSet}>SET</Text>
        <Text style={styles.colKg}>KG</Text>
        <Text style={styles.colReps}>REPS</Text>
        <View style={styles.colNote} />
      </View>

      {exercise.sets.map((set: ExerciseSet, idx: number) => (
        <View key={idx}>
          <View style={styles.setRow}>
            <Text style={styles.setNum}>{idx + 1}</Text>
            <View style={styles.inputCellKg}>
              <TextInput
                style={styles.cellInput}
                value={String(set.weight)}
                onChangeText={(t) => handleWeightChange(idx, t)}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
            <View style={styles.inputCellReps}>
              <TextInput
                style={styles.cellInput}
                value={String(set.reps)}
                onChangeText={(t) => handleRepsChange(idx, t)}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
            <TouchableOpacity
              style={styles.noteBtn}
              onPress={() => cycleNote(idx)}
              onLongPress={() =>
                exercise.sets.length > 1 ? removeSet(exercise.id, idx) : undefined
              }
            >
              <Ionicons
                name={
                  (SET_NOTES.find((n) => n.key === (set.note ?? 'regular'))?.icon ??
                    'checkmark-circle-outline') as keyof typeof Ionicons.glyphMap
                }
                size={16}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
        <Ionicons name="add" size={16} color={colors.accent} />
        <Text style={styles.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral2,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral3,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    lineHeight: 20,
  },
  exerciseCategory: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral3,
    marginBottom: 4,
    gap: 6,
  },
  colSet: {
    width: 26,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colKg: {
    flex: 1,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colReps: {
    flex: 1,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colNote: {
    width: 28,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 6,
  },
  setNum: {
    width: 26,
    fontSize: typography.sizes.xs,
    color: colors.neutral7,
    fontWeight: typography.weights.semibold,
  },
  inputCellKg: {
    flex: 1,
    backgroundColor: colors.neutral3,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
  },
  inputCellReps: {
    flex: 1,
    backgroundColor: colors.neutral3,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
  },
  cellInput: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: 0,
    height: 32,
  },
  noteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.sm,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral3,
  },
  addSetText: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
});
