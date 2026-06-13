import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { SearchInput } from '../../components/ui';
import { AnalyticsChartCard } from './Analytics/AnalyticsChartCard';
import { TransactionCard } from './Analytics/TransactionCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { exportTransactions } from '../../utils';
import { mockTransactions, mockAnalyticsData } from '../../mocks';
import { useGamificationStore } from '../../store/gamificationStore';
import { LEAGUE_TIERS } from '../../utils/leagues';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'BusinessAnalytics'>;

const ICON_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export function BusinessAnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = React.useState('');
  const trainerOverview = useGamificationStore((s) => s.trainerOverview);
  const loadTrainer = useGamificationStore((s) => s.loadTrainer);
  React.useEffect(() => {
    loadTrainer();
  }, [loadTrainer]);
  const leagueTier = trainerOverview
    ? LEAGUE_TIERS.find((t) => t.key === trainerOverview.league.key)
    : null;

  const chartWidth = React.useMemo(() => Dimensions.get('window').width - spacing.lg * 2 - 20, []);
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

  const preview = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? mockTransactions.filter((t) => t.clientName.toLowerCase().includes(q))
      : mockTransactions;
    return list.slice(0, 5);
  }, [search]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Business Analytics" transparent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.earningsRow}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Month</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.totalEarningsPerMonth}</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Subscriptions</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.fromSubscriptions}</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Trainings</Text>
            <Text style={styles.earningsValue}>${mockAnalyticsData.fromTrainings}</Text>
          </View>
        </View>

        {leagueTier && trainerOverview && (
          <TouchableOpacity
            style={styles.leagueBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TrainerLeague')}
          >
            <View style={[styles.leagueIcon, { borderColor: leagueTier.color }]}>
              <Ionicons name={leagueTier.icon} size={22} color={leagueTier.color} />
            </View>
            <View style={styles.leagueText}>
              <Text style={styles.leagueName}>{leagueTier.name} league</Text>
              <Text style={styles.leagueSub}>
                Top {Math.max(1, Math.round((1 - trainerOverview.percentile) * 100))}% · rank #
                {trainerOverview.rank}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </TouchableOpacity>
        )}

        <AnalyticsChartCard
          incomeData={incomeData}
          sourceData={sourceData}
          chartWidth={chartWidth}
        />

        <View style={styles.transactionsCard}>
          <View style={styles.transactionsTop}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Transactions</Text>
              <View style={styles.transactionsActions}>
                <TouchableOpacity
                  hitSlop={ICON_HIT_SLOP}
                  onPress={() => navigation.navigate('Transactions')}
                >
                  <Ionicons name="filter" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={ICON_HIT_SLOP}
                  onPress={() => navigation.navigate('AddTransaction')}
                >
                  <Ionicons name="pencil" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={ICON_HIT_SLOP}
                  onPress={() => exportTransactions(mockTransactions)}
                >
                  <Ionicons name="download" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={ICON_HIT_SLOP}
                  onPress={() => navigation.navigate('Transactions')}
                >
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
            </View>
            <SearchInput value={search} onChangeText={setSearch} />
          </View>

          <View style={styles.transactionsList}>
            {preview.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  leagueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral2,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  leagueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral1,
  },
  leagueText: { flex: 1 },
  leagueName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  leagueSub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  earningsCard: {
    flex: 1,
    minHeight: 85,
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.neutral2,
  },
  earningsLabel: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
    color: colors.primary9,
  },
  earningsValue: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    fontWeight: typography.weights.heavy,
    color: colors.text,
  },
  transactionsCard: {
    backgroundColor: colors.neutral1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 18,
    gap: spacing.md,
  },
  transactionsTop: {
    gap: spacing.sm,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionsTitle: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.neutral9,
  },
  transactionsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  seeAll: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  transactionsList: {
    gap: spacing.sm,
  },
});
