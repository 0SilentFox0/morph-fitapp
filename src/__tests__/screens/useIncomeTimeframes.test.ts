import { deriveMonthIncome, deriveCustomIncome } from '../../screens/stats/Analytics/useIncomeTimeframes';

const week = { labels: ['Mon', 'Tue', 'Wed'], datasets: [{ data: [100, 200, 300] }] } as never;

describe('deriveMonthIncome', () => {
  it('produces four weekly buckets scaled from the week total', () => {
    const r = deriveMonthIncome(week);
    expect(r.labels).toEqual(['W1', 'W2', 'W3', 'W4']);
    expect(r.datasets[0]!.data).toHaveLength(4);
    expect(r.datasets[0]!.data[0]).toBe(Math.round(600 * 0.9)); // total 600
  });
});

describe('deriveCustomIncome', () => {
  it('returns the original series when there is no custom range', () => {
    expect(deriveCustomIncome(week, null)).toBe(week);
  });

  it('produces at most 7 points with M/D labels for a custom range', () => {
    const range = { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) };
    const r = deriveCustomIncome(week, range);
    expect(r.datasets[0]!.data.length).toBeLessThanOrEqual(7);
    expect(r.labels.length).toBe(r.datasets[0]!.data.length);
    expect(r.labels[0]).toMatch(/^\d+\/\d+$/);
  });
});
