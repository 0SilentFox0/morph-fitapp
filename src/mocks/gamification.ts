import { mockTrainingHistory, mockSessions, mockClients, CURRENT_USER_NAME } from './data';
import type { CompletedTraining } from '../types';
import { computePRs } from '../utils/progress/personalRecords';
import { computeWeekStreak } from '../utils/game/achievements';
import {
  computeConsistency,
  computeComposite,
  computeTrainerComposite,
  percentileOf,
  pointsFor,
  GAMIFICATION_CONFIG,
} from '../utils/game/gamification';
import { resolveTier, nextTier, tierProgress } from '../utils/game/leagues';
import type {
  CanonicalExercise,
  GamificationState,
  LeaderboardEntry,
  PointsLedgerEntry,
  PublicUser,
  TrainerGamificationState,
  PricingInsight,
} from '../services/gamificationApi';

export const CURRENT_USER_ID = 'me';

/** Small global catalog of canonical base lifts (GAME-005). */
export const CANONICAL_EXERCISES: CanonicalExercise[] = [
  { key: 'bench_press', name: 'Bench press', category: 'push' },
  { key: 'back_squat', name: 'Back squat', category: 'squat' },
  { key: 'deadlift', name: 'Deadlift', category: 'hinge' },
  { key: 'barbell_row', name: 'Barbell row', category: 'pull' },
  { key: 'overhead_press', name: 'Overhead press', category: 'push' },
];

/** Trainer-owned mock exercise id → canonical key (unmapped ids get no board). */
export const EXERCISE_CANONICAL_MAP: Record<number, string> = {
  101: 'bench_press',
  301: 'back_squat',
  302: 'deadlift',
  202: 'barbell_row',
};

/** Reference top weight (kg) per canonical, used to scale the synthetic pool. */
const CANONICAL_REFERENCE_1RM: Record<string, number> = {
  bench_press: 160,
  back_squat: 230,
  deadlift: 290,
  barbell_row: 130,
  overhead_press: 110,
};

const POOL_SIZE = 60;

const FIRST_NAMES = [
  'Alex', 'Maria', 'Ivan', 'Sofia', 'Dmytro', 'Olha', 'Andriy', 'Kateryna',
  'Petro', 'Yulia', 'Taras', 'Nina', 'Roman', 'Lena', 'Yurii', 'Vika',
  'Bohdan', 'Anna', 'Serhii', 'Daria',
];
const LAST_INITIALS = 'KSMTBVRLPGNZDFCH';

/** Deterministic pseudo-random 0..1 from an integer seed (no Math.random). */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface PoolMember {
  user: PublicUser;
  composite: number;
  /** best 1RM (kg) per canonical key. */
  bests: Record<string, number>;
}

function buildPool(): PoolMember[] {
  const members: PoolMember[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const r = seeded(i + 1);
    // Skew toward the middle so tiers populate realistically.
    const composite = Math.min(0.98, Math.max(0.02, 0.15 + r * 0.8));
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_INITIALS[i % LAST_INITIALS.length]!;
    const bests: Record<string, number> = {};
    for (const c of CANONICAL_EXERCISES) {
      const ref = CANONICAL_REFERENCE_1RM[c.key] ?? 100;
      const jitter = 0.55 + seeded(i * 7 + c.key.length) * 0.5; // 0.55..1.05
      bests[c.key] = Math.round(ref * composite * jitter);
    }
    members.push({
      user: { id: `u${i + 1}`, name: `${first} ${last}.`, avatarUrl: null },
      composite,
      bests,
    });
  }
  return members;
}

const POOL = buildPool();

/** Current user's best verified 1RM per canonical, from their training history. */
function currentUserBests(history: CompletedTraining[]): Record<string, number> {
  const prs = computePRs(history);
  const bests: Record<string, number> = {};
  for (const pr of prs) {
    const canonical = EXERCISE_CANONICAL_MAP[pr.exerciseId];
    if (!canonical) continue;
    if (!bests[canonical] || pr.best1RM > bests[canonical]!) {
      bests[canonical] = pr.best1RM;
    }
  }
  return bests;
}

function currentUserHistory(): CompletedTraining[] {
  const key = CURRENT_USER_NAME.trim().toLowerCase();
  return mockTrainingHistory.filter((h) => h.clientName.trim().toLowerCase() === key);
}

/** Strength percentile (0..1) = mean over the user's canonicals of their pool percentile. */
function strengthPercentile(bests: Record<string, number>): number {
  const keys = Object.keys(bests);
  if (keys.length === 0) return 0;
  let sum = 0;
  for (const key of keys) {
    const pool = POOL.map((m) => m.bests[key] ?? 0);
    sum += percentileOf(bests[key]!, pool);
  }
  return sum / keys.length;
}

