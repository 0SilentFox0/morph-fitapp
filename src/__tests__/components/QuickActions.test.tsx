// src/__tests__/components/QuickActions.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { QuickActions } from '../../components/ui/QuickActions';

describe('QuickActions', () => {
  it('fires the matching handler for each action', async () => {
    const onBook = jest.fn();

    const onMessage = jest.fn();

    const onProgress = jest.fn();

    await render(
      <QuickActions
        onBook={onBook}
        onMessage={onMessage}
        onProgress={onProgress}
      />
    );

    fireEvent.press(screen.getByTestId('quick-action-book'));
    fireEvent.press(screen.getByTestId('quick-action-message'));
    fireEvent.press(screen.getByTestId('quick-action-progress'));

    expect(onBook).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});
