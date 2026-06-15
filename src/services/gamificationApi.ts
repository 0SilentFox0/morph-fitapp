import { apiFetch } from './apiClient';
import type { LeagueTierKey } from '../utils/game/leagues';
import { LEAGUE_TIERS } from '../utils/game/leagues';
import {
  CANONICAL_EXERCISES,
  buildMyGamification,
  buildCompositeLeaderboard,
  buildCanonicalLeaderboard,
  buildPointsLedger,
  buildTrainerGamification,
  buildTrainerLeaderboard,
  buildPricingInsight,
} from '../mocks/gamification';

/**
 * Gamification API client (GAME-001…008).
 *
 * Today every call resolves from local mock generators so the UI is fully
 * functional before the backend exists. The real `/v1/...` request is written
 * out alongside each mock behind `USE_MOCK`. When the FitConnect API ships:
 *   1. set `EXPO_PUBLIC_FITCONNECT_API` (so `USE_MOCK` becomes false), and
 *   2. point `apiClient` at that base.
 * No screen or store changes are needed — they depend only on these typed
 * functions and the shapes below, which mirror the backend resources exactly.
 */
const USE_MOCK = !process.env.EXPO_PUBLIC_FITCONNECT_API;

// ─── Contract types (mirror backend Http/Resources) ─────────────────────────

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface GamificationLeague {
  key: LeagueTierKey;
  name: string;
  ordinal: number;
}

export interface NextTierProgress {
  key: LeagueTierKey | null;
  name: string | null;
  /** 0..1 progress through the current tier band toward the next. */
  progress: number;
  /** Percentile threshold to reach the next tier, or null at the top. */
  percentileNeeded: number | null;
}

export interface GamificationState {
  userId: string;
  points: number;
  league: GamificationLeague;
  percentile: number;
  rank: number;
  poolSize: number;
  compositeScore: number;
  consistencyScore: number;
  strengthScore: number;
  nextTier: NextTierProgress;
  /** True while the pool is too small for stable percentiles. */
  provisional: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: PublicUser;
  score: number;
  percentile: number;
  leagueKey: LeagueTierKey;
  isCurrentUser: boolean;
}

export interface LeaderboardPage {
  data: LeaderboardEntry[];
  /** Cursor (rank offset) for the next page, or null when exhausted. */
  nextCursor: number | null;
  hasMore: boolean;
}

export interface MyRankWindow {
  me: LeaderboardEntry | null;
  neighbors: LeaderboardEntry[];
}

export type PointsReason =
  | 'session_completed'
  | 'pr_set'
  | 'streak_milestone'
  | 'reversal'
  | 'admin_adjustment';

export interface PointsLedgerEntry {
  id: string;
  amount: number;
  reason: PointsReason;
  createdAt: string;
  label: string;
}

