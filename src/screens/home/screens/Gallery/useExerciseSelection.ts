import React from 'react';

import type { ProgramExercise } from '../../../../types';

/**
 * Tracks which gallery exercises the user has picked. Exercises already in the
 * draft (`existingIds`) are treated as locked and can't be toggled off.
 */
export function useExerciseSelection(draftExercises: ProgramExercise[]) {
  const existingIds = React.useMemo(
    () => new Set(draftExercises.map((e) => e.id)),
    [draftExercises]
  );

  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const toggleSelect = React.useCallback(
    (id: number) => {
      if (existingIds.has(id)) return;

      setSelected((prev) => {
        const next = new Set(prev);

        if (next.has(id)) next.delete(id);
        else next.add(id);

        return next;
      });
    },
    [existingIds]
  );

  return { selected, toggleSelect, existingIds };
}
