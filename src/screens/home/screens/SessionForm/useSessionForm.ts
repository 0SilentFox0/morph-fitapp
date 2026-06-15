import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useDisclosure } from '../../../../hooks/ui/useDisclosure';
import {
  type SessionFormValues,
  sessionSchema,
} from '../../../../schemas/session';
import {
  createSession as createSessionApi,
  updateSession as updateSessionApi,
} from '../../../../services/repositories/sessionsRepository';
import { useProgramsStore } from '../../../../store/programsStore';
import { useSessionsStore } from '../../../../store/sessionsStore';
import type { ExerciseSet, Session } from '../../../../types';
import { buildParticipants, formatDate, formatTime } from '../../../../utils';

/**
 * All session create/edit form orchestration: react-hook-form + zod validation,
 * the type/program picker disclosures, derived progression visibility, and the
 * save handler. `onComplete` runs after a successful save (the screen wires it
 * to navigation), keeping this hook free of navigation context and unit-testable.
 */
export function useSessionForm(
  session: Session | undefined,
  onComplete: (counterpartName?: string) => void
) {
  const addSession = useSessionsStore((s) => s.addSession);

  const updateSession = useSessionsStore((s) => s.updateSession);

  const programs = useProgramsStore((s) => s.programs);

  const loadPrograms = useProgramsStore((s) => s.loadPrograms);

  // The store starts empty; make sure the program picker has data (idempotent).
  React.useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: session?.title ?? '',
      programId: session?.programId ?? '',
      date: new Date(),
      time: new Date(),
      type: session?.type ?? 'Cardio',
      participants: session?.participants?.map((p) => p.name) ?? [],
    },
    mode: 'onBlur',
  });

  const typePicker = useDisclosure();

  const programPicker = useDisclosure();

  const [plannedSets, setPlannedSets] = React.useState<
    Record<number, ExerciseSet[]>
  >({});

  const titleValue = watch('title');

  const dateValue = watch('date');

  const timeValue = watch('time');

  const typeValue = watch('type');

  const programIdValue = watch('programId');

  const participantsValue = watch('participants');

  const selectedProgram = programs.find((p) => p.id === programIdValue);

  // Progression pre-fill is per-client, so it only applies to Personal (1-participant) sessions.
  const isPersonal = participantsValue.length === 1;

  const showProgression =
    isPersonal && (selectedProgram?.exercises?.length ?? 0) > 0;

  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: SessionFormValues) => {
    const common = {
      title: data.title.trim(),
      type: data.type,
      date: formatDate(data.date),
      time: formatTime(data.time),
      participants: buildParticipants(data.participants, session?.participants),
      programId: data.programId,
      plannedSets: showProgression ? plannedSets : undefined,
    };

    const apiForm = {
      title: data.title,
      type: data.type,
      date: data.date,
      time: data.time,
      programId: data.programId,
    };

    setError(null);
    setSubmitting(true);
    try {
      // Persist to the backend first; only mirror into the local display cache
      // and navigate once the write actually succeeds.
      if (session) {
        await updateSessionApi(session.id, apiForm);
        updateSession(session.id, common);
      } else {
        await createSessionApi(apiForm);
        addSession({ ...common, status: 'pending' });
      }

      onComplete(data.participants[0]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not save the session'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    control,
    errors,
    setValue,
    programs,
    submit: handleSubmit(onSubmit),
    submitting,
    error,
    typePicker,
    programPicker,
    plannedSets,
    setPlannedSets,
    titleValue,
    dateValue,
    timeValue,
    typeValue,
    programIdValue,
    participantsValue,
    selectedProgram,
    showProgression,
  };
}
