import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CertificationUpload } from '../components/CertificationUpload';
import { InjuriesField } from '../components/InjuriesField';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

const EXPERIENCE_OPTIONS = [
  { label: '1–3', sub: 'years' },
  { label: '4–6', sub: 'years' },
  { label: '7–9', sub: 'years' },
  { label: '10+', sub: 'years' },
];
const EXPERIENCE_VALUES = ['1-3 years', '4-6 years', '7-9 years', '10+ years'];

export function ExperienceScreen() {
  const { navigation, isClient, step, totalSteps } = useOnboardingScreen('Experience');
  const experienceYears = useOnboardingStore((s) => s.experienceYears);
  const setField = useOnboardingStore((s) => s.setField);

  const goNext = () => navigation.navigate('TrainingTypes');

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      title={isClient ? 'How long have you been training?' : 'Tell us about your experience'}
      subtitle={
        isClient ? 'This helps us match you with the right trainer' : 'This helps clients trust your skills'
      }
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    >
      <View style={styles.optionsRow}>
        {EXPERIENCE_OPTIONS.map((opt, i) => {
          const val = EXPERIENCE_VALUES[i] ?? '';
          const isSelected = experienceYears === val;
          return (
            <TouchableOpacity
              key={val}
              onPress={() => setField('experienceYears', val)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.optionSub, isSelected && styles.optionSubSelected]}>
                {opt.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isClient ? <InjuriesField /> : <CertificationUpload />}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  option: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  optionSelected: {
    backgroundColor: colors.primary4,
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral9,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.white,
  },
  optionSub: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.neutral8,
    textAlign: 'center',
  },
  optionSubSelected: {
    color: colors.primary9,
  },
});
