import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const TABS = ['Summary', 'Exercises'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

export function TrainingSummaryScreen() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [timeframe, setTimeframe] = React.useState(0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Training Summary"
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="pencil" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>53m</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>HIT</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Training progress</Text>
        <View style={styles.timeframeRow}>
          {TIMEFRAME.map((t, i) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeframe(i)}
              style={[
                styles.timeframeBtn,
                i === timeframe && styles.timeframeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.timeframeText,
                  i === timeframe && styles.timeframeTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartPlaceholder} />

        <Text style={styles.sectionTitle}>Exercises</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Weight</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Sets</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Reps</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowHighlight]}>
            <Text style={styles.tableCell}>Bench press</Text>
            <Text style={styles.tableCell}>80kg</Text>
            <Text style={styles.tableCell}>7</Text>
            <Text style={styles.tableCell}>35</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trainer Notes</Text>
        <Card style={styles.notesCard}>
          <Text style={styles.notesText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, i === activeTab && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                i === activeTab && styles.tabTextActive,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeframeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.neutral2,
  },
  timeframeBtnActive: {
    backgroundColor: colors.accent,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  table: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
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
  notesCard: {
    marginBottom: spacing.lg,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
});
