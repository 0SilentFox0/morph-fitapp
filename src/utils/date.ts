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
