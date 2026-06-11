import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { ONBOARDING_TRAINING_TYPES } from '../../../constants';
import { MultiSelectStep } from '../components/MultiSelectStep';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'TrainingTypes'>;

export function TrainingTypesScreen() {
  const navigation = useNavigation<Nav>();
  const trainingTypes = useOnboardingStore((s) => s.trainingTypes);
  const toggleTrainingType = useOnboardingStore((s) => s.toggleTrainingType);

  return (
    <MultiSelectStep
      step={3}
      title="What types of training do you offer?"
      subtitle="Select all that apply"
      options={ONBOARDING_TRAINING_TYPES}
      selected={trainingTypes}
      onToggle={toggleTrainingType}
      warning="We recommend selecting at least one training type"
      onNext={() => navigation.navigate('ClientTypes')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('ClientTypes')}
    />
  );
}
