import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Card, Tag, Avatar, ScheduleCard } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { mockSessions, mockTrainingPrograms } from '../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const userName = useAppStore((state) => state.userName);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileLeft}
        >
          <Avatar name="Sarah Johnson" size={48} />
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.userName}>{userName || 'Sarah Johnson'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.pointsBtn}>
            <Text style={styles.pointsText}>20</Text>
            <Ionicons name="sparkles" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statCardTop}>
              <View style={styles.statCardLabel}>
                <Ionicons name="wallet" size={16} color={colors.text} />
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnLight]}>
                <Ionicons name="arrow-forward" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.statValue}>$ 320</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statCardTop}>
              <View style={styles.statCardLabel}>
                <Ionicons name="eye" size={16} color={colors.text} />
                <Text style={[styles.statLabel, styles.statLabelMuted]}>Profile view</Text>
              </View>
              <TouchableOpacity style={styles.arrowBtn}>
                <Ionicons name="arrow-forward" size={16} color={colors.neutral7} />
              </TouchableOpacity>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {mockTrainingPrograms.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.programCard}
                onPress={() => navigation.navigate('TrainingLibrary')}
                activeOpacity={0.9}
              >
                <View style={styles.programThumb}>
                  {p.thumbnail ? (
                    <Image source={{ uri: p.thumbnail }} style={styles.programImage} resizeMode="cover" />
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.scheduleTitleRow}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.scheduleBadge}>
                <Text style={styles.scheduleBadgeText}>{mockSessions.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {mockSessions.map((session) => (
            <ScheduleCard
              key={session.id}
              session={session}
              onPress={() => navigation.navigate('Schedule')}
              onOptionsPress={() => {}}
            />
          ))}
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
    flex: 1,
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
    backgroundColor: colors.Secondary2,
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
    color: colors.Accent1,
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
    backgroundColor: colors.Secondary2,
  },
  programThumb: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.Secondary2,
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
});
