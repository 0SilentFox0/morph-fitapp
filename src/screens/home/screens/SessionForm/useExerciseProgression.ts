import React from 'react';

import { useTrainingHistoryStore } from '../../../../store/trainingHistoryStore';
import type { ExerciseSet, TrainingProgram } from '../../../../types';
import { applyProgression } from '../../../../utils';

type PctState = Record<number, { weightPct: number; repsPct: number }>;

/**
 * Session-creation progression logic, decoupled from its presentation.
 * Pre-fills each exercise from the client's previous training (falling back to
 * the program template) and lets the trainer bump weight/reps by a percentage,
 * emitting the resolved target sets to `onChange` whenever inputs change.
 */
export function useExerciseProgression(
  program: TrainingProgram,
  clientName: string,
  onChange: (plannedSets: Record<number, ExerciseSet[]>) => void
) {
  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);

  const exercises = program.exercises ?? [];

  // Base = previous training values, else the program template.
  const bases = React.useMemo(() => {
    const map: Record<number, ExerciseSet[]> = {};

    for (const ex of program.exercises ?? []) {
      map[ex.id] = getLastSets(clientName, ex.id) ?? ex.sets;
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.id, clientName]);

  const [pct, setPct] = React.useState<PctState>({});

  React.useEffect(() => {
    setPct({});
  }, [program.id, clientName]);

  React.useEffect(() => {
    const planned: Record<number, ExerciseSet[]> = {};

    for (const ex of program.exercises ?? []) {
      const p = pct[ex.id] ?? { weightPct: 0, repsPct: 0 };

      planned[ex.id] = applyProgression(
        bases[ex.id] ?? ex.sets,
        p.weightPct,
        p.repsPct
      );
    }
    onChange(planned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bases, pct]);

  const setExercisePct = (
    id: number,
    key: 'weightPct' | 'repsPct',
    value: number
  ) =>
    setPct((prev) => ({
      ...prev,
      [id]: { weightPct: 0, repsPct: 0, ...prev[id], [key]: value },
    }));

  return { exercises, bases, pct, setExercisePct };
}
