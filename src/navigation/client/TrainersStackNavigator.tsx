import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrainersStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { TrainersListScreen } from '../../screens/client/trainers/TrainersListScreen';
import { TrainerFiltersScreen } from '../../screens/client/trainers/TrainerFiltersScreen';
import { TrainerProfileScreen } from '../../screens/client/trainers/TrainerProfileScreen';

const Stack = createNativeStackNavigator<TrainersStackParamList>();

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
