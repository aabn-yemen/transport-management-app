import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../hooks/useRedux';
import { useResponsive } from '../../hooks/useResponsive';
import { logout } from '../../store/slices/authSlice';
import { useGetAll } from '../../hooks/useApi';
import { reportsApi } from '../../api/reports';
import { tripsApi } from '../../api/trips';
import { colors, gradientColors, statusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

const statIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Students: 'people',
  Drivers: 'person-circle',
  Buses: 'bus',
  'Active Trips': 'navigate',
};

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isSmall, isMedium, isLarge, isXLarge, numColumns, contentMaxWidth, horizontalPadding } = useResponsive();
  const { data: dashboard, isLoading, refetch } = useGetAll<any>(['dashboard'], reportsApi.getDashboard);
  const { data: trips } = useGetAll<any[]>(['trips'], tripsApi.getAll);

  const stats = dashboard ? [
    { label: 'الطلاب', value: dashboard.totalStudents ?? '--', color: colors.primary, icon: 'people' as const },
    { label: 'السائقين', value: dashboard.totalDrivers ?? '--', color: colors.secondary, icon: 'person-circle' as const },
    { label: 'الحافلات', value: dashboard.totalBuses ?? '--', color: colors.warning, icon: 'bus' as const },
    { label: 'الرحلات النشطة', value: dashboard.activeTrips ?? '--', color: colors.info, icon: 'navigate' as const },
  ] : [];

  const quickActions = [
    { label: 'الطلاب', route: '/(admin)/students', icon: 'people' as const, color: colors.primary },
    { label: 'السائقين', route: '/(admin)/drivers', icon: 'person-circle' as const, color: colors.secondary },
    { label: 'الرحلات', route: '/(admin)/trips', icon: 'navigate' as const, color: colors.warning },
    { label: 'التقارير', route: '/(admin)/reports', icon: 'bar-chart' as const, color: colors.purple },
  ];

  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.replace('/(auth)/login');
  }, [dispatch, router]);

  const statCardWidth = isXLarge ? `${100 / numColumns - 3}%` : isLarge ? '31%' : '47%';
  const actionCardWidth = isXLarge ? '23%' : isLarge ? '31%' : '47%';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={[styles.headerContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }]}>
          <View>
            <Text style={[typography.titleLarge, { color: colors.textInverse }]}>لوحة التحكم</Text>
            <Text style={[typography.bodySmall, { color: colors.primaryLight, marginTop: spacing.xs }]}>
              مرحباً بك في نظام الحركة والنقل
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.responsiveContainer, { maxWidth: contentMaxWidth, alignSelf: 'center', paddingHorizontal: horizontalPadding }]}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card key={index} style={[styles.statCard, { width: statCardWidth as any }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                </View>
                <Text style={[typography.displaySmall, { color: stat.color, marginTop: spacing.sm }]}>
                  {isLoading ? '...' : stat.value}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>{stat.label}</Text>
              </Card>
            ))}
          </View>

          <Text style={[typography.titleMedium, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.lg }]}>
            إجراءات سريعة
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={[styles.actionButton, { width: actionCardWidth as any }]} onPress={() => router.push(action.route as any)} activeOpacity={0.7}>
                <LinearGradient colors={[action.color, action.color + 'dd'] as any} style={styles.actionGradient}>
                  <Ionicons name={action.icon} size={24} color={colors.textInverse} />
                </LinearGradient>
                <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'center', marginTop: spacing.sm }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[typography.titleMedium, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.lg }]}>
            الرحلات الأخيرة
          </Text>
          {trips && trips.length > 0 ? (
            trips.slice(0, 5).map((trip: any) => (
              <TouchableOpacity key={trip._id ?? trip.id} onPress={() => Alert.alert(trip.tripNumber || 'رحلة', `الحافلة: ${trip.busId?.busNumber ?? '--'}\nالسائق: ${trip.driverId?.fullName ?? '--'}\nالمسار: ${trip.routeId?.routeCode ?? '--'}\nالطلاب: ${trip.studentCount ?? 0}`)} activeOpacity={0.7}>
                <Card style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="navigate" size={18} color={colors.info} style={{ marginLeft: spacing.sm }} />
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{trip.tripNumber}</Text>
                    </View>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>الطلاب: {trip.studentCount ?? 0}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card style={{ marginBottom: spacing.xxl }}>
              <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
                <Ionicons name="bus-outline" size={40} color={colors.textTertiary} />
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
                  {isLoading ? 'جاري التحميل...' : 'لا توجد رحلات'}
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxxxl, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxxl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.md, marginTop: -spacing.lg },
  responsiveContainer: { width: '100%' },
  statCard: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  statIcon: { width: 48, height: 48, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionButton: { alignItems: 'center', padding: spacing.md },
  actionGradient: { width: 56, height: 56, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', ...shadows.md },
});