interface CurrentUserScore {
  points: number;
  consistency: number;
  strength: number;
  composite: number;
  bests: Record<string, number>;
}

function scoreCurrentUser(now: Date): CurrentUserScore {
  const history = currentUserHistory();
  const prCount = computePRs(history).length;
  const points = pointsFor(history.length, prCount);
  const consistency = computeConsistency(history, points, now).normalized;
  const bests = currentUserBests(history);
  const strength = strengthPercentile(bests);
  const composite = computeComposite(consistency, strength);
  return { points, consistency, strength, composite, bests };
}

/** Full composite leaderboard (pool + current user), ranked desc. */
function compositeRanked(now: Date): { entries: LeaderboardEntry[]; me: CurrentUserScore } {
  const me = scoreCurrentUser(now);
  const rows: { user: PublicUser; composite: number; isMe: boolean }[] = [
    ...POOL.map((m) => ({ user: m.user, composite: m.composite, isMe: false })),
    {
      user: { id: CURRENT_USER_ID, name: 'You', avatarUrl: null },
      composite: me.composite,
      isMe: true,
    },
  ];
  rows.sort((a, b) => b.composite - a.composite);
  const all = rows.map((r) => r.composite);
  const entries = rows.map((r, idx) => ({
    rank: idx + 1,
    user: r.user,
    score: Math.round(r.composite * 1000),
    percentile: percentileOf(r.composite, all),
    leagueKey: resolveTier(percentileOf(r.composite, all)).key,
    isCurrentUser: r.isMe,
  }));
  return { entries, me };
}

export function buildMyGamification(now: Date = new Date()): GamificationState {
  const { entries, me } = compositeRanked(now);
  const mine = entries.find((e) => e.isCurrentUser)!;
  const tier = resolveTier(mine.percentile);
  const next = nextTier(tier);
  return {
    userId: CURRENT_USER_ID,
    points: me.points,
    league: { key: tier.key, name: tier.name, ordinal: tier.ordinal },
    percentile: mine.percentile,
    rank: mine.rank,
    poolSize: entries.length,
    compositeScore: mine.score,
    consistencyScore: me.consistency,
    strengthScore: me.strength,
    nextTier: {
      key: next?.key ?? null,
      name: next?.name ?? null,
      progress: tierProgress(mine.percentile),
      percentileNeeded: next ? next.minPercentile : null,
    },
    provisional: entries.length < 20,
  };
}

export function buildCompositeLeaderboard(now: Date = new Date()): LeaderboardEntry[] {
  return compositeRanked(now).entries;
}

export function buildCanonicalLeaderboard(canonicalKey: string, now: Date = new Date()): LeaderboardEntry[] {
  const me = scoreCurrentUser(now);
  const rows: { user: PublicUser; best: number; isMe: boolean }[] = POOL.filter(
    (m) => (m.bests[canonicalKey] ?? 0) > 0,
  ).map((m) => ({ user: m.user, best: m.bests[canonicalKey]!, isMe: false }));

  const myBest = me.bests[canonicalKey];
  if (myBest && myBest > 0) {
    rows.push({ user: { id: CURRENT_USER_ID, name: 'You', avatarUrl: null }, best: myBest, isMe: true });
  }
  rows.sort((a, b) => b.best - a.best);
  const all = rows.map((r) => r.best);
  return rows.map((r, idx) => ({
    rank: idx + 1,
    user: r.user,
    score: r.best,
    percentile: percentileOf(r.best, all),
    leagueKey: resolveTier(percentileOf(r.best, all)).key,
    isCurrentUser: r.isMe,
  }));
}

const REASON_LABELS: Record<PointsLedgerEntry['reason'], string> = {
  session_completed: 'Completed a training',
  pr_set: 'New personal record',
  streak_milestone: 'Streak milestone',
  reversal: 'Adjustment',
  admin_adjustment: 'Manual adjustment',
};

