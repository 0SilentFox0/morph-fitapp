const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Milliseconds in one day. */
export const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function toDate(d: Date | string): Date {
  return typeof d === 'string' ? new Date(d) : d;
}

export function formatDate(d: Date | string): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatTime(d: Date | string): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return '';
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'pm' : 'am';
  const h = date.getHours() % 12 || 12;
  return `${h}:${m}${ampm}`;
}

/** Short "Mon 5" style label, e.g. "Jan 5". */
export function formatShortDate(d: Date | string): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Compact "M/D" axis label for charts. Unparseable input is returned as-is, so
 * values that are already short labels (e.g. "Dec 6") pass through untouched.
 */
export function numericDate(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? date : `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Chat-style relative timestamp: clock time today, weekday within the last
 * week, otherwise a short month/day. `now` is injectable for tests.
 */
export function formatRelativeTime(d: Date | string, now: Date = new Date()): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return '';
  const diff = now.getTime() - date.getTime();
  if (diff < DAY_MS) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < WEEK_MS) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
