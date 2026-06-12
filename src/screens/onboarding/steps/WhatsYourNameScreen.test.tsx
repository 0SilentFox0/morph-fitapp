import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { WhatsYourNameScreen } from './WhatsYourNameScreen';
import { useAppStore } from '../../../store/appStore';
import { useOnboardingStore } from '../../../store/onboardingStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useOnboardingStore.getState().reset();
  useAppStore.getState().reset();
  useAppStore.getState().setUserRole('trainer');
});

describe('WhatsYourNameScreen', () => {
  it('writes the typed name into the store', async () => {
    await render(<WhatsYourNameScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Alex');
    expect(useOnboardingStore.getState().name).toBe('Alex');
  });

  it('saves the name and advances when valid', async () => {
    useOnboardingStore.getState().setField('name', 'Alex');
    await render(<WhatsYourNameScreen />);
    fireEvent.press(screen.getByLabelText('Next step'));

    expect(useAppStore.getState().userName).toBe('Alex');
    expect(mockNavigate).toHaveBeenCalledWith('Experience');
  });

  it('keeps Next disabled and does not advance for an empty name', async () => {
    await render(<WhatsYourNameScreen />);
    expect(screen.getByLabelText('Next step').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByLabelText('Next step'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the client subtitle for the client role', async () => {
    useAppStore.getState().setUserRole('client');
    await render(<WhatsYourNameScreen />);
    expect(screen.getByText('Let trainers know how to address you')).toBeTruthy();
  });
});
