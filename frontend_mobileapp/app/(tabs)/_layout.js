import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor,
          height: 60,
          paddingBottom: 10,
          boxShadow: 'none',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        },
        headerStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="disease-detection"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="local-hospital" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="weed-detection"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="eco" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="pest-detection"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="bug-report" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="pest-map"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rice-quality"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="grain" size={28} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
} 