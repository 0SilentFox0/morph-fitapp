import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ScreenBackground } from '../components/layout';
import { AddTransactionScreen } from '../screens/stats/AddTransactionScreen';
import { BusinessAnalyticsScreen } from '../screens/stats/BusinessAnalyticsScreen';
import { TrainerLeagueScreen } from '../screens/stats/TrainerLeagueScreen';
import { TransactionsScreen } from '../screens/stats/TransactionsScreen';
import { YouGotPaidScreen } from '../screens/stats/YouGotPaidScreen';
import type { StatsStackParamList } from './types';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export function StatsStackNavigator() {
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
      <Stack.Screen
        name="BusinessAnalytics"
        component={BusinessAnalyticsScreen}
      />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="YouGotPaid" component={YouGotPaidScreen} />
      <Stack.Screen name="TrainerLeague" component={TrainerLeagueScreen} />
    </Stack.Navigator>
  );
}
