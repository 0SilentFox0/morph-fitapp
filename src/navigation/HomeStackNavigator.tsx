import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ScreenBackground } from '../components/layout';
import {
  AddToLibraryFormScreen,
  CardioClassFormScreen,
  EditProfileScreen,
  GalleryScreen,
  HomeScreen,
  ProfileScreen,
  RequestSubmittedScreen,
  ScheduleScreen,
  SessionFormScreen,
  TrainingLibraryScreen,
} from '../screens/home';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenLayout={({ children }) => (
        <ScreenBackground>{children}</ScreenBackground>
      )}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="SessionForm" component={SessionFormScreen} />
      <Stack.Screen
        name="RequestSubmitted"
        component={RequestSubmittedScreen}
      />
      <Stack.Screen name="TrainingLibrary" component={TrainingLibraryScreen} />
      <Stack.Screen
        name="AddToLibraryForm"
        component={AddToLibraryFormScreen}
      />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="CardioClassForm" component={CardioClassFormScreen} />
    </Stack.Navigator>
  );
}
