import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card, Tag, Avatar } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ClientProfile'>;

const PROGRAMS = ['Program 1', 'Program 2', 'Program 3'];
const EXERCISES = [
  { name: 'Exercise 1', duration: '15 min' },
  { name: 'Exercise 2', duration: '20 min' },
  { name: 'Exercise 3', duration: '10 min' },
];

export function ClientProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [activeProgram, setActiveProgram] = React.useState(0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Brooklyn Simmons"
        rightElement={
          <TouchableOpacity>
            <Ionicons name="person" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar name="Brooklyn Simmons" size={80} />
          <Text style={styles.clientName}>Brooklyn Simmons</Text>
          <Text style={styles.status}>Active Group</Text>
        </View>

        <View style={styles.programTabs}>
          {PROGRAMS.map((p, i) => (
            <TouchableOpacity
              key={p}
              onPress={() => setActiveProgram(i)}
              style={[
                styles.programTab,
                i === activeProgram && styles.programTabActive,
              ]}
            >
              <Text
                style={[
                  styles.programTabText,
                  i === activeProgram && styles.programTabTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.programCard}>
          <View style={styles.programHeader}>
            <Text style={styles.programName}>Name</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.programDesc}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
          <View style={styles.tagsRow}>
            <Tag label="Active" variant="accent" />
            <Tag label="HIT" variant="default" />
          </View>
          {EXERCISES.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={styles.exerciseRow}
              onPress={() => navigation.navigate('ExerciseDetail')}
            >
              <View style={styles.exerciseThumb} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseDuration}>{ex.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  clientName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  status: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  programTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  programTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.Secondary2,
  },
  programTabActive: {
    backgroundColor: colors.Accent1,
  },
  programTabText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  programTabTextActive: {
    color: '#FFFFFF',
  },
  programCard: {
    marginBottom: spacing.lg,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  programName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  programDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.Secondary1,
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  exerciseDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
