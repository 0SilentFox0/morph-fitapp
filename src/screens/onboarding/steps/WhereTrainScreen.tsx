import React from 'react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { TRAINING_LOCATIONS } from '../../../constants';
import { MultiSelectStep } from '../components/MultiSelectStep';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function WhereTrainScreen() {
  const { navigation, isClient, step, totalSteps } = useOnboardingScreen('WhereTrain');
  const locations = useOnboardingStore((s) => s.locations);
  const toggleLocation = useOnboardingStore((s) => s.toggleLocation);

  const goNext = () => navigation.navigate('WorkSchedule');

  return (
    <MultiSelectStep
      step={step}
      totalSteps={totalSteps}
      title={isClient ? 'Where would you like to train?' : 'Where do you train clients?'}
      subtitle="Select all that apply"
      options={TRAINING_LOCATIONS}
      selected={locations}
      onToggle={toggleLocation}
      warning="We recommend selecting at least one location"
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
      layout="list"
    />
  );
}
