import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { ChoiceCard, Button } from '../../../components/ui';
import { buildExerciseCatalog } from '../../../utils/training/exerciseCatalog';
import { mockTrainingPrograms } from '../../../mocks';
import theme from '../../../theme';
const { colors, typography, spacing } = theme;

type Nav = NavigationProp<TrainStackParamList, 'WorkoutBuilder'>;

const CATALOG = buildExerciseCatalog(mockTrainingPrograms);

export function WorkoutBuilderScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = React.useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onContinue = () => {
    const exercises = CATALOG.filter((e) => selected.includes(e.id));
    navigation.navigate('WorkoutOverview', { source: 'custom', exercises });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Build workout" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>Pick the exercises for your session.</Text>
        {CATALOG.map((ex) => (
          <View key={ex.id} style={styles.cardWrap}>
            <ChoiceCard
              title={ex.name}
              subtitle={ex.category}
              selected={selected.includes(ex.id)}
              onPress={() => toggle(ex.id)}
            />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Button
          title={selected.length > 0 ? `Continue (${selected.length})` : 'Continue'}
          onPress={onContinue}
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  hint: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
  cardWrap: { marginBottom: spacing.sm },
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
