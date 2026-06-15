import { z } from 'zod';

/** Single-resource envelope: `{ data: <schema> }`. */
export const dataEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ data: schema });

/** Cursor-pagination metadata returned alongside list endpoints. */
export const paginationMeta = z.object({
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean().optional(),
});

/** List envelope: `{ data: <schema>[], meta?: {...} }`. */
export const paginatedEnvelope = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: paginationMeta.optional() });

export type Paginated<T> = { data: T[]; meta?: z.infer<typeof paginationMeta> };
