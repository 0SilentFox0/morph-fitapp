import { useEffect } from 'react';
import { useActiveTrainingStore } from '../store/activeTrainingStore';

/**
 * Drives rest countdowns for the whole training group: while ANY client's
 * timer is running, ticks the store once per second (tickRest decrements every
 * running client). Mount this exactly once high in the tree (the Clients stack)
 * so timers keep counting regardless of which client is on screen.
 */
export function useRestTimer() {
  const tickRest = useActiveTrainingStore((s) => s.tickRest);
  const anyRunning = useActiveTrainingStore((s) => s.clients.some((c) => c.rest.running));

  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [anyRunning, tickRest]);
}
