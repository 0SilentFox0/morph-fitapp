import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Search input per Figma 1-11042: height 40, bg #141414, border #434343,
 * borderRadius 8, placeholder #7D7D7D, 16px | 24px, search icon right.
 */
export interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search',
  style,
}: SearchInputProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral7}
        value={value}
        onChangeText={onChangeText}
      />
      <Ionicons name="search" size={24} color={colors.neutral9} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 40,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 40,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: typography.weights.normal as '400',
    color: colors.text,
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: 8,
  },
});
