import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ClientTabParamList } from './types';
import { colors } from '../theme/colors';
import { radius } from '../theme';
import { HomeTabIcon, ProfileTabIcon, ChatTabIcon, StatsTabIcon } from '../components/icons/TabBarIcons';

import { ChatStackNavigator } from './ChatStackNavigator';
import { ClientHomeStackNavigator } from './client/ClientHomeStackNavigator';
import { TrainersStackNavigator } from './client/TrainersStackNavigator';
import { ProgressStackNavigator } from './client/ProgressStackNavigator';
import { makeClientPlaceholder } from '../screens/client/ClientPlaceholderScreen';
import { useChatStore } from '../store/chatStore';

const Tab = createBottomTabNavigator<ClientTabParamList>();

// The Add tab is never shown — the FAB intercepts the press and routes to the
// booking flow inside the Home stack (mirrors the trainer AddTab pattern).
const AddTabScreen = makeClientPlaceholder('Book a session', 'add');

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

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="add" size={20} color={colors.text} />
    </TouchableOpacity>
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
        name="ClientAddTab"
        component={AddTabScreen}
        options={({ navigation }) => {
          const nav = navigation as unknown as { navigate: (n: string, p: object) => void };
          const goToBooking = () => nav.navigate('ClientHomeTab', { screen: 'BookSession' });
          return {
            tabBarLabel: () => null,
            tabBarIcon: () => <AddButton onPress={goToBooking} />,
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as React.ComponentProps<typeof TouchableOpacity>)}
                onPress={goToBooking}
                activeOpacity={0.8}
              />
            ),
          };
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
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 96,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
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
