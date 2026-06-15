import React from 'react';

import { ONBOARDING_TRAINING_TYPES } from '../../../constants';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { MultiSelectStep } from '../components/MultiSelectStep';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function TrainingTypesScreen() {
  const { navigation, isClient, step, totalSteps } =
    useOnboardingScreen('TrainingTypes');

  const trainingTypes = useOnboardingStore((s) => s.trainingTypes);

  const toggleTrainingType = useOnboardingStore((s) => s.toggleTrainingType);

  const goNext = () => navigation.navigate('ClientTypes');

  return (
    <MultiSelectStep
      step={step}
      totalSteps={totalSteps}
      title={
        isClient
          ? 'What types of training interest you?'
          : 'What types of training do you offer?'
      }
      subtitle="Select all that apply"
      options={ONBOARDING_TRAINING_TYPES}
      selected={trainingTypes}
      onToggle={toggleTrainingType}
      warning="We recommend selecting at least one training type"
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    />
  );
}
