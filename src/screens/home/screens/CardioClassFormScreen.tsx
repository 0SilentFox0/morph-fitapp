import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button, Avatar } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CardioClassForm'>;
type Route = RouteProp<HomeStackParamList, 'CardioClassForm'>;

const CLIENTS = [
  { id: 'c1', name: 'Darrell Steward' },
  { id: 'c2', name: 'Theresa Webb' },
  { id: 'c3', name: 'Bessie Cooper' },
  { id: 'c4', name: 'Wade Warren' },
  { id: 'c5', name: 'Guy Hawkins' },
  { id: 'c6', name: 'Arlene McCoy' },
];

export function CardioClassFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;
  const addSession = useSessionsStore((s) => s.addSession);

  const [title, setTitle] = React.useState(program?.name ?? 'Cardio Class');
  const [type, setType] = React.useState(program?.tag ?? 'Cardio');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [price, setPrice] = React.useState('40');
  const [selectedClients, setSelectedClients] = React.useState<Set<string>>(new Set());
  const [titleError, setTitleError] = React.useState('');

  const toggleClient = (id: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    if (title.trim().length < 2) {
      setTitleError('Title must be at least 2 characters');
      return;
    }
    const participants = CLIENTS.filter((c) => selectedClients.has(c.id)).map((c) => ({
      id: c.id,
      name: c.name,
    }));
    addSession({
      title: title.trim(),
      type,
      date: date || 'Today',
      time: time || '12:00',
      status: 'pending',
      participants,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={title || 'Cardio Class'}
        rightElement={
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share">
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>About</Text>
        <Input
          placeholder="Class name"
          value={title}
          onChangeText={(t) => { setTitle(t); setTitleError(''); }}
          accessibilityLabel="Class name"
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        <Input placeholder="Type" value={type} onChangeText={setType} accessibilityLabel="Type" />
        <Input
          placeholder="Description..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          accessibilityLabel="Description"
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <TouchableOpacity style={styles.uploadArea} accessibilityRole="button" accessibilityLabel="Upload photo">
          <Ionicons name="camera" size={40} color={colors.textMuted} />
          <Text style={styles.uploadText}>Tap to upload photo</Text>
          <Text style={styles.uploadHint}>Recommended size: square, min 500x500px</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Date and time</Text>
        <Input
          placeholder="Date (e.g. 04/10/2026)"
          value={date}
          onChangeText={setDate}
          rightIcon={<Ionicons name="calendar" size={20} color={colors.textMuted} />}
          accessibilityLabel="Date"
        />
        <Input
          placeholder="Time (e.g. 14:00)"
          value={time}
          onChangeText={setTime}
          rightIcon={<Ionicons name="time" size={20} color={colors.textMuted} />}
          accessibilityLabel="Time"
        />

        <Text style={styles.sectionTitle}>Clients</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clientsRow}
        >
          {CLIENTS.map((client) => {
            const isSelected = selectedClients.has(client.id);
            return (
              <TouchableOpacity
                key={client.id}
                style={styles.clientItem}
                onPress={() => toggleClient(client.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={client.name}
              >
                <View style={[styles.clientAvatarWrap, isSelected && styles.clientAvatarSelected]}>
                  <Avatar name={client.name} size={48} />
                </View>
                <Text style={styles.clientName} numberOfLines={1}>
                  {client.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Price per class</Text>
        <Input
          placeholder="$ 40"
          value={`$ ${price}`}
          onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          accessibilityLabel="Price"
        />

        <Button title="Apply" onPress={handleApply} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['2xl'] },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  uploadArea: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  uploadText: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.sm },
  uploadHint: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: spacing.xs },
  clientsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  clientItem: { alignItems: 'center' },
  clientAvatarWrap: { borderRadius: 24, borderWidth: 2, borderColor: 'transparent' },
  clientAvatarSelected: { borderColor: colors.accent },
  clientName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 60,
  },
  button: { marginTop: spacing.lg },
  errorText: { fontSize: typography.sizes.xs, color: colors.Error, marginTop: spacing.xs },
});
