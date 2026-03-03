import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card, Tag } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { mockTrainingPrograms } from '../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TrainingLibrary'>;

export function TrainingLibraryScreen() {
  const navigation = useNavigation<Nav>();

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
        <TextInput
          style={styles.search}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
        />
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockTrainingPrograms.map((p) => (
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
                <Text style={styles.programName}>{p.name}</Text>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Tag label={p.tag} variant="default" style={styles.tag} />
              <View style={styles.stats}>
                <Text style={styles.statText}>{p.views}</Text>
                <Text style={styles.statText}>{p.likes}</Text>
                <Text style={styles.statText}>{p.videoCount}m</Text>
              </View>
            </View>
          </Card>
        ))}
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
    position: 'relative',
  },
  search: {
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: 40,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  programCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  thumbImg: {
    width: 80,
    height: 80,
  },
  thumbPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.Secondary1,
  },
  programContent: {
    flex: 1,
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
  },
  tag: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
