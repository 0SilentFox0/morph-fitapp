import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { EmptyState } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { exerciseCatalog } from '../../../mocks';
import { computePRs } from '../../../utils/personalRecords';

export function PersonalRecordsScreen() {
  const history = useTrainingHistoryStore((s) => s.getCurrentUserHistory());
  const prs = computePRs(history);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Personal records" transparent />
      {prs.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState icon="trophy-outline" title="No records yet" subtitle="Log a few sessions to start setting PRs." />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {prs.map((pr) => {
            const name = exerciseCatalog[pr.exerciseId]?.name ?? `Exercise ${pr.exerciseId}`;
            const isWeighted = pr.maxWeight > 0;
            return (
              <View key={pr.exerciseId} style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name="trophy" size={18} color={colors.accent} />
                </View>
                <View style={styles.cardMain}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.detail}>
                    {isWeighted
                      ? `Best ${pr.maxWeight}kg × ${pr.repsAtMaxWeight} · est. 1RM ${pr.best1RM}kg`
                      : `Best set ${pr.maxReps} reps`}
                  </Text>
                </View>
                {isWeighted ? (
                  <Text style={styles.headline}>{pr.best1RM}kg</Text>
                ) : (
                  <Text style={styles.headline}>{pr.maxReps}</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: { flex: 1, gap: 2 },
  name: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  detail: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  headline: { fontSize: typography.sizes.lg, color: colors.accent, fontWeight: typography.weights.bold },
});
