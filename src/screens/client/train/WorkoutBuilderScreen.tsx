import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { type NavigationProp, useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { Button } from '../../../components/ui';
import { mockTrainingPrograms } from '../../../mocks';
import type { TrainStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import type { ProgramExercise } from '../../../types';
import { buildExerciseCatalog } from '../../../utils/training/exerciseCatalog';
import { ExerciseGridItem } from '../../home/screens/Gallery/ExerciseGridItem';

const { colors, typography, spacing } = theme;

type Nav = NavigationProp<TrainStackParamList, 'WorkoutBuilder'>;

const CATALOG = buildExerciseCatalog(mockTrainingPrograms);

export function WorkoutBuilderScreen() {
  const navigation = useNavigation<Nav>();

  const insets = useSafeAreaInsets();

  const [selected, setSelected] = React.useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const onContinue = () => {
    const exercises = CATALOG.filter((e) => selected.includes(e.id));

    navigation.navigate('WorkoutOverview', { source: 'custom', exercises });
  };

  const renderExercise = React.useCallback(
    ({ item }: { item: ProgramExercise }) => (
      <ExerciseGridItem
        item={item}
        isSelected={selected.includes(item.id)}
        isExisting={false}
        onPress={() => toggle(item.id)}
      />
    ),
    [selected]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Build workout" onBack={() => navigation.goBack()} />
      <FlatList
        data={CATALOG}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderExercise}
        ListHeaderComponent={
          <Text style={styles.hint}>Pick the exercises for your session.</Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing.md) + spacing.tabBarInset,
          },
        ]}
      >
        <Button
          title={
            selected.length > 0 ? `Continue (${selected.length})` : 'Continue'
          }
          onPress={onContinue}
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.tabBarInset + spacing['3xl'],
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
