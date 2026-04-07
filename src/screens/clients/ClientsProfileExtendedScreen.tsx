import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader } from '../../components/layout';
import { Card, Tag, Avatar } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export function ClientsProfileExtendedScreen() {

  return (
    <View style={styles.container}>
      <ScreenHeader title="Client's Profile" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar name="Brooklyn Simmons" size={80} />
          <Text style={styles.clientName}>Brooklyn Simmons</Text>
          <Text style={styles.status}>Personal Group</Text>
        </View>

        <Text style={styles.sectionTitle}>Next training</Text>
        <Card style={styles.nextCard}>
          <Text style={styles.nextTitle}>Personal Session</Text>
          <Text style={styles.nextDate}>Dec 21</Text>
          <View style={styles.completedRow}>
            <Text style={styles.completedText}>Today 10:00</Text>
            <Tag label="Completed" variant="accent" />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Target Fitness</Text>
        <View style={styles.tagsRow}>
          <Tag label="Fat loss" variant="accent" />
          <Tag label="Endurance" variant="accent" />
        </View>

        <Text style={styles.sectionTitle}>Level and Interests</Text>
        <View style={styles.tagsRow}>
          <Tag label="Intermediate" variant="accent" />
          <Tag label="HIT" variant="accent" />
          <Tag label="Cardio" variant="accent" />
        </View>

        <Text style={styles.sectionTitle}>Training History</Text>
        <Card style={styles.historyCard}>
          <View style={styles.historyThumb} />
          <View style={styles.historyInfo}>
            <Text style={styles.historyName}>Name</Text>
            <Text style={styles.historyType}>HIT</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  clientName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  status: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  nextCard: {
    marginBottom: spacing.lg,
  },
  nextTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  nextDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.neutral1,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  historyType: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