export function buildPointsLedger(now: Date = new Date()): PointsLedgerEntry[] {
  const history = currentUserHistory();
  const cfg = pointsFor(1, 0); // session points
  const entries: PointsLedgerEntry[] = history.map((t, i) => ({
    id: `ledger-${t.id}-${i}`,
    amount: cfg,
    reason: 'session_completed',
    createdAt: t.date,
    label: REASON_LABELS.session_completed,
  }));
  // PR awards.
  computePRs(history).forEach((pr, i) => {
    entries.push({
      id: `ledger-pr-${pr.exerciseId}-${i}`,
      amount: pointsFor(0, 1),
      reason: 'pr_set',
      createdAt: history[history.length - 1]?.date ?? now.toISOString(),
      label: REASON_LABELS.pr_set,
    });
  });
  if (computeWeekStreak(history, now) >= 4) {
    entries.push({
      id: 'ledger-streak-4',
      amount: 50,
      reason: 'streak_milestone',
      createdAt: now.toISOString(),
      label: REASON_LABELS.streak_milestone,
    });
  }
  // Newest first.
  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Trainer gamification (GAME-007) ─────────────────────────────────────────

const TRAINER_POOL_SIZE = 40;

interface TrainerPoolMember {
  user: PublicUser;
  composite: number;
}

const TRAINER_POOL: TrainerPoolMember[] = Array.from({ length: TRAINER_POOL_SIZE }, (_, i) => {
  const r = seeded(i + 101);
  const first = FIRST_NAMES[(i + 3) % FIRST_NAMES.length]!;
  const last = LAST_INITIALS[(i + 5) % LAST_INITIALS.length]!;
  return {
    user: { id: `t${i + 1}`, name: `${first} ${last}.`, avatarUrl: null },
    composite: Math.min(0.97, Math.max(0.05, 0.12 + r * 0.82)),
  };
});

interface TrainerScore {
  trainings: number;
  clients: number;
  records: number;
  composite: number;
}

function scoreCurrentTrainer(): TrainerScore {
  const trainings = mockSessions.filter((s) => s.status === 'completed').length;
  const clients = mockClients.length;
  const records = mockClients.reduce((sum, c) => {
    const key = c.name.trim().toLowerCase();
    const history = mockTrainingHistory.filter((h) => h.clientName.trim().toLowerCase() === key);
    return sum + computePRs(history).length;
  }, 0);
  return { trainings, clients, records, composite: computeTrainerComposite(trainings, clients, records) };
}

function trainerRanked(): { entries: LeaderboardEntry[]; me: TrainerScore } {
  const me = scoreCurrentTrainer();
  const rows = [
    ...TRAINER_POOL.map((m) => ({ user: m.user, composite: m.composite, isMe: false })),
    { user: { id: CURRENT_USER_ID, name: 'You', avatarUrl: null }, composite: me.composite, isMe: true },
  ];
  rows.sort((a, b) => b.composite - a.composite);
  const all = rows.map((r) => r.composite);
  const entries = rows.map((r, idx) => ({
    rank: idx + 1,
    user: r.user,
    score: Math.round(r.composite * 1000),
    percentile: percentileOf(r.composite, all),
    leagueKey: resolveTier(percentileOf(r.composite, all)).key,
    isCurrentUser: r.isMe,
  }));
  return { entries, me };
}

export function buildTrainerGamification(): TrainerGamificationState {
  const { entries, me } = trainerRanked();
  const mine = entries.find((e) => e.isCurrentUser)!;
  const tier = resolveTier(mine.percentile);
  const next = nextTier(tier);
  return {
    userId: CURRENT_USER_ID,
    league: { key: tier.key, name: tier.name, ordinal: tier.ordinal },
    percentile: mine.percentile,
    rank: mine.rank,
    poolSize: entries.length,
    compositeScore: mine.score,
    completedTrainings: me.trainings,
    activeClients: me.clients,
    clientRecords: me.records,
    nextTier: {
      key: next?.key ?? null,
      name: next?.name ?? null,
      progress: tierProgress(mine.percentile),
      percentileNeeded: next ? next.minPercentile : null,
    },
    provisional: entries.length < 20,
  };
}

export function buildTrainerLeaderboard(): LeaderboardEntry[] {
  return trainerRanked().entries;
}

// ─── Pricing insights (GAME-008) ─────────────────────────────────────────────

/** Rough per-session price baseline per currency, for the synthetic distribution. */
const PRICE_BASELINE: Record<string, number> = { USD: 45, EUR: 42, UAH: 700 };

function pricePool(currency: string): number[] {
  const base = PRICE_BASELINE[currency] ?? PRICE_BASELINE.USD!;
  return Array.from({ length: 50 }, (_, i) => {
    const spread = 0.55 + seeded(i + 201) * 0.9; // 0.55..1.45 of baseline
    return Math.round(base * spread);
  });
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[idx]!;
}

export function buildPricingInsight(currency: string, price: number): PricingInsight {
  const pool = pricePool(currency);
  const sorted = [...pool].sort((a, b) => a - b);
  return {
    currency,
    sampleSize: pool.length,
    yourPercentile: percentileOf(price, pool),
    p25: quantile(sorted, 0.25),
    p50: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    insufficientData: pool.length < GAMIFICATION_CONFIG.pricing.minSample,
  };
}
