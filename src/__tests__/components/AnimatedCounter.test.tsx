// src/__tests__/components/AnimatedCounter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

// With reduce-motion on, the counter renders its final formatted value immediately.
jest.mock('../../hooks/ui/useReduceMotion', () => ({ useReduceMotion: () => true }));

describe('AnimatedCounter', () => {
  it('renders the formatted target value when reduce-motion is on', async () => {
    await render(<AnimatedCounter value={2100} format={(n) => `${n}kg`} />);
    expect(screen.getByText('2100kg')).toBeTruthy();
  });
});
