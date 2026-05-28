import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

const DAY_CELL_WIDTH = 48;
const DAY_CELL_HEIGHT = 56;

export interface Day {
  label: string;
  date: string;
  dateKey: string;
}

export interface DayStripProps {
  days: Day[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DayStrip({ days, selectedIndex, onSelect }: DayStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {days.map((day, i) => {
        const selected = i === selectedIndex;
        return (
          <TouchableOpacity
            key={day.dateKey}
            onPress={() => onSelect(i)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {day.label}
            </Text>
            <Text style={[styles.date, selected && styles.dateSelected]}>
              {day.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral2,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.text,
  },
  date: {
    fontSize: typography.sizes.base,
    color: colors.text,
    marginTop: 2,
  },
  dateSelected: {
    fontWeight: typography.weights.semibold,
  },
});
