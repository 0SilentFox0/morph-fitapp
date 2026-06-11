import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionTitle } from '../../components/ui';
import { AnalyticsChartCard } from './Analytics/AnalyticsChartCard';
import { TransactionCard } from './Analytics/TransactionCard';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { mockTransactions, mockAnalyticsData } from '../../mocks';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'BusinessAnalytics'>;

export function BusinessAnalyticsScreen() {
  const navigation = useNavigation<Nav>();

  const chartWidth = React.useMemo(() => Dimensions.get('window').width - spacing.lg * 2 - 32, []);
  const incomeData = React.useMemo(() => mockAnalyticsData.incomeOverTime, []);
  const sourceData = React.useMemo(
    () => ({
      labels: ['Subscriptions', 'Trainings'],
      datasets: [
        {
          data: [
            mockAnalyticsData.revenueBySource.subscriptions,
            mockAnalyticsData.revenueBySource.trainings,
          ],
        },
      ],
    }),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Analytics</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.earningsRow}>
          <Card style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings/Month</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.totalEarningsPerMonth}</Text>
          </Card>
          <Card style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>From Subscriptions</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.fromSubscriptions}</Text>
          </Card>
          <Card style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>From Trainings</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.fromTrainings}</Text>
          </Card>
        </View>

        <AnalyticsChartCard
          incomeData={incomeData}
          sourceData={sourceData}
          chartWidth={chartWidth}
        />

        <View style={styles.transactionsHeader}>
          <SectionTitle style={styles.sectionTitleSpacing}>Transactions</SectionTitle>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsActions}>
          <TouchableOpacity>
            <Ionicons name="download" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="pencil" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.search}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
          />
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        </View>
        {mockTransactions.slice(0, 5).map((t) => (
          <TransactionCard key={t.id} transaction={t} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  earningsCard: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  earningsValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleSpacing: {
    marginBottom: 0,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  transactionsActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  search: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: 40,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 16,
  },
});
