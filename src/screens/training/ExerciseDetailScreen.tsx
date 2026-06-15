import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/layout';
import {
  ClientSwitcherStrip,
  RestTimerControl,
  SetSelector,
} from '../../components/ui';
import type { LiveTrainingParamList } from '../../navigation/types';
import theme from '../../theme';
import { SetEditor } from './ExerciseDetail/SetEditor';
import { useActiveExercise } from './ExerciseDetail/useActiveExercise';

const { colors, radius, typography, spacing } = theme;

type Route = RouteProp<LiveTrainingParamList, 'ExerciseDetail'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen() {
  const route = useRoute<Route>();

  const navigation = useNavigation<Nav>();

  const insets = useSafeAreaInsets();

  const vm = useActiveExercise(route.params ?? {});

  if (!vm) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Exercise" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active exercise.</Text>
        </View>
      </View>
    );
  }

  const {
    participant,
    exercise,
    exercises,
    exerciseIndex,
    sets,
    setIndex,
    currentSet,
    prevSet,
  } = vm;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Exercise"
        rightElement={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('TrainingSummary', {
                participantId: participant.participantId,
              })
            }
            hitSlop={8}
          >
            <Text style={styles.finish}>Finish</Text>
          </TouchableOpacity>
        }
      />

      {vm.participants.length > 1 && (
        <ClientSwitcherStrip
          clients={vm.switcherClients}
          activeId={vm.activeParticipantId}
          onSelect={vm.setActiveParticipant}
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
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.videoImage}
            />
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
          onChange={vm.onSetChange}
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
          onWeightChange={vm.onWeightChange}
          onRepsChange={vm.onRepsChange}
          onToggleFailure={vm.onToggleFailure}
        />

        <Text style={[styles.label, styles.labelSpaced]}>Trainer Notes</Text>
        <View style={styles.notes}>
          <Text style={styles.notesText}>
            {exercise.trainerNotes ?? 'No notes for this exercise.'}
          </Text>
        </View>

        <View style={styles.controls}>
          <RestTimerControl
            rest={vm.rest}
            onStart={vm.onStartRest}
            onStop={vm.onStopRest}
            onPrev={vm.onPrev}
            onNext={vm.onNext}
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
