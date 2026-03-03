import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StatsStackParamList } from './types';

import { BusinessAnalyticsScreen } from '../screens/stats/BusinessAnalyticsScreen';
import { TransactionsScreen } from '../screens/stats/TransactionsScreen';
import { YouGotPaidScreen } from '../screens/stats/YouGotPaidScreen';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export function StatsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="BusinessAnalytics" component={BusinessAnalyticsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="YouGotPaid" component={YouGotPaidScreen} />
    </Stack.Navigator>
  );
}
