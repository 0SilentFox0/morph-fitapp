import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/layout';
import { SearchInput } from '../../components/ui';
import type { StatsStackParamList } from '../../navigation/types';
import theme from '../../theme';
import { TransactionCard } from './Analytics/TransactionCard';

const { colors, radius, typography, spacing } = theme;

import { loadTransactions } from '../../services/analyticsService';
import type { Transaction } from '../../types';
import { exportTransactions, searchItems } from '../../utils';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'Transactions'>;

const FILTERS = ['All', 'Earnings', 'Subscriptions'] as const;

export function TransactionsScreen() {
  const navigation = useNavigation<Nav>();

  const [activeFilter, setActiveFilter] = React.useState(0);

  const [search, setSearch] = React.useState('');

  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>(
    []
  );

  // Reload on focus so a newly-added transaction shows without a manual refresh.
  const reload = React.useCallback(() => {
    let active = true;

    loadTransactions()
      .then((tx) => {
        if (active) setAllTransactions(tx);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(
    () => navigation.addListener('focus', reload),
    [navigation, reload]
  );

  React.useEffect(() => reload(), [reload]);

  const transactions = React.useMemo(() => {
    const byFilter = allTransactions.filter((t) => {
      if (activeFilter === 1) return t.type === 'Training';

      if (activeFilter === 2) return t.type === 'Subscription';

      return true;
    });

    return searchItems(search, byFilter, (t) => [t.clientName]);
  }, [allTransactions, activeFilter, search]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Transactions"
        transparent
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <Ionicons name="pencil" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => exportTransactions(transactions)}>
              <Ionicons name="download" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.filtersRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(i)}
            style={[
              styles.filterBtn,
              i === activeFilter && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                i === activeFilter && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchWrapper}>
        <SearchInput value={search} onChangeText={setSearch} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {transactions.map((t) => (
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
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral3,
  },
  filterBtnActive: {
    borderColor: colors.neutral8,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.sm,
  },
});
