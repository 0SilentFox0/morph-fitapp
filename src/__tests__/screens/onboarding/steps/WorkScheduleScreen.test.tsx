import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { WorkScheduleScreen } from '../../../../screens/onboarding/steps/WorkScheduleScreen';
import { useAppStore } from '../../../../store/appStore';
import { useOnboardingStore } from '../../../../store/onboardingStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useOnboardingStore.getState().reset();
  useAppStore.getState().reset();
});

describe('WorkScheduleScreen', () => {
  it('client role: advances to TrainerPreferences', async () => {
    useAppStore.getState().setUserRole('client');
    await render(<WorkScheduleScreen />);

    expect(screen.getByText('When are you available to train?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Next step'));
    expect(mockNavigate).toHaveBeenCalledWith('TrainerPreferences');
  });

  it('trainer role: advances to ProfilePhoto', async () => {
    useAppStore.getState().setUserRole('trainer');
    await render(<WorkScheduleScreen />);

    expect(screen.getByText('What time do you plan to work?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Next step'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfilePhoto');
  });
});
