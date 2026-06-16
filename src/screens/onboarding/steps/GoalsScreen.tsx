import React from 'react';

import { CLIENT_GOALS } from '../../../constants';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { MultiSelectStep } from '../components/MultiSelectStep';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function GoalsScreen() {
  const { navigation, step, totalSteps } = useOnboardingScreen('Goals');

  const goals = useOnboardingStore((s) => s.goals);

  const toggleGoal = useOnboardingStore((s) => s.toggleGoal);

  const goNext = () => navigation.navigate('Experience');

  return (
    <MultiSelectStep
      step={step}
      totalSteps={totalSteps}
      title="What do you want to achieve?"
      subtitle="Pick your main goals — we use these to match you and track progress"
      options={CLIENT_GOALS}
      selected={goals}
      onToggle={toggleGoal}
      warning="Choose at least one goal so we can personalize your plan"
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    />
  );
}
