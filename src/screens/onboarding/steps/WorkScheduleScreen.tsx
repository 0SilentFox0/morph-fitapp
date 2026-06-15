import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import theme from '../../../theme';

const { colors, typography, spacing } = theme;

import { useShallow } from 'zustand/react/shallow';

import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { TimeField } from '../components/TimeField';
import { WeekdayPicker } from '../components/WeekdayPicker';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function WorkScheduleScreen() {
  const { navigation, isClient, step, totalSteps } =
    useOnboardingScreen('WorkSchedule');

  const { workTimeStart, workTimeEnd, sameSlotsEveryWeek, setField } =
    useOnboardingStore(
      useShallow((s) => ({
        workTimeStart: s.workTimeStart,
        workTimeEnd: s.workTimeEnd,
        sameSlotsEveryWeek: s.sameSlotsEveryWeek,
        setField: s.setField,
      }))
    );

  const goNext = () =>
    navigation.navigate(isClient ? 'TrainerPreferences' : 'ProfilePhoto');

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      title={
        isClient
          ? 'When are you available to train?'
          : 'What time do you plan to work?'
      }
      subtitle={
        isClient
          ? 'Select your preferred days and hours'
          : 'Select your working days and hours'
      }
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    >
      <Text style={styles.sectionLabel}>Days</Text>
      <WeekdayPicker />

      <TimeField
        label="Start time"
        value={workTimeStart}
        onChange={(t) => setField('workTimeStart', t)}
      />
      <TimeField
        label="End time"
        value={workTimeEnd}
        onChange={(t) => setField('workTimeEnd', t)}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Same slots every week</Text>
        <Switch
          value={sameSlotsEveryWeek}
          onValueChange={(v) => setField('sameSlotsEveryWeek', v)}
          trackColor={{ false: colors.neutral2, true: colors.accent }}
          thumbColor={colors.white}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  toggleLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});
