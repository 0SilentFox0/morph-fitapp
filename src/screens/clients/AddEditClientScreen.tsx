import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/layout';
import { Button, FormInput, Segmented } from '../../components/ui';
import type { ClientsStackParamList } from '../../navigation/types';
import * as clientsApi from '../../services/api/clients';
import {
  CLIENT_TYPES,
  createClient,
  updateClient,
} from '../../services/clientsService';
import theme from '../../theme';

const { colors, typography, spacing } = theme;

const TYPE_LABELS = ['Personal', 'Group', 'Online'];

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'AddEditClient'>;
type ClientRoute = RouteProp<ClientsStackParamList, 'AddEditClient'>;

export function AddEditClientScreen() {
  const navigation = useNavigation<Nav>();

  const route = useRoute<ClientRoute>();

  const insets = useSafeAreaInsets();

  const clientId = route.params?.clientId;

  const isEdit = Boolean(clientId);

  const [name, setName] = React.useState('');

  const [typeIndex, setTypeIndex] = React.useState(0);

  const [email, setEmail] = React.useState('');

  const [phone, setPhone] = React.useState('');

  const [notes, setNotes] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  // Edit mode: prefill from the backend client record.
  React.useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    clientsApi
      .getClient(clientId)
      .then((res) => {
        if (cancelled) return;

        const c = res.data;

        const idx = CLIENT_TYPES.indexOf(c.type);

        setName(c.name);
        setTypeIndex(idx >= 0 ? idx : 0);
        setEmail(c.email ?? '');
        setPhone(c.phone ?? '');
        setNotes(c.notes ?? '');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this client');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const form = {
        name,
        type: CLIENT_TYPES[typeIndex]!,
        email,
        phone,
        notes,
      };

      if (clientId) {
        await updateClient(clientId, form);
      } else {
        await createClient(form);
      }

      navigation.goBack();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not save the client'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={isEdit ? 'Edit Client' : 'Add Client'} transparent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Name</Text>
        <FormInput
          placeholder="Client name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Type</Text>
        <Segmented
          options={TYPE_LABELS.map((label) => ({ label }))}
          value={typeIndex}
          onChange={setTypeIndex}
        />

        <Text style={styles.label}>Email</Text>
        <FormInput
          placeholder="Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <FormInput
          placeholder="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Notes</Text>
        <FormInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing.md) + spacing.tabBarInset,
          },
        ]}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={isEdit ? 'Save Changes' : 'Add Client'}
          onPress={handleSave}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.Error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
