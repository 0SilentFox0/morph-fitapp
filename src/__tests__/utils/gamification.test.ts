import type { CompletedTraining } from '../../types';
import {
  activeWeeks,
  daysSinceLast,
  computeConsistency,
  computeComposite,
  computeTrainerComposite,
  softCap,
  percentileOf,
  pointsFor,
} from '../../utils/game/gamification';

const NOW = new Date('2026-06-13T12:00:00Z');

/** A training `weeksAgo` before NOW (one logged set). */
function training(weeksAgo: number, id = `t${weeksAgo}`): CompletedTraining {
  const d = new Date(NOW.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
  return {
    id,
    clientName: 'You',
    programId: 'p1',
    date: d.toISOString(),
    exercises: [{ exerciseId: 101, sets: [{ weight: 80, reps: 5 }] }],
  };
}

/** Steady weekly training for the last `n` weeks (including this week). */
function steady(n: number): CompletedTraining[] {
  return Array.from({ length: n }, (_, i) => training(i, `s${i}`));
}

describe('activeWeeks / daysSinceLast', () => {
  it('counts distinct active weeks', () => {
    expect(activeWeeks(steady(8))).toBe(8);
  });

  it('reports days since the most recent session', () => {
    expect(daysSinceLast(steady(4), NOW)).toBeCloseTo(0, 0);
    expect(daysSinceLast([training(3)], NOW)).toBeCloseTo(21, 0);
  });

  it('returns Infinity with no history', () => {
    expect(daysSinceLast([], NOW)).toBe(Infinity);
  });
});

describe('computeConsistency', () => {
  it('rewards long-term regular training over a single recent session', () => {
    const veteran = computeConsistency(steady(104), 2000, NOW).normalized; // ~2 years
    const rookie = computeConsistency(steady(1), 20, NOW).normalized; // 1 week
    expect(veteran).toBeGreaterThan(rookie);
  });

  it('decays toward zero as inactivity grows', () => {
    const recent = computeConsistency(steady(12), 240, NOW).raw;
    // Same 12-week block but the last session was ~6 weeks (2·tau) ago.
    const stale = computeConsistency(
      Array.from({ length: 12 }, (_, i) => training(i + 6, `g${i}`)),
      240,
      NOW,
    ).raw;
    expect(stale).toBeLessThan(recent);
    expect(stale).toBeGreaterThan(0);
  });

  it('produces a normalized score within [0,1)', () => {
    const { normalized } = computeConsistency(steady(52), 1000, NOW);
    expect(normalized).toBeGreaterThan(0);
    expect(normalized).toBeLessThan(1);
  });

  it('is zero with no history', () => {
    expect(computeConsistency([], 0, NOW)).toMatchObject({ raw: 0, normalized: 0 });
  });
});

describe('computeComposite', () => {
  it('weights consistency 0.75 and strength 0.25', () => {
    expect(computeComposite(0.8, 0.4)).toBeCloseTo(0.7, 5);
    expect(computeComposite(1, 0)).toBeCloseTo(0.75, 5);
    expect(computeComposite(0, 1)).toBeCloseTo(0.25, 5);
  });
});

describe('percentileOf', () => {
  it('is the fraction of the pool strictly below the value', () => {
    expect(percentileOf(5, [1, 2, 3, 10])).toBeCloseTo(0.75);
    expect(percentileOf(0, [1, 2, 3])).toBe(0);
    expect(percentileOf(100, [1, 2, 3])).toBe(1);
  });

  it('is 0 for an empty pool', () => {
    expect(percentileOf(5, [])).toBe(0);
  });
});

describe('pointsFor', () => {
  it('awards 20 per session and 15 per PR', () => {
    expect(pointsFor(3, 2)).toBe(90);
    expect(pointsFor(0, 0)).toBe(0);
  });
});

describe('softCap', () => {
  it('maps a count into 0..1 with diminishing returns', () => {
    expect(softCap(0, 8)).toBe(0);
    expect(softCap(8, 8)).toBeCloseTo(0.5);
    expect(softCap(1000, 8)).toBeGreaterThan(0.99);
  });
});

describe('computeTrainerComposite', () => {
  it('grows with trainings, clients and client records, and stays in 0..1', () => {
    const small = computeTrainerComposite(2, 1, 1);
    const big = computeTrainerComposite(50, 20, 40);
    expect(big).toBeGreaterThan(small);
    expect(big).toBeLessThanOrEqual(1);
    expect(small).toBeGreaterThan(0);
  });

  it('is zero with no work', () => {
    expect(computeTrainerComposite(0, 0, 0)).toBe(0);
  });
});
