import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrainersStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { makeClientPlaceholder } from '../../screens/client/ClientPlaceholderScreen';

const Stack = createNativeStackNavigator<TrainersStackParamList>();

// Placeholders replaced in Phase 4.
const TrainersListScreen = makeClientPlaceholder('Find a trainer', 'search');
const TrainerFiltersScreen = makeClientPlaceholder('Filters', 'options', true);
const TrainerProfileScreen = makeClientPlaceholder('Trainer', 'person', true);

export function TrainersStackNavigator() {
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
      <Stack.Screen name="TrainersList" component={TrainersListScreen} />
      <Stack.Screen name="TrainerFilters" component={TrainerFiltersScreen} />
      <Stack.Screen name="TrainerProfile" component={TrainerProfileScreen} />
    </Stack.Navigator>
  );
}
