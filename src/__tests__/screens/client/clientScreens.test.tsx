import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressOverviewScreen } from '../../../screens/client/progress/ProgressOverviewScreen';
import { ClientHomeScreen } from '../../../screens/client/home/ClientHomeScreen';
import { ExerciseProgressScreen } from '../../../screens/client/progress/ExerciseProgressScreen';
import { ExerciseProgressDetailScreen } from '../../../screens/client/progress/ExerciseProgressDetailScreen';
import { useAppStore } from '../../../store/appStore';

// Screens read navigation; getParent() supports the cross-tab calls in ClientHome.
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, getParent: () => ({ navigate: mockNavigate }) }),
  useRoute: () => ({ params: {} }),
}));

beforeEach(() => {
  useAppStore.setState({ isOnboarded: true, userRole: 'client', userName: 'Alex', points: 120 });
});

// These render without throwing only if the zustand selectors are stable —
// a getter returning a fresh array each render triggers React's max-update-depth
// error (#185), which surfaces here as a render throw. Regression guard for that.
describe('client screens render (no infinite render loop)', () => {
  it('ProgressOverviewScreen renders without an infinite render loop', () => {
    expect(() => render(<ProgressOverviewScreen />)).not.toThrow();
  });

  it('ClientHomeScreen renders without an infinite render loop', () => {
    expect(() => render(<ClientHomeScreen />)).not.toThrow();
  });

  it('ExerciseProgressScreen renders without an infinite render loop', () => {
    expect(() => render(<ExerciseProgressScreen />)).not.toThrow();
  });

  it('ExerciseProgressDetailScreen renders without an infinite render loop', () => {
    expect(() => render(<ExerciseProgressDetailScreen />)).not.toThrow();
  });
});
