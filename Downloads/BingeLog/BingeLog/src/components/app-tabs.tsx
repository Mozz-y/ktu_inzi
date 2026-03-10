import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
      <Tabs
        screenOptions={{
            headerShown: false, //Jeigu true, atsiras tarpas tarp "BingeLog" ir ekrano virsaus
            tabBarActiveTinColor: colors.text,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {backgroundColor: colors.background},
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
