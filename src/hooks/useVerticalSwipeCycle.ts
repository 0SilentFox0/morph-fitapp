import { useMemo } from 'react';
import { PanResponder } from 'react-native';

const DEFAULT_THRESHOLD = 60;
const MOVE_ACTIVATION = 20;

/**
 * Pure decision for a vertical-swipe cycle: a downward swipe past `threshold`
 * advances to the next state, an upward swipe goes back, both clamped at the
 * ends. Returns the next state, or null when the gesture is a no-op.
 */
export function cycleOnSwipe<T>(
  states: readonly T[],
  current: T,
  dy: number,
  threshold: number,
): T | null {
  const i = states.indexOf(current);
  if (i < 0) return null;
  if (dy > threshold && i < states.length - 1) return states[i + 1]!;
  if (dy < -threshold && i > 0) return states[i - 1]!;
  return null;
}

/**
 * PanResponder that cycles `current` through `states` on vertical swipes
 * (down → next, up → previous, clamped). Spread the returned handlers onto a View.
 */
export function useVerticalSwipeCycle<T>(
  states: readonly T[],
  current: T,
  onChange: (next: T) => void,
  threshold = DEFAULT_THRESHOLD,
) {
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > MOVE_ACTIVATION,
        onPanResponderRelease: (_, g) => {
          const next = cycleOnSwipe(states, current, g.dy, threshold);
          if (next !== null) onChange(next);
        },
      }),
    [states, current, onChange, threshold],
  );
  return responder.panHandlers;
}
