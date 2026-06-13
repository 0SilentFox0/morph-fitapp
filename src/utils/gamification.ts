import type { CompletedTraining } from '../mocks';
import { computeWeekStreak } from './achievements';

/**
 * Client-side mirror of the backend scoring config (`config/gamification.php`,
 * GAME-002). Kept here so mock-computed scores match what the server will return
 * once `/v1/me/gamification` is live. Tunable in one place.
 */
export const GAMIFICATION_CONFIG = {
  points: { sessionCompleted: 20, prSet: 15, streakMilestone: 50 },
  consistency: {
    wLong: 1.0,
    wStreak: 0.5,
    wFreq: 0.8,
    wPoints: 0.3,
    tauDays: 21,
    freqWindowWeeks: 12,
    freqCap: 6,
    streakCap: 52,
    /** Soft-cap constant mapping the raw consistency score into 0..1. */
    normalizeK: 6,
  },
  composite: { wConsistency: 0.75, wStrength: 0.25 },
  streakMilestonesWeeks: [4, 12, 26, 52],
  /**
   * Trainer composite (GAME-007): volume of work + roster + clients' results.
   * Money is deliberately excluded. `k*` are soft-cap constants (value / (value + k))
   * normalizing each input into 0..1. Tuned for the mock dataset; the backend
   * carries the production values in `config/gamification.php`.
   */
  trainer: {
    wTrainings: 0.45,
    wClients: 0.25,
    wRecords: 0.3,
    kTrainings: 8,
    kClients: 6,
    kRecords: 12,
  },
  /** Pricing insights (GAME-008): hide the comparison below this sample size. */
  pricing: { minSample: 20 },
} as const;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekKey(d: Date): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - copy.getDay()); // back to Sunday
  return `${copy.getFullYear()}-${copy.getMonth()}-${copy.getDate()}`;
}

/** Distinct calendar weeks (Sun-anchored) that contain at least one training. */
export function activeWeeks(history: CompletedTraining[]): number {
  const weeks = new Set<string>();
  for (const t of history) {
    const d = new Date(t.date);
    if (!Number.isNaN(d.getTime())) weeks.add(weekKey(d));
  }
  return weeks.size;
}

/** Average sessions per active week over a trailing window ending at `now`. */
export function sessionsPerActiveWeek(history: CompletedTraining[], now: Date): number {
  const cutoff = now.getTime() - GAMIFICATION_CONFIG.consistency.freqWindowWeeks * WEEK_MS;
  const recent = history.filter((t) => {
    const ts = new Date(t.date).getTime();
    return !Number.isNaN(ts) && ts >= cutoff;
  });
  if (recent.length === 0) return 0;
  const weeks = new Set(recent.map((t) => weekKey(new Date(t.date))));
  return recent.length / weeks.size;
}

/** Whole days since the most recent training, or Infinity when there is none. */
export function daysSinceLast(history: CompletedTraining[], now: Date): number {
  let latest = -Infinity;
  for (const t of history) {
    const ts = new Date(t.date).getTime();
    if (!Number.isNaN(ts) && ts > latest) latest = ts;
  }
  if (latest === -Infinity) return Infinity;
  return Math.max(0, (now.getTime() - latest) / (24 * 60 * 60 * 1000));
}

export interface ConsistencyResult {
  /** Decayed raw score (unbounded ≥ 0). */
  raw: number;
  /** Soft-capped into 0..1, comparable with the strength percentile. */
  normalized: number;
  parts: {
    activeWeeks: number;
    streakWeeks: number;
    sessionsPerWeek: number;
    decay: number;
  };
}

/**
 * Consistency sub-score (GAME-002): longevity + streak + frequency + points,
 * multiplied by an inactivity decay so a user who stops training slides down.
 * Pure: pass `now` and `lifetimePoints` in.
 */
export function computeConsistency(
  history: CompletedTraining[],
  lifetimePoints: number,
  now: Date,
): ConsistencyResult {
  const c = GAMIFICATION_CONFIG.consistency;
  const weeks = activeWeeks(history);
  const streak = Math.min(computeWeekStreak(history, now), c.streakCap);
  const freq = Math.min(sessionsPerActiveWeek(history, now), c.freqCap);
  const dsl = daysSinceLast(history, now);
  const decay = dsl === Infinity ? 0 : Math.exp(-dsl / c.tauDays);

  const base =
    c.wLong * Math.log1p(weeks) +
    c.wStreak * streak +
    c.wFreq * freq +
    c.wPoints * Math.log1p(Math.max(0, lifetimePoints));
  const raw = base * decay;
  const normalized = raw / (raw + c.normalizeK);

  return {
    raw,
    normalized,
    parts: { activeWeeks: weeks, streakWeeks: streak, sessionsPerWeek: freq, decay },
  };
}

/**
 * Composite score (0..1): consistency-dominant blend of the normalized
 * consistency and the strength percentile (also 0..1).
 */
export function computeComposite(consistencyNormalized: number, strengthPercentile: number): number {
  const { wConsistency, wStrength } = GAMIFICATION_CONFIG.composite;
  return wConsistency * consistencyNormalized + wStrength * strengthPercentile;
}

/**
 * Fraction of `pool` whose value is strictly below `value` (i.e. `percent_rank`
 * semantics, ties excluded). Returns 0..1. Empty pool → 0.
 */
export function percentileOf(value: number, pool: number[]): number {
  if (pool.length === 0) return 0;
  const below = pool.reduce((n, v) => n + (v < value ? 1 : 0), 0);
  return below / pool.length;
}

/** Points earned so far given completed-session and PR counts (GAME-001). */
export function pointsFor(sessionCount: number, prCount: number): number {
  const { sessionCompleted, prSet } = GAMIFICATION_CONFIG.points;
  return sessionCount * sessionCompleted + prCount * prSet;
}

/** Diminishing-returns normalizer mapping a count into 0..1. */
export function softCap(value: number, k: number): number {
  return value <= 0 ? 0 : value / (value + k);
}

/**
 * Trainer composite score (0..1, GAME-007): completed trainings + active clients
 * + clients' verified records. Money is excluded by design.
 */
export function computeTrainerComposite(
  trainings: number,
  activeClients: number,
  clientRecords: number,
): number {
  const t = GAMIFICATION_CONFIG.trainer;
  return (
    t.wTrainings * softCap(trainings, t.kTrainings) +
    t.wClients * softCap(activeClients, t.kClients) +
    t.wRecords * softCap(clientRecords, t.kRecords)
  );
}
