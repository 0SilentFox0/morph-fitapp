import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../../components/layout';
import { AsyncBoundary, Button } from '../../../components/ui';
import type { AsyncStatus } from '../../../hooks/data/useAsyncResource';
import type { HomeStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { CategoryFilterBar } from './Gallery/CategoryFilterBar';
import { ExerciseGridItem } from './Gallery/ExerciseGridItem';
import { useExerciseSelection } from './Gallery/useExerciseSelection';

const { colors, typography, spacing } = theme;

import type { Exercise } from '../../../services/exerciseApi';
import { useDraftProgramStore } from '../../../store/draftProgramStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useProgramsStore } from '../../../store/programsStore';
import type { ProgramExercise } from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Gallery'>;

function exerciseToProgram(ex: Exercise): ProgramExercise {
  return {
    id: ex.id,
    name: ex.name,
    category: ex.category,
    imageUrl: ex.imageUrl,
    sets: [
      { weight: 20, reps: 10 },
      { weight: 20, reps: 10 },
      { weight: 20, reps: 10 },
    ],
  };
}

export function GalleryScreen() {
  const navigation = useNavigation<Nav>();

  const insets = useSafeAreaInsets();

  const draftTitle = useDraftProgramStore((s) => s.title);

  const draftTag = useDraftProgramStore((s) => s.tag);

  const draftDescription = useDraftProgramStore((s) => s.description);

  const draftExercises = useDraftProgramStore((s) => s.exercises);

  const addDraftExercises = useDraftProgramStore((s) => s.addExercises);

  const resetDraft = useDraftProgramStore((s) => s.reset);

  const addProgram = useProgramsStore((s) => s.addProgram);

  const exercises = useExerciseStore((s) => s.exercises);

  const loading = useExerciseStore((s) => s.loading);

  const loadingMore = useExerciseStore((s) => s.loadingMore);

  const error = useExerciseStore((s) => s.error);

  const loadExercises = useExerciseStore((s) => s.loadExercises);

  const loadMore = useExerciseStore((s) => s.loadMore);

  const searchQuery = useExerciseStore((s) => s.searchQuery);

  const setSearchQuery = useExerciseStore((s) => s.setSearchQuery);

  const filteredExercises = useExerciseStore((s) => s.filteredExercises);

  const categories = useExerciseStore((s) => s.categories);

  const loadCategories = useExerciseStore((s) => s.loadCategories);

  const selectedCategory = useExerciseStore((s) => s.selectedCategory);

  const setSelectedCategory = useExerciseStore((s) => s.setSelectedCategory);

  const { selected, toggleSelect, existingIds } =
    useExerciseSelection(draftExercises);

  React.useEffect(() => {
    if (exercises.length === 0) {
      loadExercises();
      loadCategories();
    }
  }, []);

  const displayExercises = React.useMemo(
    () => filteredExercises(),
    [filteredExercises, exercises, searchQuery, selectedCategory]
  );

  const handleContinue = () => {
    const newExercises = displayExercises
      .filter((e) => selected.has(e.id))
      .map(exerciseToProgram);

    addDraftExercises(newExercises);
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    const newExercises = displayExercises
      .filter((e) => selected.has(e.id))
      .map(exerciseToProgram);

    const allExercises = [...draftExercises, ...newExercises];

    addProgram({
      name: draftTitle || 'New Program',
      tag: draftTag || 'HIIT',
      description: draftDescription,
      exercises: allExercises,
      videoCount: allExercises.length,
      views: 0,
      likes: 0,
      price: '$5/month',
    });
    resetDraft();
    navigation.navigate('TrainingLibrary');
  };

  const renderExercise = React.useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseGridItem
        item={item}
        isSelected={selected.has(item.id) || existingIds.has(item.id)}
        isExisting={existingIds.has(item.id)}
        onPress={() => toggleSelect(item.id)}
      />
    ),
    [selected, existingIds, toggleSelect]
  );

  const renderHeader = () => (
    <CategoryFilterBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    />
  );

  const renderFooter = () =>
    loadingMore ? (
      <ActivityIndicator color={colors.accent} style={styles.loadingMore} />
    ) : null;

  // Initial load only: errors/spinners during pagination are handled in-list.
  const status: AsyncStatus = loading
    ? 'loading'
    : error && exercises.length === 0
      ? 'error'
      : 'success';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Gallery"
        rightElement={
          <TouchableOpacity>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <AsyncBoundary
        status={status}
        error={error}
        onRetry={loadExercises}
        errorTitle="Failed to load exercises"
      >
        {/* Empty handled in-list so the search/filter header stays visible. */}
        <FlatList
          data={displayExercises}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderExercise}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
        />
      </AsyncBoundary>
      {status === 'success' && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 80 },
          ]}
        >
          <Button
            title="Save"
            onPress={handleContinue}
            disabled={selected.size === 0 && draftExercises.length === 0}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 200,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.screenBg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral3,
  },
  loadingMore: {
    marginBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
