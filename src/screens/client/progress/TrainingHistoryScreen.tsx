import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../../components/layout';
import { EmptyState } from '../../../components/ui';
import type { ProgressStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { formatKg } from '../../../utils';

const { colors, radius, typography, spacing } = theme;

import { mockTrainingPrograms } from '../../../mocks';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { formatDate } from '../../../utils';
import { computeTotals } from '../../../utils/progress/muscleStats';

type Nav = NativeStackNavigationProp<ProgressStackParamList, 'TrainingHistory'>;

const programName = (id: string) =>
  mockTrainingPrograms.find((p) => p.id === id)?.name ?? 'Training';

const labelDate = (d: string) => formatDate(d) || d;

export function TrainingHistoryScreen() {
  const navigation = useNavigation<Nav>();

  const getCurrentUserHistory = useTrainingHistoryStore(
    (s) => s.getCurrentUserHistory
  );

  useTrainingHistoryStore((s) => s.history);

  const items = [...getCurrentUserHistory()].reverse(); // newest first

  return (
    <View style={styles.container}>
      <ScreenHeader title="Training history" transparent />
      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="time-outline"
            title="No trainings yet"
            subtitle="Your completed sessions will appear here."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          {items.map((t) => {
            const totals = computeTotals([t]);

            return (
              <TouchableOpacity
                key={t.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('TrainingHistoryDetail', {
                    trainingId: t.id,
                  })
                }
              >
                <View style={styles.cardMain}>
                  <Text style={styles.program}>{programName(t.programId)}</Text>
                  <Text style={styles.date}>{labelDate(t.date)}</Text>
                  <Text style={styles.meta}>
                    {totals.exerciseCount} exercises ·{' '}
                    {formatKg(totals.tonnage)} volume
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.sm,
  },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardMain: { gap: 2, flex: 1 },
  program: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  date: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  meta: { fontSize: typography.sizes.xs, color: colors.textMuted },
});
