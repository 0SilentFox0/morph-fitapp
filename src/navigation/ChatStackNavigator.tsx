import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ScreenBackground } from '../components/layout';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ChatThreadScreen } from '../screens/chat/ChatThreadScreen';
import { NewChatScreen } from '../screens/chat/NewChatScreen';
import type { ChatStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenLayout={({ children }) => (
        <ScreenBackground>{children}</ScreenBackground>
      )}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
    </Stack.Navigator>
  );
}
