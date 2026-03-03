import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';

import { HomeScreen } from '../screens/main/HomeScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ScheduleScreen } from '../screens/main/ScheduleScreen';
import { SessionFormScreen } from '../screens/main/SessionFormScreen';
import { RequestSubmittedScreen } from '../screens/main/RequestSubmittedScreen';
import { TrainingLibraryScreen } from '../screens/main/TrainingLibraryScreen';
import { AddToLibraryFormScreen } from '../screens/main/AddToLibraryFormScreen';
import { GalleryScreen } from '../screens/main/GalleryScreen';
import { CardioClassFormScreen } from '../screens/main/CardioClassFormScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="SessionForm" component={SessionFormScreen} />
      <Stack.Screen name="RequestSubmitted" component={RequestSubmittedScreen} />
      <Stack.Screen name="TrainingLibrary" component={TrainingLibraryScreen} />
      <Stack.Screen name="AddToLibraryForm" component={AddToLibraryFormScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="CardioClassForm" component={CardioClassFormScreen} />
    </Stack.Navigator>
  );
}
