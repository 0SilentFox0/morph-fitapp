import { useEffect } from 'react';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';

/**
 * Drives rest countdowns for the whole session: while ANY participant's timer
 * is running, ticks the store once per second (tickRest decrements every
 * running participant). Mount this exactly once high in each live-training
 * stack so timers keep counting regardless of which screen is on top.
 */
export function useRestTimer() {
  const tickRest = useActiveTrainingStore((s) => s.tickRest);
  const anyRunning = useActiveTrainingStore((s) => s.participants.some((c) => c.rest.running));

  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [anyRunning, tickRest]);
}
