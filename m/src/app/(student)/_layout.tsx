import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const tabs = [
  { name: 'dashboard', label: 'الرئيسية', icon: 'home-outline' as const },
  { name: 'bus', label: 'حافلتي', icon: 'bus-outline' as const },
  { name: 'subscription', label: 'الاشتراك', icon: 'card-outline' as const },
  { name: 'attendance', label: 'الحضور', icon: 'checkmark-circle-outline' as const },
  { name: 'profile', label: 'الملف', icon: 'person-outline' as const },
];

export default function StudentLayout() {
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