import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { HomeTabIcon, ProfileTabIcon, ChatTabIcon, StatsTabIcon } from '../components/icons/TabBarIcons';

import { HomeStackNavigator } from './HomeStackNavigator';
import { ClientsStackNavigator } from './ClientsStackNavigator';
import { ChatPlaceholderScreen } from '../screens/main/ChatPlaceholderScreen';
import { AddPlaceholderScreen } from '../screens/main/AddPlaceholderScreen';
import { StatsStackNavigator } from './StatsStackNavigator';

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
      <Ionicons name="add" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const TAB_BAR_BASE_HEIGHT = 60;

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { height: tabBarHeight, paddingBottom: insets.bottom },
        ],
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: colors.Accent1,
        tabBarInactiveTintColor: colors.neutral8,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
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
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color }) => (
            <ProfileTabIcon color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddPlaceholderScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: () => <AddButton onPress={() => {}} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatPlaceholderScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <View style={styles.chatIconWrap}>
              <ChatTabIcon color={color} />
              <View style={styles.chatBadge} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStackNavigator}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => (
            <StatsTabIcon color={color} />
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
    overflow: 'hidden',
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
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.Accent1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chatIconWrap: {
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary7,
  },
});
