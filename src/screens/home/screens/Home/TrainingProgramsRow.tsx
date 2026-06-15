import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SectionTitle } from '../../../../components/ui';
import theme from '../../../../theme';
const { colors, typography, spacing, radius } = theme;
import type { TrainingProgram } from '../../../../types';

export interface TrainingProgramsRowProps {
  programs: TrainingProgram[];
  onProgramPress: () => void;
  onSeeAll: () => void;
  onEmptyPress: () => void;
}

export function TrainingProgramsRow({
  programs,
  onProgramPress,
  onSeeAll,
  onEmptyPress,
}: TrainingProgramsRowProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SectionTitle style={styles.sectionTitleSpacing}>Training Templates</SectionTitle>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {programs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {programs.slice(0, 5).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={onProgramPress}
              activeOpacity={0.9}
            >
              <View style={styles.thumb}>
                {p.thumbnail ? (
                  <Image source={{ uri: p.thumbnail }} style={styles.image} resizeMode="cover" />
                ) : null}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>{p.videoCount} videos</Text>
                <View style={styles.stats}>
                  <View style={styles.statPill}>
                    <Ionicons name="people" size={12} color={colors.text} />
                    <Text style={styles.statText}>{p.views}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Ionicons name="eye" size={12} color={colors.text} />
                    <Text style={styles.statText}>{p.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity style={styles.empty} onPress={onEmptyPress} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>Add your first training program</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleSpacing: {
    marginBottom: 0,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  scroll: {
    gap: spacing.md,
  },
  card: {
    width: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral2,
  },
  thumb: {
    width: '100%',
    height: 96,
    backgroundColor: colors.neutral3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  meta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
