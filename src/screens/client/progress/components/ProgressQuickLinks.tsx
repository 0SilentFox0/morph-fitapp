import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ProgressStackParamList } from '../../../../navigation/types';
import theme from '../../../../theme';

const { colors, radius, typography, spacing } = theme;

type Nav = NativeStackNavigationProp<
  ProgressStackParamList,
  'ProgressOverview'
>;

const QUICK_LINKS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof ProgressStackParamList;
}[] = [
  { label: 'My league', icon: 'ribbon-outline', route: 'League' },
  { label: 'Leaderboards', icon: 'podium-outline', route: 'Leaderboard' },
  {
    label: 'Exercise progress',
    icon: 'barbell-outline',
    route: 'ExerciseProgress',
  },
  { label: 'Training history', icon: 'time-outline', route: 'TrainingHistory' },
  {
    label: 'Personal records',
    icon: 'trophy-outline',
    route: 'PersonalRecords',
  },
  { label: 'Measurements', icon: 'analytics-outline', route: 'Measurements' },
  { label: 'Achievements', icon: 'medal-outline', route: 'Achievements' },
];

/** Grid of navigation shortcuts at the bottom of the progress overview. */
export function ProgressQuickLinks() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.linksGrid}>
      {QUICK_LINKS.map((link) => (
        <TouchableOpacity
          key={link.route}
          style={styles.linkCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(link.route as never)}
        >
          <Ionicons name={link.icon} size={22} color={colors.accent} />
          <Text style={styles.linkLabel}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linkCard: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  linkLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    flexShrink: 1,
  },
});
