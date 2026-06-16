import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  type NavigationProp,
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { Button, ProgramExerciseList } from '../../../components/ui';
import { mockTrainingPrograms } from '../../../mocks';
import type { TrainStackParamList } from '../../../navigation/types';
import { getCurrentUser } from '../../../services/repositories';
import { useActiveTrainingStore } from '../../../store/activeTrainingStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import theme from '../../../theme';
import type {
  ExerciseSet,
  ProgramExercise,
  TrainingProgram,
} from '../../../types';
import { seedCustomParticipant, seedParticipant } from '../../../utils';

const { colors, typography, spacing } = theme;

type Nav = NavigationProp<TrainStackParamList, 'WorkoutOverview'>;
type Route = RouteProp<TrainStackParamList, 'WorkoutOverview'>;

/** Builds a one-off TrainingProgram so the preview list can render custom workouts. */
function customProgram(exercises: ProgramExercise[]): TrainingProgram {
  return {
    id: 'custom',
    name: 'Custom workout',
    tag: 'Custom',
    videoCount: 0,
    views: 0,
    likes: 0,
    exercises,
  };
}

export function WorkoutOverviewScreen() {
  const navigation = useNavigation<Nav>();

  const route = useRoute<Route>();

  const insets = useSafeAreaInsets();

  const params = route.params;

  const startTraining = useActiveTrainingStore((s) => s.startTraining);

  const beginServerWorkout = useActiveTrainingStore(
    (s) => s.beginServerWorkout
  );

  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);

  const sessions = useSessionsStore((s) => s.sessions);

  // Resolve the program/exercises for whichever path led here.
  const { program, exercises, plannedSets } = React.useMemo(() => {
    if (params.source === 'custom') {
      const prog = customProgram(params.exercises);

      return {
        program: prog,
        exercises: params.exercises,
        plannedSets: undefined as Record<number, ExerciseSet[]> | undefined,
      };
    }

    if (params.source === 'assigned') {
      const session = sessions.find((s) => s.id === params.sessionId);

      const prog =
        mockTrainingPrograms.find(
          (p) => p.id === session?.programId && (p.exercises?.length ?? 0) > 0
        ) ?? null;

      return {
        program: prog,
        exercises: prog?.exercises ?? [],
        plannedSets: session?.plannedSets,
      };
    }

    const prog =
      mockTrainingPrograms.find(
        (p) => p.id === params.programId && (p.exercises?.length ?? 0) > 0
      ) ?? null;

    return {
      program: prog,
      exercises: prog?.exercises ?? [],
      plannedSets: undefined,
    };
  }, [params, sessions]);

  const start = (exerciseIndex: number) => {
    const me = getCurrentUser();

    const lookup = (name: string, exId: number) => getLastSets(name, exId);

    let participant;

    if (params.source === 'custom') {
      participant = seedCustomParticipant(me, exercises, {
        lookupPrevSets: lookup,
      });
    } else {
      if (!program) return;

      participant = seedParticipant(me, program, {
        plannedSets,
        lookupPrevSets: lookup,
      });
    }

    startTraining([participant]);

    // Open a server workout log for a real (API-backed) assigned session so the
    // completed workout persists on finish. No-op for mock/program/custom flows
    // (the store guards on a UUID session id).
    if (params.source === 'assigned') {
      void beginServerWorkout(params.sessionId);
    }

    navigation.navigate('ExerciseDetail', {
      participantId: me.id,
      programId: participant.programId,
      exerciseIndex,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={program?.name ?? 'Workout'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing['2xl'] + insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {program && exercises.length > 0 ? (
          <ProgramExerciseList
            program={program}
            onSelectExercise={(i) => start(i)}
          />
        ) : (
          <Text style={styles.empty}>This workout has no exercises yet.</Text>
        )}
      </ScrollView>
      <View
        style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}
      >
        <Button
          title="Start training"
          onPress={() => start(0)}
          disabled={exercises.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  empty: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
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
