import { activeDayKeys, computeWeekStreak, computeBadges } from '../../utils/achievements';
import type { CompletedTraining } from '../../types';

const make = (id: string, date: string, weight = 0, reps = 10): CompletedTraining => ({
  id,
  clientName: 'Me',
  programId: '1',
  date,
  exercises: [{ exerciseId: 301, sets: [{ weight, reps }] }],
});

describe('activeDayKeys', () => {
  it('collects one key per parseable training day and ignores unparseable dates', () => {
    const keys = activeDayKeys([
      make('a', '2026-06-01T10:00:00Z'),
      make('b', '2026-06-01T18:00:00Z'), // same day
      make('c', 'not-a-date'),
    ]);
    expect(keys.size).toBe(1);
  });
});

describe('computeWeekStreak', () => {
  const now = new Date('2026-06-13T12:00:00Z'); // Saturday

  it('counts consecutive weeks ending with the current week', () => {
    const history = [
      make('a', '2026-06-02T12:00:00Z'), // week of Jun 1
      make('b', '2026-06-09T12:00:00Z'), // week of Jun 8 (current week)
    ];
    expect(computeWeekStreak(history, now)).toBe(2);
  });

  it('returns 0 when the current week has no session', () => {
    const history = [make('a', '2026-05-20T12:00:00Z')];
    expect(computeWeekStreak(history, now)).toBe(0);
  });

  it('breaks the streak on a gap week', () => {
    const history = [
      make('a', '2026-05-25T12:00:00Z'), // 3 weeks ago
      make('b', '2026-06-09T12:00:00Z'), // current week (gap before it)
    ];
    expect(computeWeekStreak(history, now)).toBe(1);
  });
});

describe('computeBadges', () => {
  const now = new Date('2026-06-13T12:00:00Z');

  it('earns the first-session badge once there is any history', () => {
    const badges = computeBadges([make('a', '2026-06-09T12:00:00Z')], 0, now);
    expect(badges.find((b) => b.id === 'first-session')?.earned).toBe(true);
    expect(badges.find((b) => b.id === 'ten-sessions')?.earned).toBe(false);
  });

  it('earns the point-collector badge from accumulated points', () => {
    const badges = computeBadges([], 150, now);
    expect(badges.find((b) => b.id === 'point-collector')?.earned).toBe(true);
  });

  it('earns the heavy-lifter badge past 10,000 kg total volume', () => {
    const heavy = make('h', '2026-06-09T12:00:00Z', 100, 110); // 11,000 kg
    const badges = computeBadges([heavy], 0, now);
    expect(badges.find((b) => b.id === 'heavy-lifter')?.earned).toBe(true);
  });
});