export interface PointsLedgerPage {
  data: PointsLedgerEntry[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface CanonicalExercise {
  key: string;
  name: string;
  category: string;
}

export interface LeagueTierInfo {
  key: LeagueTierKey;
  name: string;
  ordinal: number;
  minPercentile: number;
  maxPercentile: number;
}

export interface TrainerGamificationState {
  userId: string;
  league: GamificationLeague;
  percentile: number;
  rank: number;
  poolSize: number;
  compositeScore: number;
  completedTrainings: number;
  activeClients: number;
  clientRecords: number;
  nextTier: NextTierProgress;
  provisional: boolean;
}

export type PackageKind = 'count_based' | 'time_based' | 'hybrid';

export interface PricingInsight {
  currency: string;
  sampleSize: number;
  /** Fraction (0..1) of trainers priced strictly below this price. */
  yourPercentile: number;
  p25: number;
  p50: number;
  p75: number;
  /** True when the sample is too small to show a comparison. */
  insufficientData: boolean;
}

const DEFAULT_LIMIT = 50;

function paginate<T>(items: T[], cursor = 0, limit = DEFAULT_LIMIT): {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
} {
  const start = Math.max(0, cursor);
  const slice = items.slice(start, start + limit);
  const next = start + limit;
  const hasMore = next < items.length;
  return { data: slice, nextCursor: hasMore ? next : null, hasMore };
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

/** GET /v1/me/gamification */
export async function fetchMyGamification(): Promise<GamificationState> {
  if (USE_MOCK) return buildMyGamification();
  const res = await apiFetch<{ data: GamificationState }>(`/v1/me/gamification`);
  return res.data;
}

/** GET /v1/me/points/ledger?cursor=&limit= */
export async function fetchPointsLedger(cursor = 0, limit = DEFAULT_LIMIT): Promise<PointsLedgerPage> {
  if (USE_MOCK) return paginate(buildPointsLedger(), cursor, limit);
  return apiFetch<PointsLedgerPage>(`/v1/me/points/ledger?cursor=${cursor}&limit=${limit}`);
}

/** GET /v1/leagues?role=client */
export async function fetchLeagues(role: 'client' | 'trainer' = 'client'): Promise<LeagueTierInfo[]> {
  if (USE_MOCK) {
    return LEAGUE_TIERS.map((t) => ({
      key: t.key,
      name: t.name,
      ordinal: t.ordinal,
      minPercentile: t.minPercentile,
      maxPercentile: t.maxPercentile,
    }));
  }
  const res = await apiFetch<{ data: LeagueTierInfo[] }>(`/v1/leagues?role=${role}`);
  return res.data;
}

/** GET /v1/leaderboards/composite?scope=world&cursor=&limit= */
export async function fetchCompositeLeaderboard(cursor = 0, limit = DEFAULT_LIMIT): Promise<LeaderboardPage> {
  if (USE_MOCK) return paginate(buildCompositeLeaderboard(), cursor, limit);
  return apiFetch<LeaderboardPage>(`/v1/leaderboards/composite?scope=world&cursor=${cursor}&limit=${limit}`);
}

/** GET /v1/leaderboards/composite/me — my rank + immediate neighbors. */
export async function fetchCompositeLeaderboardMe(): Promise<MyRankWindow> {
  if (USE_MOCK) {
    const all = buildCompositeLeaderboard();
    const idx = all.findIndex((e) => e.isCurrentUser);
    if (idx === -1) return { me: null, neighbors: [] };
    return { me: all[idx]!, neighbors: all.slice(Math.max(0, idx - 2), idx + 3) };
  }
  return apiFetch<MyRankWindow>(`/v1/leaderboards/composite/me`);
}

/** GET /v1/leaderboards/canonical/{key}?cursor=&limit= */
export async function fetchCanonicalLeaderboard(
  canonicalKey: string,
  cursor = 0,
  limit = DEFAULT_LIMIT,
): Promise<LeaderboardPage> {
  if (USE_MOCK) return paginate(buildCanonicalLeaderboard(canonicalKey), cursor, limit);
  return apiFetch<LeaderboardPage>(
    `/v1/leaderboards/canonical/${encodeURIComponent(canonicalKey)}?cursor=${cursor}&limit=${limit}`,
  );
}

/** GET /v1/canonical-exercises */
export async function fetchCanonicalExercises(): Promise<CanonicalExercise[]> {
  if (USE_MOCK) return CANONICAL_EXERCISES;
  const res = await apiFetch<{ data: CanonicalExercise[] }>(`/v1/canonical-exercises`);
  return res.data;
}

/** GET /v1/me/trainer-gamification (GAME-007) */
export async function fetchTrainerGamification(): Promise<TrainerGamificationState> {
  if (USE_MOCK) return buildTrainerGamification();
  const res = await apiFetch<{ data: TrainerGamificationState }>(`/v1/me/trainer-gamification`);
  return res.data;
}

/** GET /v1/leaderboards/trainers?scope=world (GAME-007) */
export async function fetchTrainerLeaderboard(cursor = 0, limit = DEFAULT_LIMIT): Promise<LeaderboardPage> {
  if (USE_MOCK) return paginate(buildTrainerLeaderboard(), cursor, limit);
  return apiFetch<LeaderboardPage>(`/v1/leaderboards/trainers?scope=world&cursor=${cursor}&limit=${limit}`);
}

/** GET /v1/pricing-insights?currency=&kind=&price= (GAME-008) */
export async function fetchPricingInsight(
  currency: string,
  price: number,
  kind?: PackageKind,
): Promise<PricingInsight> {
  if (USE_MOCK) return buildPricingInsight(currency, price);
  const query = `currency=${encodeURIComponent(currency)}&price=${price}${kind ? `&kind=${kind}` : ''}`;
  const res = await apiFetch<{ data: PricingInsight }>(`/v1/pricing-insights?${query}`);
  return res.data;
}
