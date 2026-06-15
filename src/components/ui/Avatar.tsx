import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import theme from '../../theme';
const { colors, typography } = theme;

/** Tinted initials placeholders used by the chat list, per Figma node 2006:10239. */
export type AvatarTint = 'primary' | 'blue' | 'success';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  /** Color scheme for the initials placeholder when there is no photo. */
  tint?: AvatarTint;
}

const TINTS: Record<AvatarTint, { bg: string; fg: string }> = {
  primary: { bg: colors.primary2, fg: colors.primary9 },
  blue: { bg: colors.blue2, fg: colors.blue9 },
  success: { bg: colors.success1, fg: colors.success9 },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ uri, name = '?', size = 40, tint }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  const placeholderStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const initialsStyle: TextStyle = { fontSize: size * 0.4 };

  if (tint) {
    const scheme = TINTS[tint];
    return (
      <View style={[styles.placeholder, placeholderStyle, { backgroundColor: scheme.bg }]}>
        <Text style={[styles.initials, initialsStyle, { color: scheme.fg }]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.placeholder, placeholderStyle]}>
      <Text style={[styles.initials, initialsStyle]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.neutral2,
  },
  placeholder: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});
