import { useEffect } from 'react';
import { Vibration } from 'react-native';

import { useActiveTrainingStore } from '../../store/activeTrainingStore';

/**
 * Drives rest countdowns for the whole session: while ANY participant's timer
 * is running, ticks the store once per second (tickRest decrements every
 * running participant). Mount this exactly once high in each live-training
 * stack so timers keep counting regardless of which screen is on top.
 *
 * Also fires a short vibration the moment any rest period ends, so the trainer
 * doesn't have to watch the screen — fixes the "silent timer" complaint.
 */
export function useRestTimer() {
  const tickRest = useActiveTrainingStore((s) => s.tickRest);

  const anyRunning = useActiveTrainingStore((s) =>
    s.participants.some((c) => c.rest.running)
  );

  useEffect(() => {
    if (!anyRunning) return;

    const id = setInterval(() => {
      const before = useActiveTrainingStore.getState().participants;

      tickRest();

      const after = useActiveTrainingStore.getState().participants;

      // Buzz when any participant's timer crosses from running → 0 this tick.
      const justFinished = after.some((a) => {
        const b = before.find((x) => x.participantId === a.participantId);

        return b?.rest.running && !a.rest.running && a.rest.remainingSec === 0;
      });

      if (justFinished) Vibration.vibrate(400);
    }, 1000);

    return () => clearInterval(id);
  }, [anyRunning, tickRest]);
}
