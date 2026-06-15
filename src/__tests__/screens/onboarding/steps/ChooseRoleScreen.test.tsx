import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChooseRoleScreen } from '../../../../screens/onboarding/steps/ChooseRoleScreen';
import { useAppStore } from '../../../../store/appStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const pressEl = async (el: ReturnType<typeof screen.getByText>) => {
  await act(async () => {
    fireEvent.press(el);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.getState().reset();
});

describe('ChooseRoleScreen', () => {
  it('defaults to the trainer role', async () => {
    await render(<ChooseRoleScreen />);
    await pressEl(screen.getByText('Continue'));

    expect(useAppStore.getState().userRole).toBe('trainer');
    expect(mockNavigate).toHaveBeenCalledWith('Welcome');
  });

  it('selecting client then Continue sets the role and goes to Welcome', async () => {
    await render(<ChooseRoleScreen />);
    await pressEl(screen.getByLabelText("I'm a client"));
    await pressEl(screen.getByText('Continue'));

    expect(useAppStore.getState().userRole).toBe('client');
    expect(mockNavigate).toHaveBeenCalledWith('Welcome');
  });
});
