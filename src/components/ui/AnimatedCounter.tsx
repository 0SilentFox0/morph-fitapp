// src/components/ui/AnimatedCounter.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, type TextProps } from 'react-native';

import { useReduceMotion } from '../../hooks/ui/useReduceMotion';

interface AnimatedCounterProps extends TextProps {
  value: number;
  /** Formats the (rounded) interpolated number into display text. */
  format?: (n: number) => string;
  duration?: number;
}

/** Counts a number up to `value` on change. Snaps to final when reduce-motion is on. */
export function AnimatedCounter({
  value,
  format = (n) => `${n}`,
  duration = 600,
  style,
  ...rest
}: AnimatedCounterProps) {
  const reduceMotion = useReduceMotion();

  // Keep latest formatter without retriggering the animation effect.
  const formatRef = useRef(format);

  formatRef.current = format;

  const anim = useRef(new Animated.Value(reduceMotion ? value : 0)).current;

  const [display, setDisplay] = useState(() =>
    formatRef.current(reduceMotion ? value : 0)
  );

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(formatRef.current(value));

      return;
    }

    const id = anim.addListener(({ value: v }) =>
      setDisplay(formatRef.current(Math.round(v)))
    );

    const animation = Animated.timing(anim, {
      toValue: value,
      duration,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
      anim.removeListener(id);
    };
  }, [value, duration, reduceMotion, anim]);

  return (
    <Text style={style} {...rest}>
      {display}
    </Text>
  );
}
