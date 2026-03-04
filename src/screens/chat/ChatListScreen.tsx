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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useChatStore, formatTime } from '../../store/chatStore';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  // Subscribe to conversations so list updates when new chats are added
  useChatStore((s) => s.conversations);
  const searchConversations = useChatStore((s) => s.searchConversations);

  const [search, setSearch] = React.useState('');
  const filtered = React.useMemo(
    () => searchConversations(search),
    [search, searchConversations]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Chat"
        showBack={false}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('NewChat')}>
            <Ionicons name="create-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations"
          style={styles.search}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              {search ? 'No conversations match your search.' : 'Start a chat with a client to get started.'}
            </Text>
            {!search && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('NewChat')}
              >
                <Text style={styles.emptyBtnText}>New chat</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={styles.convCard}
              onPress={() => navigation.navigate('ChatThread', { conversationId: conv.id })}
              activeOpacity={0.7}
            >
              <Avatar
                name={conv.participant.name}
                uri={conv.participant.avatar}
                size={48}
              />
              <View style={styles.convContent}>
                <View style={styles.convHeader}>
                  <Text style={styles.convName} numberOfLines={1}>
                    {conv.participant.name}
                  </Text>
                  {conv.lastMessage && (
                    <Text style={styles.convTime}>
                      {formatTime(conv.lastMessage.sentAt)}
                    </Text>
                  )}
                </View>
                {conv.lastMessage && (
                  <Text style={styles.convPreview} numberOfLines={1}>
                    {conv.lastMessage.isFromMe ? 'You: ' : ''}{conv.lastMessage.text}
                  </Text>
                )}
              </View>
              {conv.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  convContent: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    flex: 1,
  },
  convTime: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  convPreview: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.Accent1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.Accent1,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
