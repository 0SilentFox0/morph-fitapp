import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NavigationProp, useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { Avatar, Button, SectionTitle, Tag } from '../../../components/ui';
import type { ClientHomeStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { formatKg } from '../../../utils';

const { colors, radius, typography, spacing } = theme;

import { useAppStore } from '../../../store/appStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { computeTotals } from '../../../utils/progress/muscleStats';

export function ClientProfileScreen() {
  const navigation =
    useNavigation<NavigationProp<ClientHomeStackParamList>>();

  const userName = useAppStore((s) => s.userName);

  const points = useAppStore((s) => s.points);

  const setUserRole = useAppStore((s) => s.setUserRole);

  const resetApp = useAppStore((s) => s.reset);

  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const trainingTypes = useOnboardingStore((s) => s.trainingTypes);

  const getCurrentUserHistory = useTrainingHistoryStore(
    (s) => s.getCurrentUserHistory
  );

  useTrainingHistoryStore((s) => s.history);

  const history = getCurrentUserHistory();

  const totals = computeTotals(history);

  const handleSwitchToTrainer = () => setUserRole('trainer');

  const handleResetOnboarding = () => {
    resetOnboarding();
    resetApp();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={userName ?? 'You'} size={84} />
          <Text style={styles.name}>{userName ?? 'You'}</Text>
          <View style={styles.pointsRow}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.points}>{points} points</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Sessions" value={`${totals.sessionCount}`} />
          <StatTile label="Volume" value={formatKg(totals.tonnage)} />
          <StatTile label="Exercises" value={`${totals.exerciseCount}`} />
        </View>

        {trainingTypes.length > 0 && (
          <>
            <SectionTitle>Interests</SectionTitle>
            <View style={styles.tagsRow}>
              {trainingTypes.map((t) => (
                <Tag key={t} label={t} variant="default" />
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <ProfileRow
            icon="create-outline"
            label="Edit profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <ProfileRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <ProfileRow
            icon="settings-outline"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Button
              title="Switch to trainer view (dev)"
              variant="outline"
              onPress={handleSwitchToTrainer}
              style={styles.devBtn}
            />
            <Button
              title="Reset onboarding (dev)"
              variant="outline"
              onPress={handleResetOnboarding}
              style={styles.devBtn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.row}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  header: { alignItems: 'center', gap: 4 },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  points: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statTile: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { marginTop: spacing.md, gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  devSection: { gap: spacing.sm, marginTop: spacing.lg },
  devBtn: {},
});
