import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Tag } from './Tag';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { TrainingProgram } from '../../mocks';

interface ProgramExerciseListProps {
  program: TrainingProgram;
  onSelectExercise: (index: number) => void;
  onEditProgram?: () => void;
}

/** Sums "5m"-style exercise duration labels into a program-level "Nm" chip. */
function totalDurationLabel(program: TrainingProgram): string | null {
  const exercises = program.exercises ?? [];
  const minutes = exercises.reduce((sum, ex) => {
    const m = ex.durationLabel?.match(/(\d+)\s*m/);
    return sum + (m ? Number(m[1]) : 0);
  }, 0);
  return minutes > 0 ? `${minutes}m` : null;
}

/**
 * Program card + exercise list shared by ClientProfile (active training) and
 * ProgramDetail. Matches Figma node 2006:7999 — title + edit pencil, description,
 * duration/type chips, then exercise rows with thumbnail, duration and a play
 * affordance.
 */
export function ProgramExerciseList({
  program,
  onSelectExercise,
  onEditProgram,
}: ProgramExerciseListProps) {
  const exercises = program.exercises ?? [];
  const duration = totalDurationLabel(program);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{program.name}</Text>
        <TouchableOpacity onPress={onEditProgram} hitSlop={8}>
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!!program.description && <Text style={styles.desc}>{program.description}</Text>}

      <View style={styles.tagsRow}>
        {!!duration && <Tag label={duration} variant="default" />}
        <Tag label={program.tag} variant="default" />
      </View>

      {exercises.map((ex, i) => (
        <TouchableOpacity
          key={ex.id}
          style={styles.row}
          onPress={() => onSelectExercise(i)}
          activeOpacity={0.8}
        >
          {ex.imageUrl ? (
            <Image source={{ uri: ex.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumb} />
          )}
          <View style={styles.info}>
            <Text style={styles.exName}>{ex.name}</Text>
            {!!ex.durationLabel && (
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={styles.duration}>{ex.durationLabel}</Text>
              </View>
            )}
          </View>
          <View style={styles.playButton}>
            <Ionicons name="play" size={16} color={colors.text} />
          </View>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  desc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  exName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  duration: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
