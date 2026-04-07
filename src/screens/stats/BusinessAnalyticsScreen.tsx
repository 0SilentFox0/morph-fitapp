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
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { mockTransactions, mockAnalyticsData } from '../../mocks';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'BusinessAnalytics'>;

const CHART_TABS = ['Income Over Time', 'By Source'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

const statusColors = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

const chartConfig = {
  backgroundColor: colors.neutral2,
  backgroundGradientFrom: colors.neutral2,
  backgroundGradientTo: colors.neutral1,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(166, 95, 98, ${opacity})`,
  labelColor: () => colors.neutral9,
  style: { borderRadius: 8 },
};

export function BusinessAnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const [chartTab, setChartTab] = React.useState(0);
  const [timeframe, setTimeframe] = React.useState(0);

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

        <Card style={styles.chartCard}>
          <View style={styles.chartTabs}>
            {CHART_TABS.map((t, i) => (
              <TouchableOpacity
                key={t}
                onPress={() => setChartTab(i)}
                style={[
                  styles.chartTab,
                  i === chartTab && styles.chartTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.chartTabText,
                    i === chartTab && styles.chartTabTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
          <View style={styles.chartContainer}>
            {chartTab === 0 ? (
              <LineChart
                data={mockAnalyticsData.incomeOverTime}
                width={Dimensions.get('window').width - spacing.lg * 2 - 32}
                height={200}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <BarChart
                data={{
                  labels: ['Subscriptions', 'Trainings'],
                  datasets: [{ data: [mockAnalyticsData.revenueBySource.subscriptions, mockAnalyticsData.revenueBySource.trainings] }],
                }}
                width={Dimensions.get('window').width - spacing.lg * 2 - 32}
                height={200}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}
          </View>
        </Card>

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
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
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
        </View>
        {mockTransactions.slice(0, 5).map((t) => (
          <Card key={t.id} style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionName}>{t.clientName}</Text>
              <Text style={styles.transactionDate}>{t.date}</Text>
              <Text style={styles.transactionType}>{t.type}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, { color: colors.Success }]}>
                {t.amount}
              </Text>
              <View style={styles.statusRow}>
                <Ionicons
                  name="cash"
                  size={16}
                  color={statusColors[t.status]}
                />
                <Text style={styles.statusText}>{t.status}</Text>
              </View>
            </View>
          </Card>
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
  chartCard: {
    marginBottom: spacing.xl,
  },
  chartTabs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chartTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  chartTabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chartTabTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeframeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeframeBtnActive: {
    backgroundColor: colors.neutral1,
    borderColor: colors.accent,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  timeframeTextActive: {
    color: colors.accent,
  },
  chartContainer: {
    marginTop: spacing.sm,
  },
  chart: {
    marginVertical: 0,
    borderRadius: 8,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
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
    borderRadius: 12,
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
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  transactionDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  transactionType: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
