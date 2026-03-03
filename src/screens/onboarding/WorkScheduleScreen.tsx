import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '../../components/ui';
import { ProgressIndicator } from '../../components/layout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WorkSchedule'>;

export function WorkScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const {
    workDays,
    workTimeStart,
    workTimeEnd,
    sameSlotsEveryWeek,
    setField,
  } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={6} current={4} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What time do you plan to work?</Text>
        <Text style={styles.subtitle}>Select slots</Text>

        <Text style={styles.sectionLabel}>Days</Text>
        <View style={styles.slotRow}>
          <Text style={styles.slotText}>{workDays}</Text>
          <Ionicons name="add" size={24} color={colors.text} />
        </View>

        <Text style={styles.sectionLabel}>Time</Text>
        <View style={styles.slotRow}>
          <Ionicons name="time-outline" size={20} color={colors.text} />
          <Text style={styles.slotText}>
            {workTimeStart} - {workTimeEnd}
          </Text>
          <Ionicons name="add" size={24} color={colors.text} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Same slots every week</Text>
          <Switch
            value={sameSlotsEveryWeek}
            onValueChange={(v) => setField('sameSlotsEveryWeek', v)}
            trackColor={{ false: colors.Secondary2, true: colors.Accent1 }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.skip} onPress={() => navigation.replace('ProfilePhoto')}>
          Skip
        </Text>
        <View style={styles.navButtons}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          <IconButton
            icon="arrow-forward"
            onPress={() => navigation.replace('ProfilePhoto')}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.Secondary2,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  slotText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skip: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
