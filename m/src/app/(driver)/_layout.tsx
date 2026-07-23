import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const tabs = [
  { name: 'dashboard', label: 'الرئيسية', icon: 'home-outline' as const },
  { name: 'trips', label: 'الرحلات', icon: 'navigate-outline' as const },
  { name: 'scanner', label: 'الماسح', icon: 'qr-code-outline' as const },
  { name: 'notifications', label: 'الإشعارات', icon: 'notifications-outline' as const },
  { name: 'profile', label: 'الملف', icon: 'person-outline' as const },
];

export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontFamily: 'Cairo_Medium', fontSize: 11 },
      }}
    >
      {tabs.map(({ name, label, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarLabel: label,
            tabBarIcon: ({ color, size }) => <Ionicons name={icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}