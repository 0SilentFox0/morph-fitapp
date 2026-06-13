import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProgressStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { ProgressOverviewScreen } from '../../screens/client/progress/ProgressOverviewScreen';
import { MuscleDetailScreen } from '../../screens/client/progress/MuscleDetailScreen';
import { TrainingHistoryScreen } from '../../screens/client/progress/TrainingHistoryScreen';
import { TrainingHistoryDetailScreen } from '../../screens/client/progress/TrainingHistoryDetailScreen';
import { PersonalRecordsScreen } from '../../screens/client/progress/PersonalRecordsScreen';
import { MeasurementsScreen } from '../../screens/client/progress/MeasurementsScreen';
import { AchievementsScreen } from '../../screens/client/progress/AchievementsScreen';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressStackNavigator() {
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
      <Stack.Screen name="ProgressOverview" component={ProgressOverviewScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="TrainingHistory" component={TrainingHistoryScreen} />
      <Stack.Screen name="TrainingHistoryDetail" component={TrainingHistoryDetailScreen} />
      <Stack.Screen name="PersonalRecords" component={PersonalRecordsScreen} />
      <Stack.Screen name="Measurements" component={MeasurementsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
    </Stack.Navigator>
  );
}
