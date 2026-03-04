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
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card, SearchInput, ProgramOptionsMenu } from '../../components/ui';
import type { ProgramOptionAction } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useProgramsStore } from '../../store/programsStore';
import type { TrainingProgram } from '../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TrainingLibrary'>;

export function TrainingLibraryScreen() {
  const navigation = useNavigation<Nav>();
  const programs = useProgramsStore((s) => s.programs);
  const searchPrograms = useProgramsStore((s) => s.searchPrograms);
  const deleteProgram = useProgramsStore((s) => s.deleteProgram);

  const [search, setSearch] = React.useState('');
  const [optionsProgram, setOptionsProgram] = React.useState<TrainingProgram | null>(null);

  const filteredPrograms = React.useMemo(
    () => searchPrograms(search),
    [search, searchPrograms]
  );

  const handleProgramOption = (action: ProgramOptionAction) => {
    if (!optionsProgram) return;
    if (action === 'edit') {
      navigation.navigate('AddToLibraryForm', { program: optionsProgram });
    } else if (action === 'create-session') {
      navigation.navigate('CardioClassForm', { program: optionsProgram });
    } else if (action === 'delete') {
      Alert.alert(
        'Delete program',
        `Delete "${optionsProgram.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setOptionsProgram(null) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteProgram(optionsProgram.id);
              setOptionsProgram(null);
            },
          },
        ]
      );
      return;
    }
    setOptionsProgram(null);
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
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No programs yet</Text>
            <Text style={styles.emptySub}>
              {search ? 'No programs match your search.' : 'Add your first program to get started.'}
            </Text>
            {!search && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddToLibraryForm')}
              >
                <Text style={styles.emptyBtnText}>Add program</Text>
              </TouchableOpacity>
            )}
          </View>
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
                <View style={styles.programHeader}>
                  <Text style={styles.programName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOptionsProgram(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.programMeta}>
                  {p.videoCount} videos{p.price ? ` · ${p.price}` : ''}
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
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <ProgramOptionsMenu
        visible={!!optionsProgram}
        onClose={() => setOptionsProgram(null)}
        onSelect={handleProgramOption}
      />
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
    backgroundColor: colors.Secondary1,
  },
  programContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    flex: 1,
  },
  programMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
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
    backgroundColor: colors.Accent1,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
