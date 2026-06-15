import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Card, Tag, Avatar, AsyncBoundary } from '../../components/ui';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;
import { useAsyncResource } from '../../hooks/data/useAsyncResource';
import { loadClients } from '../../services/clientsService';
import { searchItems } from '../../utils';

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ClientsList'>;

export function ClientsListScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = React.useState('');
  const { data, status, error, refetch } = useAsyncResource(() => loadClients());

  const clients = React.useMemo(
    () => searchItems(search, data ?? [], (c) => [c.name, c.tag]),
    [search, data],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Filters')}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
      </View>

      <AsyncBoundary
        status={status}
        error={error}
        onRetry={refetch}
        errorTitle="Couldn't load clients"
        isEmpty={clients.length === 0}
        emptyLabel={search ? 'No clients match your search' : 'No clients yet'}
        emptyIcon="people-outline"
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {clients.map((client) => (
            <Card
              key={client.id}
              style={styles.clientCard}
              onPress={() => navigation.navigate('ClientsProfileExtended', { clientId: client.id })}
            >
              <Avatar name={client.name} size={48} />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                {client.lastSession ? (
                  <View style={styles.clientMeta}>
                    <Ionicons name="information-circle" size={16} color={colors.textMuted} />
                    <Text style={styles.clientDate}>{client.lastSession}</Text>
                  </View>
                ) : null}
              </View>
              <Tag label={client.tag} variant="accent" />
            </Card>
          ))}
        </ScrollView>
      </AsyncBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  search: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: 40,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clientInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  clientName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  clientDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
