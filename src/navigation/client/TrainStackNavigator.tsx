import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrainStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { useRestTimer } from '../../hooks/training/useRestTimer';

import { TrainHomeScreen } from '../../screens/client/train/TrainHomeScreen';
import { WorkoutOverviewScreen } from '../../screens/client/train/WorkoutOverviewScreen';
import { WorkoutBuilderScreen } from '../../screens/client/train/WorkoutBuilderScreen';
import { ExerciseDetailScreen } from '../../screens/training/ExerciseDetailScreen';
import { TrainingSummaryScreen } from '../../screens/training/TrainingSummaryScreen';

const Stack = createNativeStackNavigator<TrainStackParamList>();

export function TrainStackNavigator() {
  // Keep rest countdowns ticking across the whole Train stack (mirrors the
  // trainer's ClientsStackNavigator).
  useRestTimer();

  return (
    <Stack.Navigator
      screenLayout={({ children }) => <ScreenBackground>{children}</ScreenBackground>}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="TrainHome" component={TrainHomeScreen} />
      <Stack.Screen name="WorkoutBuilder" component={WorkoutBuilderScreen} />
      <Stack.Screen name="WorkoutOverview" component={WorkoutOverviewScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="TrainingSummary" component={TrainingSummaryScreen} />
    </Stack.Navigator>
  );
}
