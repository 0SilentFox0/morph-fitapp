import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { mockTransactions } from '../../mocks';

const FILTERS = ['All', 'Earnings', 'Subscriptions'];

const statusColors = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

export function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = React.useState(0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Transactions"
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="download" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="pencil" size={24} color={colors.text} />
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockTransactions.map((t) => (
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
    borderRadius: 20,
    backgroundColor: colors.Secondary2,
  },
  filterBtnActive: {
    backgroundColor: colors.Secondary1,
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
    position: 'relative',
  },
  search: {
    backgroundColor: colors.Secondary2,
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
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
