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
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { SearchInput, Avatar } from '../../components/ui';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;
import { useChatStore } from '../../store/chatStore';
import { searchByName } from '../../utils';
import { mockClients } from '../../mocks';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'NewChat'>;

export function NewChatScreen() {
  const navigation = useNavigation<Nav>();
  const getOrCreateConversation = useChatStore((s) => s.getOrCreateConversation);
  const [search, setSearch] = React.useState('');

  const filteredClients = React.useMemo(() => searchByName(search, mockClients), [search]);

  const handleSelectClient = (clientId: string, name: string) => {
    const conv = getOrCreateConversation(clientId, {
      id: clientId,
      name,
      tint: 'primary',
    });
    // Replace this screen so Back returns to the chat list, not the picker.
    navigation.replace('ChatThread', { conversationId: conv.id });
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
            <Avatar name={client.name} tint="primary" size={48} />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientTag}>{client.tag}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  search: {
    height: 40,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.sm,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.sm + 2,
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
  },
  clientName: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.neutral9,
  },
  clientTag: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
