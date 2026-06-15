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

const { colors, radius, typography, spacing } = theme;

import { exerciseCatalog } from '../../../mocks';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { listExerciseProgress } from '../../../utils/progress/exerciseProgress';

type Nav = NativeStackNavigationProp<
  ProgressStackParamList,
  'ExerciseProgress'
>;

export function ExerciseProgressScreen() {
  const navigation = useNavigation<Nav>();

  const getCurrentUserHistory = useTrainingHistoryStore(
    (s) => s.getCurrentUserHistory
  );

  useTrainingHistoryStore((s) => s.history);

  const exercises = listExerciseProgress(
    getCurrentUserHistory(),
    exerciseCatalog
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Exercise progress" transparent />
      {exercises.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="barbell-outline"
            title="No exercises yet"
            subtitle="Log a session to track per-exercise progress."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          {exercises.map((ex) => (
            <TouchableOpacity
              key={ex.exerciseId}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ExerciseProgressDetail', {
                  exerciseId: ex.exerciseId,
                })
              }
            >
              <View style={styles.cardMain}>
                <Text style={styles.name}>{ex.name}</Text>
                <Text style={styles.meta}>
                  {ex.sessions} session{ex.sessions === 1 ? '' : 's'}
                  {ex.topWeight > 0 ? ` · best ${ex.topWeight}kg` : ''}
                </Text>
              </View>
              {ex.best1RM > 0 && <Text style={styles.rm}>{ex.best1RM}kg</Text>}
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
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
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardMain: { flex: 1, gap: 2 },
  name: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  meta: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  rm: {
    fontSize: typography.sizes.base,
    color: colors.accent,
    fontWeight: typography.weights.bold,
  },
});
