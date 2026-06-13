// src/components/ui/PagerDots.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';

interface PagerDotsProps {
  count: number;
  activeIndex: number;
}

/** Pagination dots for a carousel. Renders nothing when there is one page or fewer. */
export function PagerDots({ count, activeIndex }: PagerDotsProps) {
  if (count <= 1) return null;
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          testID="pager-dot"
          style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { height: 6, borderRadius: radius.pill },
  dotActive: { width: 18, backgroundColor: colors.accent },
  dotInactive: { width: 6, backgroundColor: colors.neutral4 },
});
