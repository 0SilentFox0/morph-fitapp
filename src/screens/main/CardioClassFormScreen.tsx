import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Input, Button, Avatar } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CardioClassForm'>;
type Route = RouteProp<HomeStackParamList, 'CardioClassForm'>;

const CLIENTS = [
  'Darrell Steward',
  'Theresa Webb',
  'Bessie Cooper',
  'Wade Warren',
  'Guy Hawkins',
  'Arlene McCoy',
];

export function CardioClassFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={program?.name ?? 'Cardio Class'}
        rightElement={
          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>About</Text>
        <Input placeholder="Cardio Class" defaultValue={program?.name ?? 'Cardio Class'} />
        <Input placeholder="Cardio" defaultValue={program?.tag ?? 'Cardio'} />
        <Input
          placeholder="Lorem ipsum dolor sit amet..."
          defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <TouchableOpacity style={styles.uploadArea}>
          <Ionicons name="camera" size={40} color={colors.textMuted} />
          <Text style={styles.uploadText}>Tap to upload photo</Text>
          <Text style={styles.uploadHint}>
            Recommended size: square, min 500x500px
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Date and time</Text>
        <Input
          placeholder="03/15/2019"
          defaultValue="03/15/2019"
          rightIcon={<Ionicons name="calendar" size={20} color={colors.textMuted} />}
        />
        <Input
          placeholder="12:02"
          defaultValue="12:02"
          rightIcon={<Ionicons name="time" size={20} color={colors.textMuted} />}
        />

        <Text style={styles.sectionTitle}>Clients</Text>
        <Input placeholder="Search" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clientsRow}
        >
          {CLIENTS.map((name) => (
            <View key={name} style={styles.clientItem}>
              <Avatar name={name} size={48} />
              <Text style={styles.clientName} numberOfLines={1}>
                {name.split(' ')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Price per class</Text>
        <Input placeholder="@ 40" defaultValue="@ 40" />

        <Button
          title="Apply"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  uploadArea: {
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  uploadText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  uploadHint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  clientsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  clientItem: {
    alignItems: 'center',
  },
  clientName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 60,
  },
  button: {
    marginTop: spacing.lg,
  },
});
