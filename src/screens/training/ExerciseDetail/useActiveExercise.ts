import React from 'react';
import { useActiveTrainingStore } from '../../../store/activeTrainingStore';
import { mockTrainingPrograms } from '../../../mocks';
import { formatClock } from '../../../utils';
import type { SwitcherClient } from '../../../components/ui';

/** Default rest length seeded into the timer; long_rest sets get more. */
const REST_SECONDS: Record<string, number> = { short_rest: 45, long_rest: 120 };

interface RouteParams {
  participantId?: string;
  programId?: string | null;
  exerciseIndex?: number;
}

/**
 * View-model for the live exercise screen: applies the entry selection, follows
 * the active participant, seeds editable set logs, and exposes the current
 * exercise/set plus store-bound handlers. Returns `null` when there is no active
 * exercise (screen shows its empty state).
 */
export function useActiveExercise(params: RouteParams) {
  const {
    participantId: routeParticipantId,
    programId: routeProgramId,
    exerciseIndex: routeExerciseIndex,
  } = params;

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

  // Apply the tapped selection once on entry; the store is the source of truth
  // afterwards, so switching participants preserves each one's progress.
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

  if (!participant || exercises.length === 0) return null;

  const exerciseIndex = Math.min(participant.exerciseIndex, exercises.length - 1);
  const exercise = exercises[exerciseIndex]!;
  const sets = participant.setLog[exercise.id] ?? exercise.sets;
  const setIndex = Math.min(participant.setIndex, sets.length - 1);
  const currentSet = sets[setIndex]!;
  const prevSet = participant.prevSets?.[exercise.id]?.[setIndex];

  const pid = participant.participantId;
  const switcherClients: SwitcherClient[] = participants.map((c) => ({
    id: c.participantId,
    name: c.name,
    avatar: c.avatar,
    badge: c.rest.running ? formatClock(c.rest.remainingSec) : undefined,
  }));

  return {
    participants,
    activeParticipantId,
    setActiveParticipant,
    participant,
    exercise,
    exercises,
    exerciseIndex,
    sets,
    setIndex,
    currentSet,
    prevSet,
    rest: participant.rest,
    switcherClients,
    onSetChange: (i: number) => setSetIndex(pid, i),
    onWeightChange: (weight: number) => updateSet(pid, exercise.id, setIndex, { weight }),
    onRepsChange: (reps: number) => updateSet(pid, exercise.id, setIndex, { reps }),
    onToggleFailure: () => toggleRepToFailure(pid, exercise.id, setIndex),
    onStartRest: () => startRest(pid, (currentSet.note && REST_SECONDS[currentSet.note]) || 60),
    onStopRest: () => stopRest(pid),
    onPrev: () => setExerciseIndex(pid, exerciseIndex - 1),
    onNext: () => setExerciseIndex(pid, exerciseIndex + 1),
  };
}
