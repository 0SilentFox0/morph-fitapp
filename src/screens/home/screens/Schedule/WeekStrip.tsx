import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import theme from '../../../../theme';

const { colors, radius, spacing } = theme;

import type { ScheduleDay } from './scheduleUtils';

export interface WeekStripProps {
  weekDays: ScheduleDay[];
  /** Absolute index of the first day in `weekDays` within the full day list. */
  baseIndex: number;
  onSelect: (absoluteIndex: number) => void;
  getCount: (dateKey: string) => number;
  cellWidth: number;
}

/** Horizontal week selector shown in the schedule's "week" view mode. */
export function WeekStrip({
  weekDays,
  baseIndex,
  onSelect,
  getCount,
  cellWidth,
}: WeekStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weekRow}
    >
      {weekDays.map((day, i) => {
        const selected = baseIndex + i === baseIndex;

        return (
          <TouchableOpacity
            key={day.dateKey}
            onPress={() => onSelect(baseIndex + i)}
            style={[styles.weekDayCell, { width: cellWidth }]}
          >
            <Text style={styles.weekDayLabel}>{day.label}</Text>
            <Text
              style={[styles.weekDayDate, selected && styles.dayDateSelected]}
            >
              {day.date}
            </Text>
            <Text style={styles.weekDayCount}>{getCount(day.dateKey)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: 0,
  },
  weekDayCell: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  weekDayDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dayDateSelected: {
    color: colors.text,
  },
  weekDayCount: {
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.xs,
  },
});
