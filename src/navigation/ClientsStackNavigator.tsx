import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from './types';
import { ScreenBackground } from '../components/layout';
import { useRestTimer } from '../hooks/useRestTimer';

import { ClientsListScreen } from '../screens/clients/ClientsListScreen';
import { FiltersScreen } from '../screens/clients/FiltersScreen';
import { ClientProfileScreen } from '../screens/clients/ClientProfileScreen';
import { ProgramDetailScreen } from '../screens/clients/ProgramDetailScreen';
import { ExerciseDetailScreen } from '../screens/clients/ExerciseDetailScreen';
import { ClientsProfileExtendedScreen } from '../screens/clients/ClientsProfileExtendedScreen';
import { TrainingSummaryScreen } from '../screens/clients/TrainingSummaryScreen';

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStackNavigator() {
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
      <Stack.Screen name="ClientsList" component={ClientsListScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ClientsProfileExtended" component={ClientsProfileExtendedScreen} />
      <Stack.Screen name="TrainingSummary" component={TrainingSummaryScreen} />
    </Stack.Navigator>
  );
}
