import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Button, SearchInput } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';
import { useDraftProgramStore } from '../../../store/draftProgramStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import type { ProgramExercise } from '../../../mocks';
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

  const existingIds = React.useMemo(
    () => new Set(draftExercises.map((e) => e.id)),
    [draftExercises],
  );

  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (exercises.length === 0) {
      loadExercises();
      loadCategories();
    }
  }, []);

  const toggleSelect = (id: number) => {
    if (existingIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayExercises = React.useMemo(
    () => filteredExercises(),
    [filteredExercises, exercises, searchQuery, selectedCategory],
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

  const renderExercise = ({ item }: { item: Exercise }) => {
    const isSelected = selected.has(item.id) || existingIds.has(item.id);
    const isExisting = existingIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.gridItem, isExisting && styles.gridItemExisting]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.gridThumb}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gridPlaceholder}>
              <Ionicons name="barbell-outline" size={28} color={colors.neutral5} />
            </View>
          )}
          {isSelected && (
            <View
              style={[
                styles.checkbox,
                isExisting && styles.checkboxExisting,
              ]}
            >
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.gridOverlay}>
            <Text style={styles.gridName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.gridMeta}>
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={10} color={colors.neutral9} />
                <Text style={styles.metaText}>12m</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{item.category}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.searchWrapper}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          style={styles.search}
        />
      </View>
      {categories.length > 0 && (
        <FlatList
          horizontal
          data={[{ id: 0, name: 'All' }, ...categories]}
          keyExtractor={(c) => String(c.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item: cat }) => {
            const active =
              cat.id === 0 ? selectedCategory === null : selectedCategory === cat.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() =>
                  setSelectedCategory(cat.id === 0 ? null : cat.id)
                }
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );

  const renderFooter = () =>
    loadingMore ? (
      <ActivityIndicator color={colors.accent} style={styles.loadingMore} />
    ) : null;

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
  searchWrapper: {
    marginBottom: spacing.md,
  },
  search: {
    height: 40,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 200,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  gridThumb: {
    width: '100%',
    aspectRatio: 0.93,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  gridName: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  gridMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 10,
    color: colors.neutral9,
  },
  checkbox: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxExisting: {
    backgroundColor: colors.Success,
  },
  gridItemExisting: {
    opacity: 0.7,
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
