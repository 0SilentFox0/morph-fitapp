import { numericDate } from '../../utils/format/date';
import { formatKg } from '../../utils/format/format';

describe('numericDate', () => {
  it('formats a parseable date as M/D (local)', () => {
    const d = new Date(2026, 5, 15, 12, 0, 0); // local June 15

    expect(numericDate(d.toISOString())).toBe('6/15');
  });

  it('returns the input unchanged when it is not a parseable date', () => {
    expect(numericDate('W1')).toBe('W1');
    expect(numericDate('Mon')).toBe('Mon');
  });
});

describe('formatKg', () => {
  it('rounds values under 1000 and suffixes kg', () => {
    expect(formatKg(999.4)).toBe('999kg');
    expect(formatKg(0)).toBe('0kg');
  });

  it('renders tonnes with one decimal at/above 1000', () => {
    expect(formatKg(1000)).toBe('1.0t');
    expect(formatKg(1500)).toBe('1.5t');
  });
});
