import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ScreenBackground } from '../../components/layout';
import { BookSessionScreen } from '../../screens/client/home/BookSessionScreen';
import { ClientHomeScreen } from '../../screens/client/home/ClientHomeScreen';
import { ClientProfileScreen } from '../../screens/client/home/ClientProfileScreen';
import { RequestSubmittedScreen } from '../../screens/home';
import type { ClientHomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<ClientHomeStackParamList>();

export function ClientHomeStackNavigator() {
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
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <Stack.Screen name="BookSession" component={BookSessionScreen} />
      <Stack.Screen
        name="RequestSubmitted"
        component={RequestSubmittedScreen}
      />
    </Stack.Navigator>
  );
}
