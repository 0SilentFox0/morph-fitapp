import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { ProgramExerciseList } from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { mockTrainingPrograms } from '../../mocks';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ProgramDetail'>;
type Route = RouteProp<ClientsStackParamList, 'ProgramDetail'>;

export function ProgramDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = mockTrainingPrograms.find((p) => p.id === route.params?.programId);
  const activeClientId = useActiveTrainingStore((s) => s.activeClientId);

  if (!program) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Program" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Program not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={program.name} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgramExerciseList
          program={program}
          onSelectExercise={(index) => {
            if (!activeClientId) return;
            navigation.navigate('ExerciseDetail', {
              clientId: activeClientId,
              programId: program.id,
              exerciseIndex: index,
            });
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
  },
});
