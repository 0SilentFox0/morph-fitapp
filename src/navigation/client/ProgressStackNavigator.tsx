import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProgressStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { makeClientPlaceholder } from '../../screens/client/ClientPlaceholderScreen';
import { ProgressOverviewScreen } from '../../screens/client/progress/ProgressOverviewScreen';
import { MuscleDetailScreen } from '../../screens/client/progress/MuscleDetailScreen';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

// Placeholders replaced in Phase 3 (history/PR/measurements/achievements).
const TrainingHistoryScreen = makeClientPlaceholder('Training history', 'time', true);
const TrainingHistoryDetailScreen = makeClientPlaceholder('Training', 'barbell', true);
const PersonalRecordsScreen = makeClientPlaceholder('Personal records', 'trophy', true);
const MeasurementsScreen = makeClientPlaceholder('Measurements', 'analytics', true);
const AchievementsScreen = makeClientPlaceholder('Achievements', 'medal', true);

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
