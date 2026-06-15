import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import theme from '../theme';
import type { OnboardingStackParamList } from './types';

const { colors } = theme;

import {
  ChooseRoleScreen,
  ClientTypesScreen,
  ExperienceScreen,
  PreviewProfileScreen,
  ProfilePhotoScreen,
  TrainerPreferencesScreen,
  TrainingTypesScreen,
  WelcomeScreen,
  WhatsYourNameScreen,
  WhereTrainScreen,
  WorkScheduleScreen,
  YoureAllSetScreen,
} from '../screens/onboarding';
import { useOnboardingStore } from '../store/onboardingStore';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const RESUMABLE_ROUTES: readonly (keyof OnboardingStackParamList)[] = [
  'ChooseRole',
  'Welcome',
  'WhatsYourName',
  'Experience',
  'TrainingTypes',
  'ClientTypes',
  'WhereTrain',
  'WorkSchedule',
  'TrainerPreferences',
  'ProfilePhoto',
  'PreviewProfile',
  'YoureAllSet',
];

function ResumeEffect() {
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  const currentRoute = useOnboardingStore((s) => s.currentRoute);

  React.useEffect(() => {
    if (
      currentRoute &&
      currentRoute !== 'ChooseRole' &&
      RESUMABLE_ROUTES.includes(currentRoute as keyof OnboardingStackParamList)
    ) {
      navigation.reset({
        index: 0,
        routes: [{ name: currentRoute as keyof OnboardingStackParamList }],
      });
    }
    // We only want to resume once, on the first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function OnboardingNavigator() {
  const setCurrentRoute = useOnboardingStore((s) => s.setCurrentRoute);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.screenBg },
          animation: 'slide_from_right',
          animationDuration: 250,
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
        }}
        screenListeners={{
          focus: (e) => {
            // e.target is in the form "RouteName-key"; strip the key suffix.
            const name = e.target?.split('-')[0];

            if (name) setCurrentRoute(name);
          },
        }}
      >
        <Stack.Screen name="ChooseRole" component={ChooseRoleScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="WhatsYourName" component={WhatsYourNameScreen} />
        <Stack.Screen name="Experience" component={ExperienceScreen} />
        <Stack.Screen name="TrainingTypes" component={TrainingTypesScreen} />
        <Stack.Screen name="ClientTypes" component={ClientTypesScreen} />
        <Stack.Screen name="WhereTrain" component={WhereTrainScreen} />
        <Stack.Screen name="WorkSchedule" component={WorkScheduleScreen} />
        <Stack.Screen
          name="TrainerPreferences"
          component={TrainerPreferencesScreen}
        />
        <Stack.Screen name="ProfilePhoto" component={ProfilePhotoScreen} />
        <Stack.Screen name="PreviewProfile" component={PreviewProfileScreen} />
        <Stack.Screen name="YoureAllSet" component={YoureAllSetScreen} />
      </Stack.Navigator>
      <ResumeEffect />
    </>
  );
}
