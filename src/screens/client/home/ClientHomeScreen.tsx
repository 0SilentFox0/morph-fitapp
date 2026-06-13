import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientHomeStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { BodyMap, Avatar, SectionTitle, StatusBadge } from '../../../components/ui';
import type { StatusBadgeColor } from '../../../components/ui';
import type { SessionStatus } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainersStore } from '../../../store/trainersStore';
import { exerciseMuscleMap } from '../../../mocks';
import { computeMuscleStats, toIntensities, computeTotals } from '../../../utils/muscleStats';
import { computeWeekStreak } from '../../../utils/achievements';

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
  const history = useTrainingHistoryStore((s) => s.getCurrentUserHistory());
  const upcoming = useSessionsStore((s) => s.getUpcomingSessions());
  const trainers = useTrainersStore((s) => s.trainers);

  const tabNav = navigation.getParent() as unknown as TabNav | undefined;
  const goToTab = (tab: string) => tabNav?.navigate(tab);

  const { intensities, totals, streak } = React.useMemo(() => {
    const stats = computeMuscleStats(history, exerciseMuscleMap);
    return {
      intensities: toIntensities(stats),
      totals: computeTotals(history),
      streak: computeWeekStreak(history, new Date()),
    };
  }, [history]);

  const nextSession = upcoming[0];
  const myTrainer = trainers.find((t) => t.connection !== 'none');

  return (
    <View style={styles.container}>
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
    </View>
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
  viewMore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  viewMoreText: { fontSize: typography.sizes.sm, color: colors.accent, fontWeight: typography.weights.semibold },
});
