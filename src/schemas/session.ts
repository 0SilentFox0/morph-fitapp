import { z } from 'zod';

/**
 * Validation schema for the session creation/edit form.
 * Consumed by react-hook-form via zodResolver:
 *
 *   const { control, handleSubmit } = useForm<SessionFormValues>({
 *     resolver: zodResolver(sessionSchema),
 *     defaultValues: { ... },
 *   });
 */
export const sessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters'),
  programId: z.string().min(1, 'Please select a training program'),
  date: z.date(),
  time: z.date(),
  type: z.string().min(1, 'Please select a type'),
  participants: z.array(z.string()),
});

export type SessionFormValues = z.infer<typeof sessionSchema>;
