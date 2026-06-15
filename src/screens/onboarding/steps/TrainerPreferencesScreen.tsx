import React from 'react';
import { StyleSheet, Text } from 'react-native';

import theme from '../../../theme';

const { colors, typography, spacing } = theme;

import { useShallow } from 'zustand/react/shallow';

import { TRAINER_GENDER_PREFS, TRAINING_FORMATS } from '../../../constants';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { OptionGroup } from '../components/OptionGroup';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

/**
 * Client-only step. Captures who the client wants as a trainer (gender, single
 * choice) and how they want to train (format, multi choice) to sharpen matching.
 */
export function TrainerPreferencesScreen() {
  const { navigation, step, totalSteps } =
    useOnboardingScreen('TrainerPreferences');

  const {
    preferredTrainerGender,
    preferredFormat,
    setField,
    togglePreferredFormat,
  } = useOnboardingStore(
    useShallow((s) => ({
      preferredTrainerGender: s.preferredTrainerGender,
      preferredFormat: s.preferredFormat,
      setField: s.setField,
      togglePreferredFormat: s.togglePreferredFormat,
    }))
  );

  const goNext = () => navigation.navigate('ProfilePhoto');

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      title="What trainer are you looking for?"
      subtitle="This helps us find your best match"
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    >
      <Text style={styles.sectionLabel}>Preferred trainer</Text>
      <OptionGroup
        options={TRAINER_GENDER_PREFS}
        selected={preferredTrainerGender ? [preferredTrainerGender] : []}
        onToggle={(value) =>
          setField(
            'preferredTrainerGender',
            preferredTrainerGender === value ? '' : value
          )
        }
      />

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
        Training format
      </Text>
      <OptionGroup
        options={TRAINING_FORMATS}
        selected={preferredFormat}
        onToggle={togglePreferredFormat}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSpacing: { marginTop: spacing.xl },
});
