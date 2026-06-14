import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Card, SearchInput, EmptyState } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';
import type { TrainingProgram } from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TrainingLibrary'>;

export function TrainingLibraryScreen() {
  const navigation = useNavigation<Nav>();
  const programs = useProgramsStore((s) => s.programs);
  const searchPrograms = useProgramsStore((s) => s.searchPrograms);
  const deleteProgram = useProgramsStore((s) => s.deleteProgram);

  const [search, setSearch] = React.useState('');

  const filteredPrograms = React.useMemo(
    () => searchPrograms(search),
    [search, searchPrograms],
  );

  const handleEdit = (p: TrainingProgram) => {
    navigation.navigate('AddToLibraryForm', { program: p });
  };

  const handleCreateSession = (p: TrainingProgram) => {
    navigation.navigate('SessionForm', {});
  };

  const handleDelete = (p: TrainingProgram) => {
    Alert.alert(
      'Delete program',
      `Delete "${p.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProgram(p.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Training Library"
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('AddToLibraryForm')}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          style={styles.search}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPrograms.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="No programs yet"
            subtitle={
              search
                ? 'No programs match your search.'
                : 'Add your first program to get started.'
            }
            actionLabel={search ? undefined : 'Add program'}
            onAction={search ? undefined : () => navigation.navigate('AddToLibraryForm')}
          />
        ) : (
          filteredPrograms.map((p) => (
            <Card key={p.id} style={styles.programCard}>
              <View style={styles.thumbWrap}>
                {p.thumbnail ? (
                  <Image source={{ uri: p.thumbnail }} style={styles.thumbImg} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </View>
              <View style={styles.programContent}>
                <Text style={styles.programName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.programMeta}>
                  {`${p.videoCount} videos`}{p.price ? ` \u00B7 ${p.price}` : ''}
                </Text>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.statText}>{p.views}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.statText}>{p.likes}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(p)}>
                    <Ionicons name="create-outline" size={16} color={colors.neutral9} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleCreateSession(p)}>
                    <Ionicons name="calendar-outline" size={16} color={colors.neutral9} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p)}>
                    <Ionicons name="trash-outline" size={16} color={colors.Error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  search: {
    height: 40,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  programCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  thumbWrap: {
    width: 120,
    height: 120,
    borderRadius: 0,
    overflow: 'hidden',
  },
  thumbImg: {
    width: 120,
    height: 120,
  },
  thumbPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.neutral1,
  },
  programContent: {
    flex: 1,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    justifyContent: 'center',
  },
  programName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  programMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius['2xl'],
  },
  emptyBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
