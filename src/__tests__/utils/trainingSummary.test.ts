import {
  topSet,
  totalDurationLabel,
} from '../../utils/training/trainingSummary';

describe('topSet', () => {
  it('returns the heaviest set', () => {
    expect(
      topSet([
        { weight: 40, reps: 10 },
        { weight: 60, reps: 5 },
        { weight: 50, reps: 8 },
      ])
    ).toEqual({ weight: 60, reps: 5 });
  });

  it('returns undefined for an empty list', () => {
    expect(topSet([])).toBeUndefined();
  });
});

describe('totalDurationLabel', () => {
  it('sums minutes parsed from each exercise durationLabel', () => {
    expect(
      totalDurationLabel([
        { id: 1, name: 'A', sets: [], durationLabel: '20m' },
        { id: 2, name: 'B', sets: [], durationLabel: '10 min' },
      ] as never)
    ).toBe('30m');
  });

  it('returns an em dash when no durations are present', () => {
    expect(totalDurationLabel([{ id: 1, name: 'A', sets: [] }] as never)).toBe(
      '—'
    );
  });
});
