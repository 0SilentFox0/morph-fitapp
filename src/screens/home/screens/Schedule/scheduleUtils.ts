export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_AHEAD = 90;

/** Assumed full-day training capacity; drives the month-view heatmap saturation. */
const MAX_TRAININGS_PER_DAY = 8;

export type ScheduleViewMode = 'day' | 'week' | 'month';

export interface ScheduleDay {
  label: string;
  date: string;
  dateKey: string;
  /** Local calendar year/month — used for month logic (timezone-safe, unlike parsing dateKey). */
  year: number;
  month: number;
}

/** Builds a flat list of the next DAYS_AHEAD days starting today. */
export function buildDaysFromToday(): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: DAY_LABELS[d.getDay()] ?? '',
      date: String(d.getDate()),
      dateKey: d.toISOString().slice(0, 10),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return days;
}

/** Fraction (0-100) of a day's training capacity used by `sessionCount`. */
export function getBusyPercent(sessionCount: number): number {
  return Math.min(100, (sessionCount / MAX_TRAININGS_PER_DAY) * 100);
}
