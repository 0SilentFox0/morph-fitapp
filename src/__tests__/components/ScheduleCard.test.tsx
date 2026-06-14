// src/__tests__/components/ScheduleCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ScheduleCard } from '../../components/ui/ScheduleCard';
import type { Session } from '../../types';

const session: Session = {
  id: 's1',
  title: 'Upper body strength',
  type: 'HIIT',
  date: 'Mon 16 Jun',
  time: '18:00',
  status: 'pending',
  participants: [{ id: 'c1', name: 'Alex' }],
};

describe('ScheduleCard client variant', () => {
  it('renders the status label and title', async () => {
    await render(<ScheduleCard session={session} variant="client" />);
    expect(screen.getByText('Upper body strength')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('hides the options menu and start button', async () => {
    await render(
      <ScheduleCard session={session} variant="client" onStart={jest.fn()} onOptionsPress={jest.fn()} />,
    );
    expect(screen.queryByTestId('schedule-card-options')).toBeNull();
    expect(screen.queryByText('Start training')).toBeNull();
  });

  it('shows the trainer pill only when trainerName is provided', async () => {
    await render(<ScheduleCard session={session} variant="client" />);
    expect(screen.queryByText('w/ Coach Sam')).toBeNull();
    await render(<ScheduleCard session={session} variant="client" trainerName="Coach Sam" />);
    expect(screen.getByText('w/ Coach Sam')).toBeTruthy();
  });

  it('trainer variant still shows the options menu', async () => {
    await render(<ScheduleCard session={session} variant="trainer" onOptionsPress={jest.fn()} />);
    expect(screen.getByTestId('schedule-card-options')).toBeTruthy();
  });
});
