import React from 'react';
import {
  PanResponder,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

export interface HorizontalSwipeProps {
  children: React.ReactNode;
  /** Fired on a left swipe (drag right→left) — "go forward / next". */
  onSwipeLeft?: () => void;
  /** Fired on a right swipe (drag left→right) — "go back / previous". */
  onSwipeRight?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Minimum horizontal travel to trigger (px). */
  threshold?: number;
}

/**
 * Lightweight horizontal swipe wrapper built on RN's PanResponder (no extra deps).
 *
 * It only claims the gesture for clearly-horizontal drags in a direction that has
 * a handler — so vertical ScrollViews keep scrolling, and when only `onSwipeLeft`
 * is provided, right-swipes fall through to the native-stack back gesture.
 */
export function HorizontalSwipe({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
  threshold = 60,
}: HorizontalSwipeProps) {
  // Recreated when the handlers change, so the closures are never stale and we
  // never read a ref during render (keeps the react-hooks/refs rule happy).
  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => {
          const horizontal =
            Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5;

          if (!horizontal) return false;

          return g.dx < 0 ? !!onSwipeLeft : !!onSwipeRight;
        },
        onPanResponderRelease: (_e, g) => {
          if (g.dx <= -threshold) onSwipeLeft?.();
          else if (g.dx >= threshold) onSwipeRight?.();
        },
      }),
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return (
    <View style={[styles.fill, style]} {...responder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
