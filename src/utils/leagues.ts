import { colors } from '../theme/colors';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Percentile league tiers (GAME-003). Tiers are persistent named bands; a user's
 * tier is the band their composite percentile (0..1, within their pool) falls
 * into. `min` inclusive, `max` exclusive (platinum's max is inclusive at 1).
 *
 * This is the UI-side presentation table (names/colors/icons). The server is the
 * source of truth for which tier a user is in (`/v1/leagues` + `/v1/me/gamification`);
 * when the API lands, swap `resolveTier` for the server-assigned tier and keep
 * this table only for colors/icons keyed by `key`.
 */
export type LeagueTierKey =
  | 'wooden'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'diamond'
  | 'platinum';

export interface LeagueTier {
  key: LeagueTierKey;
  name: string;
  /** 1..6, higher is better. */
  ordinal: number;
  /** Inclusive lower percentile bound (0..1). */
  minPercentile: number;
  /** Exclusive upper percentile bound (1.0 treated inclusive for platinum). */
  maxPercentile: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const LEAGUE_TIERS: readonly LeagueTier[] = [
  { key: 'wooden', name: 'Wooden', ordinal: 1, minPercentile: 0.0, maxPercentile: 0.4, icon: 'leaf', color: colors.neutral6 },
  { key: 'bronze', name: 'Bronze', ordinal: 2, minPercentile: 0.4, maxPercentile: 0.65, icon: 'medal', color: colors.primary7 },
  { key: 'silver', name: 'Silver', ordinal: 3, minPercentile: 0.65, maxPercentile: 0.82, icon: 'medal', color: colors.neutral8 },
  { key: 'gold', name: 'Gold', ordinal: 4, minPercentile: 0.82, maxPercentile: 0.93, icon: 'trophy', color: colors.warning7 },
  { key: 'diamond', name: 'Diamond', ordinal: 5, minPercentile: 0.93, maxPercentile: 0.99, icon: 'diamond', color: colors.blue9 },
  { key: 'platinum', name: 'Platinum', ordinal: 6, minPercentile: 0.99, maxPercentile: 1.0, icon: 'sparkles', color: colors.primary9 },
] as const;

const byKey: Record<LeagueTierKey, LeagueTier> = LEAGUE_TIERS.reduce(
  (acc, t) => {
    acc[t.key] = t;
    return acc;
  },
  {} as Record<LeagueTierKey, LeagueTier>,
);

/** The tier whose band contains `percentile` (clamped to 0..1). */
export function resolveTier(percentile: number): LeagueTier {
  const p = Math.min(Math.max(percentile, 0), 1);
  for (const tier of LEAGUE_TIERS) {
    if (p >= tier.minPercentile && p < tier.maxPercentile) return tier;
  }
  // p === 1 lands here (platinum's max is exclusive in the loop).
  return LEAGUE_TIERS[LEAGUE_TIERS.length - 1]!;
}

export function tierByKey(key: LeagueTierKey): LeagueTier {
  return byKey[key];
}

/** The next tier up, or null when already at the top (platinum). */
export function nextTier(tier: LeagueTier): LeagueTier | null {
  return LEAGUE_TIERS.find((t) => t.ordinal === tier.ordinal + 1) ?? null;
}

/**
 * Progress (0..1) through the current tier's band toward the next one. Returns 1
 * for the top tier. Useful for the "progress to next league" bar.
 */
export function tierProgress(percentile: number): number {
  const tier = resolveTier(percentile);
  const span = tier.maxPercentile - tier.minPercentile;
  if (span <= 0) return 1;
  const p = Math.min(Math.max(percentile, tier.minPercentile), tier.maxPercentile);
  return (p - tier.minPercentile) / span;
}
