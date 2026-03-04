import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { SearchInput, Avatar } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useChatStore } from '../../store/chatStore';
import { mockClients } from '../../mocks';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'NewChat'>;

export function NewChatScreen() {
  const navigation = useNavigation<Nav>();
  const getOrCreateConversation = useChatStore((s) => s.getOrCreateConversation);
  const [search, setSearch] = React.useState('');

  const filteredClients = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockClients;
    return mockClients.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelectClient = (clientId: string, name: string) => {
    const conv = getOrCreateConversation(clientId, {
      id: clientId,
      name,
      avatar: undefined,
    });
    navigation.navigate('ChatThread', { conversationId: conv.id });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="New chat" />

      <View style={styles.searchWrapper}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search clients"
          style={styles.search}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={styles.clientRow}
            onPress={() => handleSelectClient(client.id, client.name)}
            activeOpacity={0.7}
          >
            <Avatar name={client.name} uri={client.avatar} size={48} />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientTag}>{client.tag}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  search: {
    height: 40,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    marginBottom: spacing.sm,
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
  clientTag: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
});
