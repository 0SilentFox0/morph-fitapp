import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from './types';

import { ClientsListScreen } from '../screens/clients/ClientsListScreen';
import { FiltersScreen } from '../screens/clients/FiltersScreen';
import { ClientProfileScreen } from '../screens/clients/ClientProfileScreen';
import { ProgramDetailScreen } from '../screens/clients/ProgramDetailScreen';
import { ExerciseDetailScreen } from '../screens/clients/ExerciseDetailScreen';
import { ClientsProfileExtendedScreen } from '../screens/clients/ClientsProfileExtendedScreen';
import { TrainingSummaryScreen } from '../screens/clients/TrainingSummaryScreen';

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
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
