import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const drawerScreens = [
  { name: 'dashboard', label: 'لوحة التحكم', icon: 'grid-outline' as const },
  { name: 'students', label: 'الطلاب', icon: 'people-outline' as const },
  { name: 'drivers', label: 'السائقين', icon: 'person-circle-outline' as const },
  { name: 'buses', label: 'الحافلات', icon: 'bus-outline' as const },
  { name: 'routes', label: 'المسارات', icon: 'map-outline' as const },
  { name: 'trips', label: 'الرحلات', icon: 'navigate-outline' as const },
  { name: 'attendance', label: 'الحضور', icon: 'checkmark-circle-outline' as const },
  { name: 'subscriptions', label: 'الاشتراكات', icon: 'card-outline' as const },
  { name: 'maintenance', label: 'الصيانة', icon: 'construct-outline' as const },
  { name: 'reports', label: 'التقارير', icon: 'bar-chart-outline' as const },
  { name: 'settings', label: 'الإعدادات', icon: 'settings-outline' as const },
  { name: 'notifications', label: 'الإشعارات', icon: 'notifications-outline' as const },
  { name: 'profile', label: 'الملف الشخصي', icon: 'person-outline' as const },
  { name: 'users', label: 'المستخدمين', icon: 'people-outline' as const },
  { name: 'roles', label: 'الأدوار', icon: 'shield-outline' as const },
  { name: 'permissions', label: 'الصلاحيات', icon: 'lock-closed-outline' as const },
  { name: 'destinations', label: 'الوجهات', icon: 'location-outline' as const },
  { name: 'fuel', label: 'الوقود', icon: 'water-outline' as const },
  { name: 'audit-logs', label: 'سجل التدقيق', icon: 'document-text-outline' as const },
  { name: 'activity-logs', label: 'سجل النشاط', icon: 'pulse-outline' as const },
];

const DRAWER_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, fadeAnim]);

  const handleItemPress = useCallback((routeName: string) => {
    closeDrawer();
    setTimeout(() => router.push(`/(admin)/${routeName}` as any), 150);
  }, [closeDrawer, router]);

  const getActiveRoute = () => {
    const segments = pathname.split('/');
    return segments[segments.length - 1] || 'dashboard';
  };

  const activeRoute = getActiveRoute();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontFamily: 'Cairo_SemiBold' },
          tabBarStyle: { display: 'none' },
          tabBarButton: () => null,
          headerLeft: () => (
            <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
              <Ionicons name="menu" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          ),
        }}
      >
        {drawerScreens.map(({ name, label }) => (
          <Tabs.Screen key={name} name={name} options={{ title: label, headerShown: true }} />
        ))}
      </Tabs>

      {drawerOpen && (
        <>
          <TouchableOpacity
            style={[styles.overlay, { opacity: fadeAnim }]}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarLogo}>
                <Ionicons name="bus" size={24} color={colors.primary} />
              </View>
              <Text style={[typography.titleMedium, { color: colors.text }]}>SUTMS</Text>
            </View>
            <View style={styles.sidebarDivider} />
            <Animated.ScrollView showsVerticalScrollIndicator={false}>
              {drawerScreens.map(({ name, label, icon }) => {
                const isActive = activeRoute === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    onPress={() => handleItemPress(name)}
                    activeOpacity={0.7}
                  >
                    {isActive && <View style={styles.activeIndicator} />}
                    <Ionicons
                      name={icon}
                      size={20}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        typography.bodyMedium,
                        {
                          color: isActive ? colors.primary : colors.text,
                          marginLeft: spacing.md,
                          flex: 1,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  menuBtn: { padding: spacing.sm, marginRight: spacing.sm },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    zIndex: 20,
    ...shadows.xl,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxxl + spacing.lg,
    paddingBottom: spacing.lg,
  },
  sidebarLogo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  sidebarItemActive: {
    backgroundColor: colors.primary + '10',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    left: 0,
  },
});
