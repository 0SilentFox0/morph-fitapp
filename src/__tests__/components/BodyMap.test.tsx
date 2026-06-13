import React from 'react';
import { render } from '@testing-library/react-native';
import { BodyMap } from '../../components/ui/BodyMap';
import { MUSCLE_GROUPS, type MuscleGroup } from '../../constants/muscles';

const intensities = MUSCLE_GROUPS.reduce(
  (acc, g, i) => {
    acc[g] = i / (MUSCLE_GROUPS.length - 1); // spread 0..1
    return acc;
  },
  {} as Record<MuscleGroup, number>,
);

describe('BodyMap', () => {
  it('renders the front view without crashing', () => {
    expect(() => render(<BodyMap intensities={intensities} view="front" />)).not.toThrow();
  });

  it('renders the back view without crashing', () => {
    expect(() => render(<BodyMap intensities={intensities} view="back" />)).not.toThrow();
  });
});
