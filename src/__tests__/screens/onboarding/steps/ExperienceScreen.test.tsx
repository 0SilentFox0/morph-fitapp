import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ExperienceScreen } from '../../../../screens/onboarding/steps/ExperienceScreen';
import { useAppStore } from '../../../../store/appStore';
import { useOnboardingStore } from '../../../../store/onboardingStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

beforeEach(() => {
  useOnboardingStore.getState().reset();
  useAppStore.getState().reset();
});

describe('ExperienceScreen', () => {
  it('client role: asks training duration and shows the injuries block', async () => {
    useAppStore.getState().setUserRole('client');
    await render(<ExperienceScreen />);

    expect(screen.getByText('How long have you been training?')).toBeTruthy();
    expect(
      screen.getByText('I have injuries or health limitations')
    ).toBeTruthy();
    expect(screen.queryByText('I have certifications')).toBeNull();
  });

  it('trainer role: asks experience and shows the certifications block', async () => {
    useAppStore.getState().setUserRole('trainer');
    await render(<ExperienceScreen />);

    expect(screen.getByText('Tell us about your experience')).toBeTruthy();
    expect(screen.getByText('I have certifications')).toBeTruthy();
    expect(
      screen.queryByText('I have injuries or health limitations')
    ).toBeNull();
  });
});
