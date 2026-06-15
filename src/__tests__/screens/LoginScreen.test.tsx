import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { LoginScreen } from '../../screens/auth/LoginScreen';
import { ApiError } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('LoginScreen', () => {
  it('calls login with the entered credentials', async () => {
    const loginSpy = jest
      .spyOn(useAuthStore.getState(), 'login')
      .mockResolvedValue();

    const { getByTestId } = await render(<LoginScreen />);

    await fireEvent.changeText(getByTestId('login-email'), 'a@b.com');
    await fireEvent.changeText(getByTestId('login-password'), 'secret');
    await fireEvent.press(getByTestId('login-submit'));
    expect(loginSpy).toHaveBeenCalledWith('a@b.com', 'secret');
  });

  it('shows the error message when login fails', async () => {
    jest
      .spyOn(useAuthStore.getState(), 'login')
      .mockRejectedValue(new ApiError(422, 'Invalid credentials'));

    const { getByTestId } = await render(<LoginScreen />);

    await fireEvent.changeText(getByTestId('login-email'), 'a@b.com');
    await fireEvent.changeText(getByTestId('login-password'), 'bad');
    await fireEvent.press(getByTestId('login-submit'));
    expect(await screen.findByText('Invalid credentials')).toBeTruthy();
  });
});
