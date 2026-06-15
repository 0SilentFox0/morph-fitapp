import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { LiveTrainingParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import {
  SetSelector,
  RestTimerControl,
  ClientSwitcherStrip,
  type SwitcherClient,
} from '../../components/ui';
import { SetEditor } from './ExerciseDetail/SetEditor';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { mockTrainingPrograms } from '../../mocks';
import { formatClock } from '../../utils';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;

type Route = RouteProp<LiveTrainingParamList, 'ExerciseDetail'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'ExerciseDetail'>;

/** Default rest length seeded into the timer; long_rest sets get more. */
const REST_SECONDS: Record<string, number> = { short_rest: 45, long_rest: 120 };

export function ExerciseDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  // Params are optional at runtime: the screen can also be reached with an
  // already-active training (e.g. via the client switcher) and no params.
  const {
    participantId: routeParticipantId,
    programId: routeProgramId,
    exerciseIndex: routeExerciseIndex,
  } = route.params ?? {};

  // The screen follows the *active* participant, so switching avatars instantly
  // shows that participant's current exercise and live timer.
  const participants = useActiveTrainingStore((s) => s.participants);
  const activeParticipantId = useActiveTrainingStore((s) => s.activeParticipantId);
  const setActiveParticipant = useActiveTrainingStore((s) => s.setActiveParticipant);
  const openExercise = useActiveTrainingStore((s) => s.openExercise);
  const setSetIndex = useActiveTrainingStore((s) => s.setSetIndex);
  const setExerciseIndex = useActiveTrainingStore((s) => s.setExerciseIndex);
  const ensureSetLog = useActiveTrainingStore((s) => s.ensureSetLog);
  const updateSet = useActiveTrainingStore((s) => s.updateSet);
  const toggleRepToFailure = useActiveTrainingStore((s) => s.toggleRepToFailure);
  const startRest = useActiveTrainingStore((s) => s.startRest);
  const stopRest = useActiveTrainingStore((s) => s.stopRest);

  // Apply the tapped selection once on entry; from then on the store is the
  // source of truth, so switching participants preserves each one's progress.
  React.useEffect(() => {
    if (routeParticipantId && routeExerciseIndex != null) {
      const openedProgram = routeProgramId
        ? mockTrainingPrograms.find((p) => p.id === routeProgramId)
        : undefined;
      openExercise(routeParticipantId, routeProgramId ?? null, routeExerciseIndex, openedProgram?.exercises);
      setActiveParticipant(routeParticipantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const participant =
    participants.find((c) => c.participantId === activeParticipantId) ?? participants[0] ?? null;
  const exercises = participant?.exercises ?? [];

  // Seed an editable set log whenever the open exercise changes.
  const currentParticipantId = participant?.participantId;
  const currentExerciseIndex = participant?.exerciseIndex;
  React.useEffect(() => {
    if (!currentParticipantId || currentExerciseIndex == null) return;
    const ex = exercises[Math.min(currentExerciseIndex, exercises.length - 1)];
    if (ex) ensureSetLog(currentParticipantId, ex.id, ex.sets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParticipantId, currentExerciseIndex, exercises.length]);

  if (!participant || exercises.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Exercise" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active exercise.</Text>
        </View>
      </View>
    );
  }

  const exerciseIndex = Math.min(participant.exerciseIndex, exercises.length - 1);
  const exercise = exercises[exerciseIndex]!;
  const sets = participant.setLog[exercise.id] ?? exercise.sets;
  const setIndex = Math.min(participant.setIndex, sets.length - 1);
  const currentSet = sets[setIndex]!;
  const prevSet = participant.prevSets?.[exercise.id]?.[setIndex];

  const handleStartRest = () => {
    const seconds = (currentSet.note && REST_SECONDS[currentSet.note]) || 60;
    startRest(participant.participantId, seconds);
  };

  const switcherClients: SwitcherClient[] = participants.map((c) => ({
    id: c.participantId,
    name: c.name,
    avatar: c.avatar,
    badge: c.rest.running ? formatClock(c.rest.remainingSec) : undefined,
  }));

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Exercise"
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('TrainingSummary', { participantId: participant.participantId })}
            hitSlop={8}
          >
            <Text style={styles.finish}>Finish</Text>
          </TouchableOpacity>
        }
      />

      {participants.length > 1 && (
        <ClientSwitcherStrip
          clients={switcherClients}
          activeId={activeParticipantId}
          onSelect={setActiveParticipant}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing['2xl'] + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.video}>
          {exercise.imageUrl && (
            <Image source={{ uri: exercise.imageUrl }} style={styles.videoImage} />
          )}
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={28} color={colors.white} />
          </View>
        </View>
        <Text style={styles.progress}>
          {exerciseIndex + 1} of {exercises.length}
        </Text>

        <Text style={styles.label}>Set</Text>
        <SetSelector
          count={sets.length}
          value={setIndex}
          onChange={(i) => setSetIndex(participant.participantId, i)}
        />

        {prevSet && (
          <View style={styles.lastTimeRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.lastTimeText}>
              Last time: {prevSet.weight} kg × {prevSet.reps}
            </Text>
          </View>
        )}

        <Text style={[styles.label, styles.labelSpaced]}>Main info</Text>
        <SetEditor
          weight={currentSet.weight}
          reps={currentSet.reps}
          toFailure={currentSet.note === 'failure'}
          onWeightChange={(weight) => updateSet(participant.participantId, exercise.id, setIndex, { weight })}
          onRepsChange={(reps) => updateSet(participant.participantId, exercise.id, setIndex, { reps })}
          onToggleFailure={() => toggleRepToFailure(participant.participantId, exercise.id, setIndex)}
        />

        <Text style={[styles.label, styles.labelSpaced]}>Trainer Notes</Text>
        <View style={styles.notes}>
          <Text style={styles.notesText}>
            {exercise.trainerNotes ?? 'No notes for this exercise.'}
          </Text>
        </View>

        <View style={styles.controls}>
          <RestTimerControl
            rest={participant.rest}
            onStart={handleStartRest}
            onStop={() => stopRest(participant.participantId)}
            onPrev={() => setExerciseIndex(participant.participantId, exerciseIndex - 1)}
            onNext={() => setExerciseIndex(participant.participantId, exerciseIndex + 1)}
            prevDisabled={exerciseIndex === 0}
            nextDisabled={exerciseIndex === exercises.length - 1}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
  },
  finish: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral5,
    backgroundColor: colors.neutral3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoImage: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  lastTimeText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  progress: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral7,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.base,
    color: colors.text,
    marginBottom: spacing.md,
  },
  labelSpaced: {
    marginTop: spacing.lg,
  },
  notes: {
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    minHeight: 112,
    padding: spacing.md,
  },
  notesText: {
    fontSize: typography.sizes.base,
    color: colors.neutral9,
  },
  controls: {
    marginTop: spacing.xl,
  },
});
