// src/components/ui/FadeInUp.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, type ViewProps } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface FadeInUpProps extends ViewProps {
  /** Stagger delay (ms) before this element animates in. */
  delay?: number;
  children: React.ReactNode;
}

/** Fades + slides its children up on mount. No-op when reduce-motion is on. */
export function FadeInUp({ delay = 0, children, style, ...rest }: FadeInUpProps) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, progress, reduceMotion]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}
