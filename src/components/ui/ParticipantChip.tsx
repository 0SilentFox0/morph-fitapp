import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Participant chip per Figma (Component 1): avatar + name in pill,
 * bg rgba(255,255,255,0.05), borderRadius 80, optional remove icon.
 */
export interface ParticipantChipProps {
  name: string;
  avatarUri?: string | null;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
}

export function ParticipantChip({
  name,
  avatarUri,
  selected = false,
  onPress,
  onRemove,
  style,
}: ParticipantChipProps) {
  const content = (
    <>
      <Avatar name={name} uri={avatarUri} size={24} />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={8}
          style={styles.removeBtn}
        >
          <Ionicons name="close" size={16} color={colors.neutral9} />
        </TouchableOpacity>
      ) : null}
    </>
  );

  const wrapperStyle = [
    styles.wrapper,
    selected && styles.wrapperSelected,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={[wrapperStyle, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[wrapperStyle, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 8,
    borderRadius: 80,
  },
  wrapperSelected: {
    opacity: 1,
  },
  name: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: typography.weights.normal as '400',
    color: colors.neutral9,
    maxWidth: 120,
  },
  removeBtn: {
    padding: 2,
  },
});
