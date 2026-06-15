import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { AsyncBoundary } from '../../components/ui/AsyncBoundary';

const Child = () => <Text testID="child">content</Text>;

describe('AsyncBoundary', () => {
  it('shows the loading state while loading', async () => {
    await render(
      <AsyncBoundary status="loading">
        <Child />
      </AsyncBoundary>
    );
    expect(screen.getByTestId('async-loading')).toBeTruthy();
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('shows the error state with a working retry button', async () => {
    const onRetry = jest.fn();

    await render(
      <AsyncBoundary status="error" error={new Error('boom')} onRetry={onRetry}>
        <Child />
      </AsyncBoundary>
    );
    expect(screen.getByTestId('async-error')).toBeTruthy();
    fireEvent.press(screen.getByTestId('async-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state on success when isEmpty is true', async () => {
    await render(
      <AsyncBoundary status="success" isEmpty emptyLabel="Nothing here">
        <Child />
      </AsyncBoundary>
    );
    expect(screen.getByTestId('async-empty')).toBeTruthy();
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('renders children on success with data', async () => {
    await render(
      <AsyncBoundary status="success">
        <Child />
      </AsyncBoundary>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});
