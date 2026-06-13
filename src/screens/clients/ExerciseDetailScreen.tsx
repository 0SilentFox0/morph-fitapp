import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
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
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import {
  SetSelector,
  Toggle,
  RestTimerControl,
  ClientSwitcherStrip,
  type SwitcherClient,
} from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { formatClock } from '../../utils';
import { mockTrainingPrograms } from '../../mocks';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Route = RouteProp<ClientsStackParamList, 'ExerciseDetail'>;
type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ExerciseDetail'>;

/** Default rest length seeded into the timer; long_rest sets get more. */
const REST_SECONDS: Record<string, number> = { short_rest: 45, long_rest: 120 };

export function ExerciseDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {
    clientId: routeClientId,
    programId: routeProgramId,
    exerciseIndex: routeExerciseIndex,
  } = route.params;

  // The screen follows the *active* client, so switching avatars instantly
  // shows that client's current exercise and live timer.
  const clients = useActiveTrainingStore((s) => s.clients);
  const activeClientId = useActiveTrainingStore((s) => s.activeClientId);
  const setActiveClient = useActiveTrainingStore((s) => s.setActiveClient);
  const openExercise = useActiveTrainingStore((s) => s.openExercise);
  const setSetIndex = useActiveTrainingStore((s) => s.setSetIndex);
  const setExerciseIndex = useActiveTrainingStore((s) => s.setExerciseIndex);
  const ensureSetLog = useActiveTrainingStore((s) => s.ensureSetLog);
  const updateSet = useActiveTrainingStore((s) => s.updateSet);
  const toggleRepToFailure = useActiveTrainingStore((s) => s.toggleRepToFailure);
  const startRest = useActiveTrainingStore((s) => s.startRest);
  const stopRest = useActiveTrainingStore((s) => s.stopRest);

  // Apply the tapped selection once on entry; from then on the store is the
  // source of truth, so switching clients preserves each one's progress.
  React.useEffect(() => {
    openExercise(routeClientId, routeProgramId, routeExerciseIndex);
    setActiveClient(routeClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const client = clients.find((c) => c.clientId === activeClientId) ?? clients[0] ?? null;
  const program = client ? mockTrainingPrograms.find((p) => p.id === client.programId) : undefined;
  const exercises = program?.exercises ?? [];

  // Seed an editable set log whenever the open exercise changes.
  const currentClientId = client?.clientId;
  const currentExerciseIndex = client?.exerciseIndex;
  React.useEffect(() => {
    if (!currentClientId || currentExerciseIndex == null) return;
    const ex = exercises[Math.min(currentExerciseIndex, exercises.length - 1)];
    if (ex) ensureSetLog(currentClientId, ex.id, ex.sets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClientId, currentExerciseIndex, program?.id]);

  if (!client || exercises.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Exercise" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active exercise.</Text>
        </View>
      </View>
    );
  }

  const exerciseIndex = Math.min(client.exerciseIndex, exercises.length - 1);
  const exercise = exercises[exerciseIndex]!;
  const sets = client.setLog[exercise.id] ?? exercise.sets;
  const setIndex = Math.min(client.setIndex, sets.length - 1);
  const currentSet = sets[setIndex]!;

  const handleStartRest = () => {
    const seconds = (currentSet.note && REST_SECONDS[currentSet.note]) || 60;
    startRest(client.clientId, seconds);
  };

  const switcherClients: SwitcherClient[] = clients.map((c) => ({
    id: c.clientId,
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
            onPress={() => navigation.navigate('TrainingSummary', { clientId: client.clientId })}
            hitSlop={8}
          >
            <Text style={styles.finish}>Finish</Text>
          </TouchableOpacity>
        }
      />

      {clients.length > 1 && (
        <ClientSwitcherStrip
          clients={switcherClients}
          activeId={activeClientId}
          onSelect={setActiveClient}
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
        <View style={styles.videoCircle}>
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
          onChange={(i) => setSetIndex(client.clientId, i)}
        />

        <Text style={[styles.label, styles.labelSpaced]}>Main info</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.fieldInput}
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            value={String(currentSet.weight)}
            onChangeText={(t) =>
              updateSet(client.clientId, exercise.id, setIndex, { weight: Number(t) || 0 })
            }
          />
          <Text style={styles.fieldSuffix}>kg</Text>
        </View>
        <View style={styles.field}>
          <TextInput
            style={styles.fieldInput}
            keyboardType="number-pad"
            inputMode="numeric"
            selectTextOnFocus
            value={String(currentSet.reps)}
            onChangeText={(t) =>
              updateSet(client.clientId, exercise.id, setIndex, { reps: Number(t) || 0 })
            }
          />
          <Text style={styles.fieldSuffix}>x</Text>
        </View>

        <View style={styles.failureRow}>
          <Toggle
            value={currentSet.note === 'failure'}
            onValueChange={() => toggleRepToFailure(client.clientId, exercise.id, setIndex)}
          />
          <Text style={styles.failureLabel}>rep to failure</Text>
        </View>

        <Text style={[styles.label, styles.labelSpaced]}>Trainer Notes</Text>
        <View style={styles.notes}>
          <Text style={styles.notesText}>
            {exercise.trainerNotes ?? 'No notes for this exercise.'}
          </Text>
        </View>

        <View style={styles.controls}>
          <RestTimerControl
            rest={client.rest}
            onStart={handleStartRest}
            onStop={() => stopRest(client.clientId)}
            onPrev={() => setExerciseIndex(client.clientId, exerciseIndex - 1)}
            onNext={() => setExerciseIndex(client.clientId, exerciseIndex + 1)}
            prevDisabled={exerciseIndex === 0}
            nextDisabled={exerciseIndex === exercises.length - 1}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const VIDEO = 120;

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
  videoCircle: {
    width: VIDEO,
    height: VIDEO,
    borderRadius: VIDEO / 2,
    borderWidth: 1,
    borderColor: colors.neutral5,
    backgroundColor: colors.neutral3,
    alignSelf: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoImage: {
    ...StyleSheet.absoluteFillObject,
    width: VIDEO,
    height: VIDEO,
  },
  playOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.neutral9,
    padding: 0,
  },
  fieldSuffix: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  failureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  failureLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text,
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
