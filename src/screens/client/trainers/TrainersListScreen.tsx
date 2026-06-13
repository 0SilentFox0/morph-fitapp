import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { TrainersStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { SearchInput, Avatar, Tag, EmptyState } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainersStore } from '../../../store/trainersStore';
import type { Trainer } from '../../../mocks';

type Nav = NativeStackNavigationProp<TrainersStackParamList, 'TrainersList'>;

export function TrainersListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = React.useState('');
  const visibleTrainers = useTrainersStore((s) => s.visibleTrainers);
  // Subscribe to the slices that change so the list re-renders on filter/connect.
  useTrainersStore((s) => s.filterSpecialty);
  useTrainersStore((s) => s.onlineOnly);
  useTrainersStore((s) => s.trainers);
  const activeFilters = useTrainersStore((s) => s.activeFilterCount());

  const results = visibleTrainers(query);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Find a trainer"
        showBack={false}
        transparent
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('TrainerFilters')}>
            <View>
              <Ionicons name="options-outline" size={22} color={colors.text} />
              {activeFilters > 0 && <View style={styles.filterDot} />}
            </View>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrap}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search by name or specialty" />
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState icon="search-outline" title="No trainers found" subtitle="Try a different search or clear filters." />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {results.map((t) => (
            <TrainerCard
              key={t.id}
              trainer={t}
              onPress={() => navigation.navigate('TrainerProfile', { trainerId: t.id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function TrainerCard({ trainer, onPress }: { trainer: Trainer; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Avatar name={trainer.name} size={52} />
      <View style={styles.cardMain}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{trainer.name}</Text>
          {trainer.connection === 'connected' && (
            <Ionicons name="checkmark-circle" size={16} color={colors.Success} />
          )}
          {trainer.connection === 'pending' && (
            <Ionicons name="time-outline" size={16} color={colors.Warning} />
          )}
        </View>
        <Text style={styles.headline} numberOfLines={1}>{trainer.headline}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={colors.accent} />
          <Text style={styles.metaText}>
            {trainer.rating.toFixed(1)} ({trainer.reviews}) · {trainer.pricePerSession}
          </Text>
        </View>
        <View style={styles.tagsRow}>
          {trainer.specialties.slice(0, 3).map((s) => (
            <Tag key={s} label={s} variant="default" />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardMain: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  headline: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.sizes.xs, color: colors.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 },
});
