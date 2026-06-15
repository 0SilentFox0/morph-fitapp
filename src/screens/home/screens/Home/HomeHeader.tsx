import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../../../../components/ui';
import theme from '../../../../theme';

const { colors, radius, typography, spacing } = theme;

export interface HomeHeaderProps {
  userName: string | null;
  points: number;
  showNotifDot: boolean;
  onProfilePress: () => void;
}

/** Home dashboard top bar: profile shortcut, points pill, notifications. */
export function HomeHeader({
  userName,
  points,
  showNotifDot,
  onProfilePress,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  const name = userName || 'Trainer';

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, spacing.md),
          paddingHorizontal: Math.max(insets.left, spacing.lg),
          paddingRight: Math.max(insets.right, spacing.lg),
        },
      ]}
    >
      <TouchableOpacity
        onPress={onProfilePress}
        style={styles.profileLeft}
        accessibilityRole="button"
        accessibilityLabel="View profile"
      >
        <Avatar name={name} size={48} />
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <View style={styles.pointsBtn}>
          <Text style={styles.pointsText}>{points}</Text>
          <Ionicons name="sparkles" size={20} color={colors.text} />
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications" size={24} color={colors.text} />
          {showNotifDot && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pointsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    minWidth: 62,
  },
  notifBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.accent,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  greeting: {
    fontSize: typography.sizes.xs,
    color: colors.neutral7,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
