import { formatDate, formatTime } from '../../utils/date';

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
