import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import theme from '../../theme';

const { colors, radius, typography } = theme;

export interface SegmentOption {
  label: string;
  /** Text colour when this segment is active (defaults to the primary text colour). */
  activeColor?: string;
}

export interface SegmentedProps {
  options: SegmentOption[];
  value: number;
  onChange: (index: number) => void;
}

/** Pill-style single-select segmented control. */
export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={styles.segmented}>
      {options.map((o, i) => {
        const active = i === value;

        return (
          <TouchableOpacity
            key={o.label}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(i)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                active && {
                  color: o.activeColor ?? colors.text,
                  fontWeight: typography.weights.semibold,
                },
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.neutral3,
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
