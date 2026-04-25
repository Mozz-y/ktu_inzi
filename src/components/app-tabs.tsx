import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export default function AppTabs() {
  const scheme = useAppColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
      <Tabs
        screenOptions={{
            headerShown: false, //Jeigu true, atsiras tarpas tarp "BingeLog" ir ekrano virsaus
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        }}
      >
      <Tabs.Screen
        name="Home"
        options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                    name={focused ? 'home' : 'home-outline'}
                    size={size}
                    color={color}
                />
            ),
        }}
      />

      <Tabs.Screen
        name="Explore"
        options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                    name={focused ? 'compass' : 'compass-outline'}
                    size={size}
                    color={color}
                />
            ),
        }}
      />
      <Tabs.Screen
      name="Profile"
        options={{
             tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                    name={focused ? 'person' : 'person-outline'}
                    size={size}
                    color={color}
                />
            ),
        }}
      />
      </Tabs>
  );
}
