import { z } from 'zod';

/**
 * Validation schema for the Cardio Class form. Drives the
 * CardioClassFormScreen via react-hook-form + zodResolver.
 *
 * Date/time are kept as strings here because the existing UI accepts
 * freeform input ("04/10/2026", "14:00"). When a real native picker
 * is added these become z.date() and the form initializes with new Date().
 */
export const cardioClassSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters'),
  type: z.string().min(1, 'Type is required'),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  price: z
    .string()
    .regex(/^\d+$/, 'Price must be a whole number')
    .min(1, 'Price is required'),
  clientIds: z.array(z.string()),
});

export type CardioClassFormValues = z.infer<typeof cardioClassSchema>;
