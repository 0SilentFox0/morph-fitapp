import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StatsStackParamList } from './types';
import { colors } from '../theme/colors';

import { BusinessAnalyticsScreen } from '../screens/stats/BusinessAnalyticsScreen';
import { TransactionsScreen } from '../screens/stats/TransactionsScreen';
import { YouGotPaidScreen } from '../screens/stats/YouGotPaidScreen';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export function StatsStackNavigator() {
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
      <Stack.Screen name="BusinessAnalytics" component={BusinessAnalyticsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="YouGotPaid" component={YouGotPaidScreen} />
    </Stack.Navigator>
  );
}
