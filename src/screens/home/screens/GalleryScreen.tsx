import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Button } from '../../../components/ui';
import { CategoryFilterBar } from './Gallery/CategoryFilterBar';
import { ExerciseGridItem } from './Gallery/ExerciseGridItem';
import { useExerciseSelection } from './Gallery/useExerciseSelection';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';
import { useDraftProgramStore } from '../../../store/draftProgramStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import type { ProgramExercise } from '../../../types';
import type { Exercise } from '../../../services/exerciseApi';

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

  const { selected, toggleSelect, existingIds } = useExerciseSelection(draftExercises);

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
    const newExercises = displayExercises.filter((e) => selected.has(e.id)).map(exerciseToProgram);

    addDraftExercises(newExercises);
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    const newExercises = displayExercises.filter((e) => selected.has(e.id)).map(exerciseToProgram);

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
    loadingMore ? <ActivityIndicator color={colors.accent} style={styles.loadingMore} /> : null;

  if (loading) {
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </View>
    );
  }

  if (error && exercises.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Gallery" />
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>Failed to load exercises</Text>
          <Button title="Retry" onPress={loadExercises} style={styles.retryBtn} />
        </View>
      </View>
    );
  }

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
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}>
        <Button
          title="Save"
          onPress={handleContinue}
          disabled={selected.size === 0 && draftExercises.length === 0}
        />
      </View>
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
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  retryBtn: {
    marginTop: spacing.md,
    minWidth: 120,
  },
});
