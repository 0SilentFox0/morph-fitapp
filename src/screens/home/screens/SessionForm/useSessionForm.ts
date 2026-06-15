import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSessionsStore } from '../../../../store/sessionsStore';
import { useProgramsStore } from '../../../../store/programsStore';
import { useDisclosure } from '../../../../hooks/ui/useDisclosure';
import { sessionSchema, type SessionFormValues } from '../../../../schemas/session';
import { formatDate, formatTime, buildParticipants } from '../../../../utils';
import type { Session, ExerciseSet } from '../../../../types';

/**
 * All session create/edit form orchestration: react-hook-form + zod validation,
 * the type/program picker disclosures, derived progression visibility, and the
 * save handler. `onComplete` runs after a successful save (the screen wires it
 * to navigation), keeping this hook free of navigation context and unit-testable.
 */
export function useSessionForm(session: Session | undefined, onComplete: () => void) {
  const addSession = useSessionsStore((s) => s.addSession);
  const updateSession = useSessionsStore((s) => s.updateSession);
  const programs = useProgramsStore((s) => s.programs);

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
  const [plannedSets, setPlannedSets] = React.useState<Record<number, ExerciseSet[]>>({});

  const titleValue = watch('title');
  const dateValue = watch('date');
  const timeValue = watch('time');
  const typeValue = watch('type');
  const programIdValue = watch('programId');
  const participantsValue = watch('participants');

  const selectedProgram = programs.find((p) => p.id === programIdValue);
  // Progression pre-fill is per-client, so it only applies to Personal (1-participant) sessions.
  const isPersonal = participantsValue.length === 1;
  const showProgression = isPersonal && (selectedProgram?.exercises?.length ?? 0) > 0;

  const onSubmit = (data: SessionFormValues) => {
    const common = {
      title: data.title.trim(),
      type: data.type,
      date: formatDate(data.date),
      time: formatTime(data.time),
      participants: buildParticipants(data.participants, session?.participants),
      programId: data.programId,
      plannedSets: showProgression ? plannedSets : undefined,
    };
    if (session) {
      updateSession(session.id, common);
    } else {
      addSession({ ...common, status: 'pending' });
    }
    onComplete();
  };

  return {
    control,
    errors,
    setValue,
    programs,
    submit: handleSubmit(onSubmit),
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
