import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientHomeStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { BodyMap, Avatar, SectionTitle, StatusBadge, HorizontalSwipe } from '../../../components/ui';
import type { StatusBadgeColor } from '../../../components/ui';
import type { SessionStatus } from '../../../mocks';
import { useClientTabSwipe } from '../useClientTabSwipe';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainersStore } from '../../../store/trainersStore';
import { exerciseMuscleMap } from '../../../mocks';
import { computeMuscleStats, toIntensities, computeTotals, filterByTimeframe } from '../../../utils/muscleStats';
import { computeWeekStreak } from '../../../utils/achievements';
import { MUSCLE_GROUPS, MUSCLE_LABELS } from '../../../constants/muscles';

type Nav = NativeStackNavigationProp<ClientHomeStackParamList, 'ClientHome'>;
type TabNav = { navigate: (name: string, params?: object) => void };

const formatKg = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)}kg`);

const STATUS_BADGE: Record<SessionStatus, { label: string; color: StatusBadgeColor }> = {
  completed: { label: 'Completed', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  canceled: { label: 'Canceled', color: 'error' },
};

export function ClientHomeScreen() {
  const navigation = useNavigation<Nav>();
  const userName = useAppStore((s) => s.userName);
  // Select stable method refs and the raw state they depend on; calling a getter
  // *inside* the selector returns a fresh array each render → infinite loop.
  const getCurrentUserHistory = useTrainingHistoryStore((s) => s.getCurrentUserHistory);
  useTrainingHistoryStore((s) => s.history);
  const getUpcomingSessions = useSessionsStore((s) => s.getUpcomingSessions);
  useSessionsStore((s) => s.sessions);
  const trainers = useTrainersStore((s) => s.trainers);
  const history = getCurrentUserHistory();
  const upcoming = getUpcomingSessions();

  const tabNav = navigation.getParent() as unknown as TabNav | undefined;
  const goToTab = (tab: string) => tabNav?.navigate(tab);
  const tabSwipe = useClientTabSwipe('ClientHomeTab');

  const { intensities, totals, weekTotals, streak, topMuscle } = React.useMemo(() => {
    const now = new Date();
    const stats = computeMuscleStats(history, exerciseMuscleMap);
    const top = MUSCLE_GROUPS.filter((g) => stats[g].exerciseCount > 0).sort(
      (a, b) => stats[b].totalWeight - stats[a].totalWeight,
    )[0];
    return {
      intensities: toIntensities(stats),
      totals: computeTotals(history),
      weekTotals: computeTotals(filterByTimeframe(history, 'week', now)),
      streak: computeWeekStreak(history, now),
      topMuscle: top ? MUSCLE_LABELS[top] : null,
    };
  }, [history]);

  const nextSession = upcoming[0];
  const myTrainer = trainers.find((t) => t.connection !== 'none');

  return (
    <HorizontalSwipe
      style={styles.container}
      onSwipeLeft={tabSwipe.onSwipeLeft}
      onSwipeRight={tabSwipe.onSwipeRight}
    >
      <ScreenHeader
        title={userName ? `Hi, ${userName}` : 'Hi there'}
        showBack={false}
        transparent
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('ClientProfile')}>
            <Avatar name={userName ?? 'You'} size={32} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Next session */}
        <SectionTitle>Next session</SectionTitle>
        {nextSession ? (
          <View style={styles.card}>
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{nextSession.title}</Text>
              <Text style={styles.cardSub}>
                {nextSession.date} · {nextSession.time}
              </Text>
            </View>
            <StatusBadge
              label={STATUS_BADGE[nextSession.status].label}
              color={STATUS_BADGE[nextSession.status].color}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.ctaCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BookSession')}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
            <Text style={styles.ctaText}>Book your next session</Text>
          </TouchableOpacity>
        )}

        {/* This week */}
        <SectionTitle>This week</SectionTitle>
        <View style={styles.weekRow}>
          <WeekTile value={`${weekTotals.sessionCount}`} label="Sessions" />
          <WeekTile value={formatKg(weekTotals.tonnage)} label="Volume" />
          <WeekTile value={`${streak}`} label="Streak" />
          <WeekTile value={topMuscle ?? '—'} label="Top muscle" />
        </View>

        {/* My trainer */}
        <SectionTitle>Your trainer</SectionTitle>
        {myTrainer ? (
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => goToTab('ChatTab')}>
            <Avatar name={myTrainer.name} uri={myTrainer.avatar} size={44} />
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{myTrainer.name}</Text>
              <Text style={styles.cardSub}>{myTrainer.headline}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctaCard} activeOpacity={0.8} onPress={() => goToTab('TrainersTab')}>
            <Ionicons name="search-outline" size={22} color={colors.accent} />
            <Text style={styles.ctaText}>Find a trainer</Text>
          </TouchableOpacity>
        )}

        {/* Progress snapshot */}
        <SectionTitle>Your progress</SectionTitle>
        <TouchableOpacity style={styles.progressCard} activeOpacity={0.9} onPress={() => goToTab('ProgressTab')}>
          <View style={styles.miniMap}>
            <BodyMap intensities={intensities} view="front" scale={0.6} />
          </View>
          <View style={styles.progressStats}>
            <Stat value={formatKg(totals.tonnage)} label="Total volume" />
            <Stat value={`${totals.sessionCount}`} label="Sessions" />
            <Stat value={`${streak}`} label="Week streak" />
            <View style={styles.viewMore}>
              <Text style={styles.viewMoreText}>View details</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </HorizontalSwipe>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WeekTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.weekTile}>
      <Text style={styles.weekValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.weekLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardMain: { flex: 1, gap: 2 },
  cardTitle: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  cardSub: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral4,
    borderStyle: 'dashed',
  },
  ctaText: { fontSize: typography.sizes.base, color: colors.text },
  progressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  miniMap: { width: 110, alignItems: 'center', justifyContent: 'center' },
  progressStats: { flex: 1, gap: spacing.sm },
  stat: { gap: 0 },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  weekRow: { flexDirection: 'row', gap: spacing.xs },
  weekTile: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  weekValue: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  weekLabel: { fontSize: 10, color: colors.textSecondary },
  viewMore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  viewMoreText: { fontSize: typography.sizes.sm, color: colors.accent, fontWeight: typography.weights.semibold },
});
