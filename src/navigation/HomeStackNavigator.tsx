import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { colors } from '../theme/colors';

import {
  HomeScreen,
  ProfileScreen,
  ScheduleScreen,
  SessionFormScreen,
  RequestSubmittedScreen,
  TrainingLibraryScreen,
  AddToLibraryFormScreen,
  GalleryScreen,
  CardioClassFormScreen,
} from '../screens/home';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.screenBg },
        animation: 'slide_from_right',
        animationDuration: 250,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
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
