import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import theme from '../../../../theme';

const { colors, radius, spacing } = theme;

import { DAY_LABELS, getBusyPercent } from './scheduleUtils';

export interface MonthCell {
  dateKey: string;
  date: number;
  empty: boolean;
}

export interface MonthGridProps {
  monthDays: MonthCell[];
  cellSize: number;
  getCount: (dateKey: string) => number;
  onSelectDate: (dateKey: string) => void;
}

/** Month calendar with per-day busyness fill, shown in the "month" view mode. */
export function MonthGrid({
  monthDays,
  cellSize,
  getCount,
  onSelectDate,
}: MonthGridProps) {
  return (
    <View style={styles.monthGrid}>
      {DAY_LABELS.map((l) => (
        <View key={l} style={[styles.monthGridHeader, { width: cellSize }]}>
          <Text style={styles.monthGridHeaderText}>{l.slice(0, 2)}</Text>
        </View>
      ))}
      {monthDays.map((cell, i) => {
        if (cell.empty) {
          return (
            <View
              key={`e-${i}`}
              style={[styles.monthCell, { width: cellSize, height: cellSize }]}
            />
          );
        }

        const pct = getBusyPercent(getCount(cell.dateKey));

        return (
          <TouchableOpacity
            key={cell.dateKey}
            style={[styles.monthCell, { width: cellSize, height: cellSize }]}
            onPress={() => onSelectDate(cell.dateKey)}
          >
            <Text style={styles.monthCellDate}>{cell.date}</Text>
            <View style={[styles.monthCellFill, { height: `${pct}%` }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: 0,
    gap: spacing.xs,
  },
  monthGridHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridHeaderText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  monthCell: {
    borderRadius: radius.sm,
    backgroundColor: colors.neutral2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  monthCellDate: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 11,
    color: colors.text,
    zIndex: 1,
  },
  monthCellFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
  },
});
