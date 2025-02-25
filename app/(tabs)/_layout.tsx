import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon } from '@rneui/themed';

import { COLORS } from '../../src/styles/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          borderTopColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          position: 'absolute',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            intensity={80}
            style={{ flex: 1 }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" type="font-awesome" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" type="font-awesome" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
