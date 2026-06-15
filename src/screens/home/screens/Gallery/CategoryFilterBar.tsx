import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchInput } from '../../../../components/ui';
import theme from '../../../../theme';
const { colors, typography, spacing, radius } = theme;
import type { ExerciseCategory } from '../../../../services/exerciseApi';

export interface CategoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: ExerciseCategory[];
  selectedCategory: number | null;
  onCategoryChange: (id: number | null) => void;
}

export function CategoryFilterBar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  return (
    <View>
      <View style={styles.searchWrapper}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search"
          style={styles.search}
        />
      </View>
      {categories.length > 0 && (
        <FlatList
          horizontal
          data={[{ id: 0, name: 'All' } as ExerciseCategory, ...categories]}
          keyExtractor={(c) => String(c.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item: cat }) => {
            const active =
              cat.id === 0 ? selectedCategory === null : selectedCategory === cat.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => onCategoryChange(cat.id === 0 ? null : cat.id)}
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
}

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  search: {
    height: 40,
  },
  categoryRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral2,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
});
