import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { StatsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { SearchInput } from '../../components/ui';
import { TransactionCard } from './Analytics/TransactionCard';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { exportTransactions, searchItems } from '../../utils';
import { mockTransactions } from '../../mocks';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'Transactions'>;

const FILTERS = ['All', 'Earnings', 'Subscriptions'] as const;

export function TransactionsScreen() {
  const navigation = useNavigation<Nav>();
  const [activeFilter, setActiveFilter] = React.useState(0);
  const [search, setSearch] = React.useState('');

  const transactions = React.useMemo(() => {
    const byFilter = mockTransactions.filter((t) => {
      if (activeFilter === 1) return t.type === 'Training';
      if (activeFilter === 2) return t.type === 'Subscription';
      return true;
    });
    return searchItems(search, byFilter, (t) => [t.clientName]);
  }, [activeFilter, search]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Transactions"
        transparent
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('AddTransaction')}>
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
            style={[styles.filterBtn, i === activeFilter && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, i === activeFilter && styles.filterTextActive]}>
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
