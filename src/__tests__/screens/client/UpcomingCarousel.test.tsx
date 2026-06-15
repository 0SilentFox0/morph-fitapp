// src/__tests__/screens/client/UpcomingCarousel.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { UpcomingCarousel } from '../../../screens/client/home/UpcomingCarousel';
import type { Session } from '../../../types';

const make = (id: string, title: string): Session => ({
  id,
  title,
  type: 'HIIT',
  date: 'Mon 16 Jun',
  time: '18:00',
  status: 'pending',
  participants: [{ id: 'c1', name: 'Alex' }],
});

describe('UpcomingCarousel', () => {
  it('shows the book CTA when there are no sessions', async () => {
    const onBook = jest.fn();

    await render(
      <UpcomingCarousel
        sessions={[]}
        onPressSession={jest.fn()}
        onBook={onBook}
      />
    );
    fireEvent.press(screen.getByTestId('book-cta'));
    expect(onBook).toHaveBeenCalled();
  });

  it('renders a card per session with pagination dots', async () => {
    await render(
      <UpcomingCarousel
        sessions={[make('1', 'Leg day'), make('2', 'Push day')]}
        onPressSession={jest.fn()}
        onBook={jest.fn()}
      />
    );
    expect(screen.getByText('Leg day')).toBeTruthy();
    expect(screen.getByText('Push day')).toBeTruthy();
    expect(screen.getAllByTestId('pager-dot')).toHaveLength(2);
  });

  it('calls onPressSession when a card is tapped', async () => {
    const onPressSession = jest.fn();

    await render(
      <UpcomingCarousel
        sessions={[make('1', 'Leg day')]}
        onPressSession={onPressSession}
        onBook={jest.fn()}
      />
    );
    fireEvent.press(screen.getByText('Leg day'));
    expect(onPressSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' })
    );
  });
});
