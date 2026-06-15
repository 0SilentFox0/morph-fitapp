import { cycleOnSwipe } from '../../hooks/ui/useVerticalSwipeCycle';

const STATES = ['day', 'week', 'month'] as const;

describe('cycleOnSwipe', () => {
  it('advances to the next state on a downward swipe past the threshold', () => {
    expect(cycleOnSwipe(STATES, 'day', 80, 60)).toBe('week');
    expect(cycleOnSwipe(STATES, 'week', 80, 60)).toBe('month');
  });

  it('goes back on an upward swipe past the threshold', () => {
    expect(cycleOnSwipe(STATES, 'month', -80, 60)).toBe('week');
    expect(cycleOnSwipe(STATES, 'week', -80, 60)).toBe('day');
  });

  it('clamps at both ends', () => {
    expect(cycleOnSwipe(STATES, 'month', 80, 60)).toBeNull();
    expect(cycleOnSwipe(STATES, 'day', -80, 60)).toBeNull();
  });

  it('is a no-op below the threshold', () => {
    expect(cycleOnSwipe(STATES, 'day', 40, 60)).toBeNull();
    expect(cycleOnSwipe(STATES, 'week', -40, 60)).toBeNull();
  });

  it('returns null for an unknown current state', () => {
    expect(cycleOnSwipe(STATES, 'year' as never, 80, 60)).toBeNull();
  });
});
