import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { trainingMetric } from '../../../utils';
import type { CompletedTraining, TrainingProgram } from '../../../types';

export interface TrainingHistoryCardProps {
  training: CompletedTraining;
  /** Program the training was based on, if it can still be resolved. */
  program?: TrainingProgram;
}

/** One completed-training row in a client's training history list. */
export function TrainingHistoryCard({ training, program }: TrainingHistoryCardProps) {
  const exerciseCount = training.exercises.length;
  return (
    <View style={styles.historyCard}>
      {program?.thumbnail ? (
        <Image source={{ uri: program.thumbnail }} style={styles.historyThumb} />
      ) : (
        <View style={styles.historyThumb} />
      )}
      <View style={styles.historyInfo}>
        <View style={styles.historyTitleRow}>
          <Text style={styles.historyName}>{program?.name ?? 'Training'}</Text>
          <Text style={styles.historyDate}>{training.date}</Text>
        </View>
        <Text style={styles.historyType}>{program?.tag ?? '—'}</Text>
        <View style={styles.statRow}>
          <Stat icon="barbell-outline" value={`${exerciseCount} ex`} />
          <Stat icon="trending-up-outline" value={trainingMetric(training)} />
        </View>
      </View>
    </View>
  );
}

function Stat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  historyThumb: {
    width: 96,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  historyDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  historyType: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
