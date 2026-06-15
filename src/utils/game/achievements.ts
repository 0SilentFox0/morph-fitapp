import type { CompletedTraining } from '../../types';
import { computeTotals } from '../progress/muscleStats';

/** Local YYYY-MM-DD key for a parseable training date, or null. */
function dayKey(date: string): string | null {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return null;

  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Set of day keys that have at least one logged training. */
export function activeDayKeys(history: CompletedTraining[]): Set<string> {
  const keys = new Set<string>();

  for (const t of history) {
    const k = dayKey(t.date);

    if (k) keys.add(k);
  }

  return keys;
}

function weekStart(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  copy.setDate(copy.getDate() - copy.getDay()); // back to Sunday

  return copy;
}

/**
 * Consecutive weeks (ending with the week containing `now`) that have at least
 * one training. A gap week breaks the streak. Returns 0 when the current week
 * has no session.
 */
export function computeWeekStreak(
  history: CompletedTraining[],
  now: Date
): number {
  const weekKeys = new Set<string>();

  for (const t of history) {
    const d = new Date(t.date);

    if (Number.isNaN(d.getTime())) continue;

    const ws = weekStart(d);

    weekKeys.add(`${ws.getFullYear()}-${ws.getMonth()}-${ws.getDate()}`);
  }

  let streak = 0;

  const cursor = weekStart(now);

  // Walk backwards week by week while each week has a session.
  for (;;) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

    if (!weekKeys.has(key)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
}

/**
 * Derives the badge set from training totals, weekly streak and accumulated
 * points. Pure: pass `now` and `points` in.
 */
export function computeBadges(
  history: CompletedTraining[],
  points: number,
  now: Date
): Badge[] {
  const totals = computeTotals(history);

  const streak = computeWeekStreak(history, now);

  return [
    {
      id: 'first-session',
      label: 'First steps',
      description: 'Complete your first session',
      icon: 'footsteps-outline',
      earned: totals.sessionCount >= 1,
    },
    {
      id: 'ten-sessions',
      label: 'Committed',
      description: 'Log 10 training sessions',
      icon: 'calendar-outline',
      earned: totals.sessionCount >= 10,
    },
    {
      id: 'streak-2',
      label: 'Consistent',
      description: 'Train 2 weeks in a row',
      icon: 'flame-outline',
      earned: streak >= 2,
    },
    {
      id: 'heavy-lifter',
      label: 'Heavy lifter',
      description: 'Move 10,000 kg of total volume',
      icon: 'barbell-outline',
      earned: totals.tonnage >= 10000,
    },
    {
      id: 'point-collector',
      label: 'Point collector',
      description: 'Earn 100 points',
      icon: 'star-outline',
      earned: points >= 100,
    },
  ];
}
