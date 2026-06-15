import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScheduleCard, SectionTitle } from '../../../components/ui';
import type { HomeStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { HomeHeader } from './Home/HomeHeader';
import { StatCardsRow } from './Home/StatCardsRow';
import { TrainingProgramsRow } from './Home/TrainingProgramsRow';

const { colors, typography, spacing } = theme;

import { useActiveTrainingStore } from '../../../store/activeTrainingStore';
import { useAppStore } from '../../../store/appStore';
import { useProgramsStore } from '../../../store/programsStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import type { Session } from '../../../types';
import { deriveGroupFromSession } from '../../../utils';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const userName = useAppStore((s) => s.userName);

  const points = useAppStore((s) => s.points);

  const programs = useProgramsStore((s) => s.programs);

  const sessions = useSessionsStore((s) => s.sessions);

  const [refreshing, setRefreshing] = React.useState(false);

  const refreshTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(
    () => () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    },
    []
  );

  const upcomingSessions = React.useMemo(
    () => sessions.filter((s) => s.status !== 'canceled'),
    [sessions]
  );

  const todayCount = React.useMemo(
    () => sessions.filter((s) => s.date === 'Today').length,
    [sessions]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 800);
  };

  const handleSessionPress = React.useCallback(
    (session: Session) => navigation.navigate('SessionForm', { session }),
    [navigation]
  );

  const handleSessionOptions = React.useCallback(
    (_session: Session) => navigation.navigate('Schedule'),
    [navigation]
  );

  const startTraining = useActiveTrainingStore((s) => s.startTraining);

  const handleSessionStart = React.useCallback(
    (session: Session) => {
      const group = deriveGroupFromSession(
        session,
        programs,
        useTrainingHistoryStore.getState().getLastSets
      );

      if (group.length === 0) return;

      startTraining(group, group[0]!.participantId);
      navigation.getParent()?.navigate('ClientsTab', {
        screen: 'ClientProfile',
        params: { clientId: group[0]!.participantId },
      });
    },
    [navigation, programs, startTraining]
  );

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={userName}
        points={points}
        showNotifDot={todayCount > 0}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <StatCardsRow
          onRevenuePress={() =>
            navigation
              .getParent()
              ?.navigate('StatsTab', { screen: 'BusinessAnalytics' })
          }
        />

        <TrainingProgramsRow
          programs={programs}
          onProgramPress={() => navigation.navigate('TrainingLibrary')}
          onSeeAll={() => navigation.navigate('TrainingLibrary')}
          onEmptyPress={() => navigation.navigate('AddToLibraryForm')}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.scheduleTitleRow}>
              <SectionTitle style={styles.sectionTitleSpacing}>
                Schedule
              </SectionTitle>
              <View style={styles.scheduleBadge}>
                <Text style={styles.scheduleBadgeText}>
                  {upcomingSessions.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingSessions.length > 0 ? (
            upcomingSessions
              .slice(0, 4)
              .map((session) => (
                <ScheduleCard
                  key={session.id}
                  session={session}
                  onPress={handleSessionPress}
                  onOptionsPress={handleSessionOptions}
                  onStart={handleSessionStart}
                />
              ))
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('SessionForm', {})}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No upcoming sessions</Text>
              <Text style={styles.emptyHint}>Tap to create one</Text>
            </TouchableOpacity>
          )}
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
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleSpacing: {
    marginBottom: 0,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleBadge: {
    backgroundColor: colors.neutral2,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  emptyCard: {
    backgroundColor: colors.neutral2,
    borderRadius: 14,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  emptyHint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
