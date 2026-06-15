import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader } from '../../../components/layout';
import { Avatar } from '../../../components/ui';
import theme from '../../../theme';
const { colors, spacing, radius, typography } = theme;
import { useGamificationStore } from '../../../store/gamificationStore';
import type { LeaderboardEntry } from '../../../services/gamificationApi';

const COMPOSITE = 'composite';

export function LeaderboardScreen() {
  const composite = useGamificationStore((s) => s.composite);
  const canonical = useGamificationStore((s) => s.canonical);
  const canonicalExercises = useGamificationStore((s) => s.canonicalExercises);
  const loading = useGamificationStore((s) => s.loading);
  const loadComposite = useGamificationStore((s) => s.loadComposite);
  const loadCanonical = useGamificationStore((s) => s.loadCanonical);
  const loadOverview = useGamificationStore((s) => s.loadOverview);

  const [tab, setTab] = useState<string>(COMPOSITE);

  useEffect(() => {
    loadComposite();
    if (canonicalExercises.length === 0) loadOverview();
  }, [loadComposite, loadOverview, canonicalExercises.length]);

  useEffect(() => {
    if (tab !== COMPOSITE && !canonical[tab]) loadCanonical(tab);
  }, [tab, canonical, loadCanonical]);

  const entries: LeaderboardEntry[] = tab === COMPOSITE ? composite : canonical[tab] ?? [];
  const unit = tab === COMPOSITE ? '' : ' kg';
  const tabs = useMemo(
    () => [{ key: COMPOSITE, name: 'Overall' }, ...canonicalExercises.map((c) => ({ key: c.key, name: c.name }))],
    [canonicalExercises],
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Leaderboards" transparent />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {entries.length === 0 ? (
          <Text style={styles.muted}>
            {loading ? 'Loading…' : 'No ranked athletes yet for this board.'}
          </Text>
        ) : (
          entries.map((e) => (
            <View key={`${e.user.id}-${e.rank}`} style={[styles.row, e.isCurrentUser && styles.rowMe]}>
              <Text style={[styles.rank, e.rank <= 3 && styles.rankTop]}>#{e.rank}</Text>
              <Avatar name={e.user.name} size={36} tint={e.isCurrentUser ? 'primary' : 'blue'} />
              <Text style={[styles.name, e.isCurrentUser && styles.nameMe]} numberOfLines={1}>
                {e.user.name}
              </Text>
              <Text style={styles.score}>
                {e.score}
                {unit}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  tabsScroll: { flexGrow: 0 },
  tabs: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.cardBg,
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: typography.weights.semibold },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  muted: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowMe: { borderColor: colors.accent, backgroundColor: colors.surfaceSubtle },
  rank: { width: 36, fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.textSecondary },
  rankTop: { color: colors.accent },
  name: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  nameMe: { fontWeight: typography.weights.bold },
  score: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.text },
});
