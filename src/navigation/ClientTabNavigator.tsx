import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, type RouteProp } from '@react-navigation/native';
import type { ClientTabParamList } from './types';
import theme from '../theme';
const { colors, radius } = theme;
import { HomeTabIcon, ProfileTabIcon, ChatTabIcon, StatsTabIcon, TrainTabIcon } from '../components/icons/TabBarIcons';

import { ChatStackNavigator } from './ChatStackNavigator';
import { ClientHomeStackNavigator } from './client/ClientHomeStackNavigator';
import { TrainersStackNavigator } from './client/TrainersStackNavigator';
import { ProgressStackNavigator } from './client/ProgressStackNavigator';
import { TrainStackNavigator } from './client/TrainStackNavigator';
import { useChatStore } from '../store/chatStore';

const Tab = createBottomTabNavigator<ClientTabParamList>();

function TabBarBackground() {
  return (
    <View style={styles.tabBarBackground}>
      <BlurView
        intensity={80}
        tint="dark"
        style={StyleSheet.absoluteFill}
        {...(Platform.OS === 'android' && { experimentalBlurMethod: 'dimezisBlurView' as const })}
      />
      <View style={[StyleSheet.absoluteFill, styles.tabBarOverlay]} />
    </View>
  );
}

const TAB_BAR_BASE_HEIGHT = 60;

function ChatTabIconWithBadge({ color, focused }: { color: string; focused: boolean }) {
  const unreadCount = useChatStore((s) => s.getUnreadCount());
  return (
    <View style={styles.chatIconWrap}>
      <ChatTabIcon color={color} focused={focused} />
      {unreadCount > 0 && <View style={styles.chatBadge} />}
    </View>
  );
}

const CHAT_FULLSCREEN_ROUTES = ['ChatThread', 'NewChat'];

export function ClientTabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const baseTabBarStyle = [
    styles.tabBar,
    { height: tabBarHeight, paddingBottom: insets.bottom },
  ];

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: baseTabBarStyle,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.neutral8,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="ClientHomeTab"
        component={ClientHomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => <HomeTabIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TrainersTab"
        component={TrainersStackNavigator}
        options={{
          tabBarLabel: 'Trainers',
          tabBarIcon: ({ focused, color }) => <ProfileTabIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TrainTab"
        component={TrainStackNavigator}
        options={{
          tabBarLabel: 'Train',
          tabBarIcon: ({ focused, color }) => <TrainTabIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route as RouteProp<ClientTabParamList>) ?? '';
          return {
            tabBarLabel: 'Chat',
            tabBarIcon: ({ focused: tabFocused, color }) => (
              <ChatTabIconWithBadge color={color} focused={tabFocused} />
            ),
            tabBarStyle: CHAT_FULLSCREEN_ROUTES.includes(focused)
              ? [...baseTabBarStyle, styles.tabBarHidden]
              : baseTabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressStackNavigator}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused, color }) => <StatsTabIcon color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 8,
  },
  tabBarHidden: { display: 'none' },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  tabBarOverlay: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(29,29,29,0.35)' : 'rgba(29,29,29,0.92)',
  },
  tabBarLabel: { fontSize: 12, fontWeight: '400', lineHeight: 20 },
  tabBarIcon: { marginBottom: 2 },
  tabBarItem: { justifyContent: 'center', alignItems: 'center' },
  chatIconWrap: { position: 'relative' },
  chatBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary7,
  },
});
