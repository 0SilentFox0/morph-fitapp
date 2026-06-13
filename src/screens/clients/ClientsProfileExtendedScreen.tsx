import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Avatar, SectionTitle } from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { mockClients, mockTrainingPrograms } from '../../mocks';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Route = RouteProp<ClientsStackParamList, 'ClientsProfileExtended'>;

const HISTORY = [
  { id: 'h1', name: 'Name', type: 'HIIT', clients: 24, views: 340, duration: '50m', image: mockTrainingPrograms[0]?.thumbnail },
  { id: 'h2', name: 'Name', type: 'Cardio', clients: 24, views: 340, duration: '50m', image: mockTrainingPrograms[3]?.thumbnail },
];

export function ClientsProfileExtendedScreen() {
  const route = useRoute<Route>();
  const clientId = route.params?.clientId;
  const fromTraining = useActiveTrainingStore((s) => s.clients.find((c) => c.clientId === clientId));
  const name =
    fromTraining?.name ?? mockClients.find((c) => c.id === clientId)?.name ?? 'Brooklyn Simmons';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Client's Profile"
        rightElement={
          <TouchableOpacity>
            <Ionicons name="pencil" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar uri={fromTraining?.avatar} name={name} size={96} />
          <Text style={styles.clientName}>{name}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>•</Text>
            <Text style={styles.status}>Personal</Text>
            <Text style={styles.statusDot}>•</Text>
            <Text style={styles.status}>Group</Text>
          </View>
        </View>

        <LinearGradient
          colors={[colors.neutral2, colors.neutral2, 'rgba(140,30,3,0.35)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nextCard}
        >
          <View style={styles.nextHeader}>
            <Text style={styles.nextLabel}>Next training</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <Text style={styles.nextTitle}>Personal Session</Text>
          <View style={styles.hiitTag}>
            <Text style={styles.hiitTagText}>HIIT</Text>
          </View>
          <View style={styles.nextFooter}>
            <View style={styles.dateChip}>
              <Ionicons name="calendar-outline" size={14} color={colors.neutral1} />
              <Text style={styles.dateChipText}>Today: 13:00am</Text>
            </View>
            <View style={styles.completedRow}>
              <Ionicons name="logo-usd" size={14} color={colors.Success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.infoRowFull}>
          <IconSquare icon="flag" />
          <Text style={styles.infoLabel}>Target:</Text>
          <Text style={styles.infoValue}>Fat loss, Endurance</Text>
        </View>

        <View style={styles.infoColumns}>
          <View style={styles.infoCol}>
            <IconSquare icon="rocket" />
            <Text style={styles.infoLabel}>Level:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              Intermediate
            </Text>
          </View>
          <View style={styles.infoCol}>
            <IconSquare icon="walk" />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              HIIT, Cardio
            </Text>
          </View>
        </View>

        <SectionTitle>Training History</SectionTitle>
        {HISTORY.map((h) => (
          <View key={h.id} style={styles.historyCard}>
            {h.image ? (
              <Image source={{ uri: h.image }} style={styles.historyThumb} />
            ) : (
              <View style={styles.historyThumb} />
            )}
            <View style={styles.historyInfo}>
              <View style={styles.historyTitleRow}>
                <Text style={styles.historyName}>{h.name}</Text>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.historyType}>{h.type}</Text>
              <View style={styles.statRow}>
                <Stat icon="person-outline" value={h.clients} />
                <Stat icon="eye-outline" value={h.views} />
                <Stat icon="time-outline" value={h.duration} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function IconSquare({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconSquare}>
      <Ionicons name={icon} size={16} color={colors.white} />
    </View>
  );
}

function Stat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.statText}>{value}</Text>
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
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  clientName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusDot: {
    fontSize: typography.sizes.base,
    color: colors.neutral7,
  },
  status: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  nextCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  nextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextLabel: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  nextTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  hiitTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral3,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  hiitTagText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  nextFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral9,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dateChipText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral1,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  infoRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    flexShrink: 1,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  historyThumb: {
    width: 96,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  historyType: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral3,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
  },
});
