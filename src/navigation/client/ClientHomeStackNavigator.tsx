import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClientHomeStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { RequestSubmittedScreen } from '../../screens/home';
import { makeClientPlaceholder } from '../../screens/client/ClientPlaceholderScreen';

const Stack = createNativeStackNavigator<ClientHomeStackParamList>();

// Placeholders replaced in later phases (Home → P6, BookSession → P5).
const ClientHomeScreen = makeClientPlaceholder('Home', 'home');
const ClientProfileScreen = makeClientPlaceholder('Profile', 'person-circle', true);
const BookSessionScreen = makeClientPlaceholder('Book a session', 'calendar', true);

export function ClientHomeStackNavigator() {
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
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <Stack.Screen name="BookSession" component={BookSessionScreen} />
      <Stack.Screen name="RequestSubmitted" component={RequestSubmittedScreen} />
    </Stack.Navigator>
  );
}
