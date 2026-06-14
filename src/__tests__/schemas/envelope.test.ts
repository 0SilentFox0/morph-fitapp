import { z } from 'zod';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';

describe('envelope helpers', () => {
  it('dataEnvelope unwraps { data }', () => {
    const schema = dataEnvelope(z.object({ id: z.string() }));
    expect(schema.parse({ data: { id: 'a' } })).toEqual({ data: { id: 'a' } });
  });

  it('paginatedEnvelope accepts data + optional meta', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }));
    const parsed = schema.parse({ data: [{ id: 'a' }], meta: { next_cursor: 'c', has_more: true } });
    expect(parsed.meta?.has_more).toBe(true);
  });

  it('paginatedEnvelope tolerates a missing meta', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }));
    expect(schema.parse({ data: [] }).data).toEqual([]);
  });
});
