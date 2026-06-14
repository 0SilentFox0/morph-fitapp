import {
  formatDate,
  formatTime,
  formatShortDate,
  formatRelativeTime,
  DAY_MS,
} from '../../utils/date';

describe('formatDate', () => {
  it('formats a valid date as "Mon D, YYYY"', () => {
    expect(formatDate('2026-01-15T10:30:00Z')).toBe('Jan 15, 2026');
  });

  it('returns empty string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatTime', () => {
  it('formats midnight as 12:00am', () => {
    const d = new Date(2026, 0, 1, 0, 0);
    expect(formatTime(d)).toBe('12:00am');
  });

  it('formats noon as 12:00pm', () => {
    const d = new Date(2026, 0, 1, 12, 0);
    expect(formatTime(d)).toBe('12:00pm');
  });

  it('pads minutes and uses 12-hour clock', () => {
    const d = new Date(2026, 0, 1, 13, 5);
    expect(formatTime(d)).toBe('1:05pm');
  });

  it('returns empty string for an invalid date', () => {
    expect(formatTime('nope')).toBe('');
  });
});

describe('formatShortDate', () => {
  it('formats as "Mon D"', () => {
    expect(formatShortDate('2026-01-05T10:00:00Z')).toBe('Jan 5');
  });

  it('returns empty string for an invalid date', () => {
    expect(formatShortDate('nope')).toBe('');
  });
});

describe('DAY_MS', () => {
  it('equals one day in milliseconds', () => {
    expect(DAY_MS).toBe(86_400_000);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date(2026, 0, 10, 12, 0); // Sat Jan 10 2026, noon

  it('shows clock time for timestamps within the last day', () => {
    const earlier = new Date(2026, 0, 10, 9, 30);
    expect(formatRelativeTime(earlier, now)).toBe(
      earlier.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );
  });

  it('shows the weekday within the last week', () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * DAY_MS);
    expect(formatRelativeTime(threeDaysAgo, now)).toBe(
      threeDaysAgo.toLocaleDateString([], { weekday: 'short' }),
    );
  });

  it('shows a short month/day for older timestamps', () => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);
    expect(formatRelativeTime(twoWeeksAgo, now)).toBe(
      twoWeeksAgo.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    );
  });

  it('returns empty string for an invalid date', () => {
    expect(formatRelativeTime('nope', now)).toBe('');
  });
});
