import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;

export interface SummaryRow {
  id: number;
  name: string;
  weight: string;
  sets: number;
  reps: number;
}

/** Name / Weight / Sets / Reps table for the training summary. */
export function ExercisesTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Weight</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Sets</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Reps</Text>
      </View>
      {rows.map((r, i) => (
        <View key={r.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowHighlight]}>
          <Text style={styles.tableCell}>{r.name}</Text>
          <Text style={styles.tableCell}>{r.weight}</Text>
          <Text style={styles.tableCell}>{r.sets}</Text>
          <Text style={styles.tableCell}>{r.reps}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  tableRowHighlight: {
    backgroundColor: colors.primary2,
  },
  tableCell: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  tableHeader: {
    fontWeight: typography.weights.semibold,
  },
});
