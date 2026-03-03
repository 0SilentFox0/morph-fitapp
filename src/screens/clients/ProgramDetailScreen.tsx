import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../components/layout';
import { colors } from '../../theme/colors';

export function ProgramDetailScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Program Detail" />
      <Text style={styles.placeholder}>Program details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholder: {
    color: colors.text,
    padding: 20,
  },
});
