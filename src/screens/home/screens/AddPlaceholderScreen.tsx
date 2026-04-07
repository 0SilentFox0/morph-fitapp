import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export function AddPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add</Text>
      <Text style={styles.subtext}>Create new session or program</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtext: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
