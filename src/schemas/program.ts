import { z } from 'zod';

/**
 * Validation schema for the program draft form (AddToLibrary).
 * Exercises are stored separately in draftProgramStore.
 */
export const programDraftSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  tag: z.string().min(1, 'Please select a category'),
  description: z.string(),
});

export type ProgramDraftValues = z.infer<typeof programDraftSchema>;
