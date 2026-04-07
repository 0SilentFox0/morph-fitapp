import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar, ScheduleCard } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useProgramsStore } from '../../../store/programsStore';
import { useSessionsStore } from '../../../store/sessionsStore';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const userName = useAppStore((s) => s.userName);
  const points = useAppStore((s) => s.points);
  const programs = useProgramsStore((s) => s.programs);
  const sessions = useSessionsStore((s) => s.sessions);
  const [refreshing, setRefreshing] = React.useState(false);

  const upcomingSessions = React.useMemo(
    () => sessions.filter((s) => s.status !== 'canceled'),
    [sessions],
  );

  const todayCount = React.useMemo(
    () => sessions.filter((s) => s.date === 'Today').length,
    [sessions],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, spacing.md),
            paddingHorizontal: Math.max(insets.left, spacing.lg),
            paddingRight: Math.max(insets.right, spacing.lg),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileLeft}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <Avatar name={userName || 'Trainer'} size={48} />
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.userName}>{userName || 'Trainer'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <View style={styles.pointsBtn}>
            <Text style={styles.pointsText}>{points}</Text>
            <Ionicons name="sparkles" size={20} color={colors.text} />
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications" size={24} color={colors.text} />
            {todayCount > 0 && (
              <View style={styles.notifDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
        <View style={styles.cardsRow}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.8}
            onPress={() =>
              navigation.getParent()?.navigate('StatsTab', { screen: 'BusinessAnalytics' })
            }
          >
            <Card style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={styles.statCardLabel}>
                  <Ionicons name="wallet" size={16} color={colors.text} />
                  <Text style={styles.statLabel}>Revenue</Text>
                </View>
                <View style={[styles.arrowBtn, styles.arrowBtnLight]}>
                  <Ionicons name="arrow-forward" size={16} color={colors.text} />
                </View>
              </View>
              <Text style={styles.statValue}>$ 320</Text>
            </Card>
          </TouchableOpacity>
          <Card style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statCardTop}>
              <View style={styles.statCardLabel}>
                <Ionicons name="eye" size={16} color={colors.text} />
                <Text style={[styles.statLabel, styles.statLabelMuted]}>Profile view</Text>
              </View>
              <View style={styles.arrowBtn}>
                <Ionicons name="arrow-forward" size={16} color={colors.neutral7} />
              </View>
            </View>
            <Text style={styles.statValue}>123</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Training Library</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrainingLibrary')}>
              <Text style={styles.seeAllLibrary}>See all</Text>
            </TouchableOpacity>
          </View>
          {programs.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {programs.slice(0, 5).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.programCard}
                  onPress={() => navigation.navigate('TrainingLibrary')}
                  activeOpacity={0.9}
                >
                  <View style={styles.programThumb}>
                    {p.thumbnail ? (
                      <Image
                        source={{ uri: p.thumbnail }}
                        style={styles.programImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                  <View style={styles.programContent}>
                    <Text style={styles.programName}>{p.name}</Text>
                    <Text style={styles.programMeta}>{p.videoCount} videos</Text>
                    <View style={styles.programStats}>
                      <View style={styles.programStatPill}>
                        <Ionicons name="people" size={12} color={colors.text} />
                        <Text style={styles.programStatText}>{p.views}</Text>
                      </View>
                      <View style={styles.programStatPill}>
                        <Ionicons name="eye" size={12} color={colors.text} />
                        <Text style={styles.programStatText}>{p.likes}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('AddToLibraryForm')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>Add your first training program</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.scheduleTitleRow}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.scheduleBadge}>
                <Text style={styles.scheduleBadgeText}>{upcomingSessions.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingSessions.length > 0 ? (
            upcomingSessions.slice(0, 4).map((session) => (
              <ScheduleCard
                key={session.id}
                session={session}
                onPress={() => navigation.navigate('SessionForm', { session })}
                onOptionsPress={() => navigation.navigate('Schedule')}
              />
            ))
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('SessionForm', {})}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pointsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 80,
    minWidth: 62,
  },
  notifBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 80,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  greeting: {
    fontSize: typography.sizes.xs,
    color: colors.neutral7,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    height: 98,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  statLabelMuted: {
    color: colors.neutral9,
  },
  arrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.neutral7,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  arrowBtnLight: {
    borderColor: colors.neutral8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text,
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
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
  seeAllLibrary: {
    fontSize: typography.sizes.xs,
    color: colors.neutral9,
  },
  horizontalScroll: {
    gap: 12,
    paddingRight: spacing.xl,
  },
  programCard: {
    width: 152,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.neutral2,
  },
  programThumb: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral2,
  },
  programImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  programContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    gap: 5,
  },
  programName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  programMeta: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
    fontWeight: '300',
  },
  programStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  programStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.27)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 80,
  },
  programStatText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
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
