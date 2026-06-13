// src/__tests__/components/StreakBanner.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StreakBanner } from '../../components/ui/StreakBanner';

describe('StreakBanner', () => {
  it('shows the streak count when there is a streak', async () => {
    await render(<StreakBanner streak={3} sessionsThisWeek={2} />);
    expect(screen.getByText('3-week streak')).toBeTruthy();
    expect(screen.getByText('2/3 sessions this week')).toBeTruthy();
  });

  it('shows an encouraging message when there is no streak', async () => {
    await render(<StreakBanner streak={0} sessionsThisWeek={0} />);
    expect(screen.getByText('Start your streak this week')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<StreakBanner streak={1} sessionsThisWeek={1} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('streak-banner'));
    expect(onPress).toHaveBeenCalled();
  });
});
