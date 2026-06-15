import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useShallow } from 'zustand/react/shallow';
import { useProgramsStore } from '../../../../store/programsStore';
import { useDraftProgramStore } from '../../../../store/draftProgramStore';
import { programDraftSchema, type ProgramDraftValues } from '../../../../schemas/program';
import { useDisclosure } from '../../../../hooks/ui/useDisclosure';
import { useMirror } from '../../../../hooks/ui/useMirror';
import type { TrainingProgram } from '../../../../types';

export interface ProgramDraftFormNav {
  goBack: () => void;
  goToGallery: () => void;
  goToLibrary: () => void;
}

/**
 * Create/edit program form orchestration: react-hook-form + zod, draft mirroring
 * into draftProgramStore (create mode), and the continue / save-as-draft handlers.
 * Navigation is injected so the hook stays free of navigation context.
 */
export function useProgramDraftForm(program: TrainingProgram | undefined, nav: ProgramDraftFormNav) {
  const isEdit = !!program;
  const addProgramFromDraft = useProgramsStore((s) => s.addProgramFromDraft);
  const updateProgram = useProgramsStore((s) => s.updateProgram);

  const {
    title: storeTitle,
    setTitle: setStoreTitle,
    tag: storeTag,
    setTag: setStoreTag,
    description: storeDescription,
    setDescription: setStoreDescription,
    exercises,
    setExercises,
    resetDraft,
  } = useDraftProgramStore(
    useShallow((s) => ({
      title: s.title,
      setTitle: s.setTitle,
      tag: s.tag,
      setTag: s.setTag,
      description: s.description,
      setDescription: s.setDescription,
      exercises: s.exercises,
      setExercises: s.setExercises,
      resetDraft: s.reset,
    })),
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    getValues,
  } = useForm<ProgramDraftValues>({
    resolver: zodResolver(programDraftSchema),
    defaultValues: {
      title: isEdit ? (program?.name ?? '') : storeTitle,
      tag: isEdit ? (program?.tag ?? 'Cardio') : storeTag,
      description: isEdit ? (program?.description ?? '') : storeDescription,
    },
    mode: 'onBlur',
  });

  // Edit mode: hydrate the form + draft exercises from the route param.
  React.useEffect(() => {
    if (isEdit && program) {
      reset({ title: program.name, tag: program.tag, description: program.description ?? '' });
      setExercises(program.exercises ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, program?.id, reset, setExercises]);

  // Mirror form changes back into the draft store (create mode only).
  const watchedTitle = watch('title');
  useMirror(watchedTitle, !isEdit, setStoreTitle);
  useMirror(watch('tag'), !isEdit, setStoreTag);
  useMirror(watch('description'), !isEdit, setStoreDescription);

  const tagModal = useDisclosure();

  const submit = handleSubmit((data) => {
    if (isEdit && program) {
      updateProgram(program.id, {
        name: data.title,
        tag: data.tag,
        description: data.description,
        exercises,
        videoCount: exercises.length,
      });
      resetDraft();
      nav.goBack();
    } else {
      nav.goToGallery();
    }
  });

  // Save as Draft skips full validation — empty title falls back to a placeholder.
  const saveDraft = () => {
    const data = getValues();
    if (isEdit && program) {
      updateProgram(program.id, {
        name: data.title || program.name,
        tag: data.tag,
        description: data.description,
        exercises,
        videoCount: exercises.length,
      });
    } else {
      addProgramFromDraft({ title: data.title, tag: data.tag, description: data.description, exercises });
    }
    resetDraft();
    nav.goToLibrary();
  };

  const handleBack = () => {
    if (!isEdit) resetDraft();
    nav.goBack();
  };

  return { control, errors, exercises, tagModal, watchedTitle, isEdit, program, submit, saveDraft, handleBack };
}
