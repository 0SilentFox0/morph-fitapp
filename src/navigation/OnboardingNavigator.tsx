import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { colors } from '../theme/colors';

import {
  ChooseRoleScreen,
  WelcomeTrainerScreen,
  WhatsYourNameScreen,
  ExperienceScreen,
  TrainingTypesScreen,
  ClientTypesScreen,
  HaveProgramsScreen,
  AddToLibraryScreen,
  WhereTrainScreen,
  WorkScheduleScreen,
  ProfilePhotoScreen,
  PreviewProfileScreen,
  YoureAllSetScreen,
} from '../screens/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
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
      <Stack.Screen name="ChooseRole" component={ChooseRoleScreen} />
      <Stack.Screen name="WelcomeTrainer" component={WelcomeTrainerScreen} />
      <Stack.Screen name="WhatsYourName" component={WhatsYourNameScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="TrainingTypes" component={TrainingTypesScreen} />
      <Stack.Screen name="ClientTypes" component={ClientTypesScreen} />
      <Stack.Screen name="HavePrograms" component={HaveProgramsScreen} />
      <Stack.Screen name="AddToLibrary" component={AddToLibraryScreen} />
      <Stack.Screen name="WhereTrain" component={WhereTrainScreen} />
      <Stack.Screen name="WorkSchedule" component={WorkScheduleScreen} />
      <Stack.Screen name="ProfilePhoto" component={ProfilePhotoScreen} />
      <Stack.Screen name="PreviewProfile" component={PreviewProfileScreen} />
      <Stack.Screen name="YoureAllSet" component={YoureAllSetScreen} />
    </Stack.Navigator>
  );
}
