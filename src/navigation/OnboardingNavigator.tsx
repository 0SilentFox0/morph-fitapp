import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';

import { ChooseRoleScreen } from '../screens/onboarding/ChooseRoleScreen';
import { WelcomeTrainerScreen } from '../screens/onboarding/WelcomeTrainerScreen';
import { WhatsYourNameScreen } from '../screens/onboarding/WhatsYourNameScreen';
import { ExperienceScreen } from '../screens/onboarding/ExperienceScreen';
import { TrainingTypesScreen } from '../screens/onboarding/TrainingTypesScreen';
import { ClientTypesScreen } from '../screens/onboarding/ClientTypesScreen';
import { HaveProgramsScreen } from '../screens/onboarding/HaveProgramsScreen';
import { AddToLibraryScreen } from '../screens/onboarding/AddToLibraryScreen';
import { WhereTrainScreen } from '../screens/onboarding/WhereTrainScreen';
import { WorkScheduleScreen } from '../screens/onboarding/WorkScheduleScreen';
import { ProfilePhotoScreen } from '../screens/onboarding/ProfilePhotoScreen';
import { PreviewProfileScreen } from '../screens/onboarding/PreviewProfileScreen';
import { YoureAllSetScreen } from '../screens/onboarding/YoureAllSetScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
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
