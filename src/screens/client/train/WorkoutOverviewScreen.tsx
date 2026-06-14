import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import type { ProgramExercise, TrainingProgram } from '../../../types';
import { ScreenHeader } from '../../../components/layout';
import { ProgramExerciseList, Button } from '../../../components/ui';
import { useActiveTrainingStore } from '../../../store/activeTrainingStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { seedParticipant, seedCustomParticipant } from '../../../utils';
import { getCurrentUser } from '../../../services/repositories';
import { mockTrainingPrograms } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Nav = NavigationProp<TrainStackParamList, 'WorkoutOverview'>;
type Route = RouteProp<TrainStackParamList, 'WorkoutOverview'>;

/** Builds a one-off TrainingProgram so the preview list can render custom workouts. */
function customProgram(exercises: ProgramExercise[]): TrainingProgram {
  return { id: 'custom', name: 'Custom workout', tag: 'Custom', videoCount: 0, views: 0, likes: 0, exercises };
}

export function WorkoutOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const params = route.params;

  const startTraining = useActiveTrainingStore((s) => s.startTraining);
  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);
  const sessions = useSessionsStore((s) => s.sessions);

  // Resolve the program/exercises for whichever path led here.
  const { program, exercises } = React.useMemo(() => {
    if (params.source === 'custom') {
      const prog = customProgram(params.exercises);
      return { program: prog, exercises: params.exercises };
    }
    if (params.source === 'assigned') {
      const session = sessions.find((s) => s.id === params.sessionId);
      const prog =
        mockTrainingPrograms.find((p) => p.id === session?.programId && (p.exercises?.length ?? 0) > 0) ??
        mockTrainingPrograms.find((p) => (p.exercises?.length ?? 0) > 0)!;
      return { program: prog, exercises: prog.exercises ?? [] };
    }
    const prog =
      mockTrainingPrograms.find((p) => p.id === params.programId) ??
      mockTrainingPrograms.find((p) => (p.exercises?.length ?? 0) > 0)!;
    return { program: prog, exercises: prog.exercises ?? [] };
  }, [params, sessions]);

  const start = (exerciseIndex: number) => {
    const me = getCurrentUser();
    const lookup = (name: string, exId: number) => getLastSets(name, exId);
    const participant =
      params.source === 'custom'
        ? seedCustomParticipant(me, exercises, { lookupPrevSets: lookup })
        : seedParticipant(me, program, { lookupPrevSets: lookup });
    startTraining([participant]);
    navigation.navigate('ExerciseDetail', {
      participantId: me.id,
      programId: participant.programId,
      exerciseIndex,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={program.name} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <Text style={styles.empty}>This workout has no exercises yet.</Text>
        ) : (
          <ProgramExerciseList program={program} onSelectExercise={(i) => start(i)} />
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Button title="Start training" onPress={() => start(0)} disabled={exercises.length === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  empty: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
