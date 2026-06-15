import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/layout';
import {
  Avatar,
  EmptyState,
  MessageReceipt,
  SearchInput,
} from '../../components/ui';
import type { ChatStackParamList } from '../../navigation/types';
import theme from '../../theme';

const { colors, radius, typography, spacing } = theme;

import { useChatStore } from '../../store/chatStore';
import { formatRelativeTime } from '../../utils';

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
          placeholder="Search"
          style={styles.search}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            subtitle={
              search
                ? 'No conversations match your search.'
                : 'Start a chat with a client to get started.'
            }
            actionLabel={search ? undefined : 'New chat'}
            onAction={search ? undefined : () => navigation.navigate('NewChat')}
          />
        ) : (
          filtered.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={styles.convCard}
              onPress={() =>
                navigation.navigate('ChatThread', { conversationId: conv.id })
              }
              activeOpacity={0.7}
            >
              <Avatar
                name={conv.participant.name}
                uri={conv.participant.avatar}
                tint={conv.participant.tint}
                size={48}
              />
              <View style={styles.convContent}>
                <View style={styles.convHeader}>
                  <Text style={styles.convName} numberOfLines={1}>
                    {conv.participant.name}
                  </Text>
                  {conv.lastMessageAt && (
                    <Text style={styles.convTime}>
                      {formatRelativeTime(conv.lastMessageAt)}
                    </Text>
                  )}
                </View>
                <View style={styles.convFooter}>
                  <Text style={styles.convPreview} numberOfLines={1}>
                    {conv.lastMessagePreview}
                  </Text>
                  {conv.unreadCount > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </Text>
                    </View>
                  ) : conv.lastMessageFromMe && conv.lastMessageStatus ? (
                    <MessageReceipt status={conv.lastMessageStatus} size={20} />
                  ) : null}
                </View>
              </View>
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
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.sm + 2,
  },
  convContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.neutral9,
    flex: 1,
  },
  convTime: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  convFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convPreview: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textMuted,
  },
  unreadBadge: {
    minWidth: 29,
    paddingHorizontal: spacing.xs,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.white,
    textAlign: 'center',
  },
});
