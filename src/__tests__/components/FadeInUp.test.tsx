// src/__tests__/components/FadeInUp.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { FadeInUp } from '../../components/ui/FadeInUp';

describe('FadeInUp', () => {
  it('renders its children', async () => {
    await render(
      <FadeInUp>
        <Text>hello</Text>
      </FadeInUp>,
    );
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
