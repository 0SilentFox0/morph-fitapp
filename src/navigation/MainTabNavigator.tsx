import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { colors } from '../theme/colors';
import { radius } from '../theme';
import { HomeTabIcon, ProfileTabIcon, ChatTabIcon, StatsTabIcon } from '../components/icons/TabBarIcons';

import { HomeStackNavigator } from './HomeStackNavigator';
import { ClientsStackNavigator } from './ClientsStackNavigator';
import { ChatStackNavigator } from './ChatStackNavigator';
import { AddPlaceholderScreen } from '../screens/home';
import { StatsStackNavigator } from './StatsStackNavigator';
import { useChatStore } from '../store/chatStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

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
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
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

// Pushed detail screens that should not sit under the floating tab bar — the
// thread's message bar would otherwise be hidden behind it.
const CHAT_FULLSCREEN_ROUTES = ['ChatThread', 'NewChat'];

// The live training screen uses the very bottom for its rest-timer controls,
// and the training summary has its own bottom tabs — neither should sit under
// the floating tab bar.
const CLIENTS_FULLSCREEN_ROUTES = ['ExerciseDetail', 'TrainingSummary'];

export function MainTabNavigator() {
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
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <HomeTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ClientsTab"
        component={ClientsStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route as RouteProp<MainTabParamList>) ?? '';
          return {
            tabBarLabel: 'Clients',
            tabBarIcon: ({ focused: tabFocused, color }) => (
              <ProfileTabIcon color={color} focused={tabFocused} />
            ),
            tabBarStyle: CLIENTS_FULLSCREEN_ROUTES.includes(focused)
              ? [...baseTabBarStyle, styles.tabBarHidden]
              : baseTabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddPlaceholderScreen}
        options={({ navigation }) => {
          // BottomTab → Stack screen nav: TS can't infer the nested param shape from
          // useNavigation here, so we cast the target. `as never` is the React Navigation
          // community-recommended escape for nested-navigator typing.
          const nav = navigation as unknown as { navigate: (n: string, p: object) => void };
          const goToSessionForm = () => nav.navigate('HomeTab', { screen: 'SessionForm' });
          return {
            tabBarLabel: () => null,
            tabBarIcon: () => <AddButton onPress={goToSessionForm} />,
            // BottomTabBarButtonProps allows null for disabled/delayLongPress/onBlur
            // which TouchableOpacityProps does not. Pass-through via React's prop type.
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as React.ComponentProps<typeof TouchableOpacity>)}
                onPress={goToSessionForm}
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
          const focused = getFocusedRouteNameFromRoute(route as RouteProp<MainTabParamList>) ?? '';
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
        name="StatsTab"
        component={StatsStackNavigator}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused, color }) => (
            <StatsTabIcon color={color} focused={focused} />
          ),
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
  tabBarHidden: {
    display: 'none',
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  tabBarOverlay: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(29,29,29,0.35)' : 'rgba(29,29,29,0.92)',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
  },
  tabBarIcon: {
    marginBottom: 2,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 96,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  chatIconWrap: {
    position: 'relative',
  },
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
