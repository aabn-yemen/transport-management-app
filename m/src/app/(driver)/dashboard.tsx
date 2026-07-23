import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/useRedux';
import { useResponsive } from '../../hooks/useResponsive';
import { useGetOne } from '../../hooks/useApi';
import { driversApi } from '../../api/drivers';
import { tripsApi } from '../../api/trips';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';

export default function DriverDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, horizontalPadding } = useResponsive();
  const queryClient = useQueryClient();

  const { data: driverInfo, isLoading: driverLoading } = useGetOne<any>(
    ['driver-me'],
    driversApi.getMe,
  );

  const { data: activeTrip, isLoading: tripLoading, refetch: refetchActive } = useGetOne<any>(
    ['driver-active-trip'],
    driversApi.getMyActiveTrip,
  );

  const isLoading = driverLoading || tripLoading;

  const handleEndTrip = useCallback(async () => {
    if (!activeTrip) return;
    Alert.alert('إنهاء الرحلة', `هل تريد إنهاء الرحلة ${activeTrip.tripNumber}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إنهاء',
        style: 'destructive',
        onPress: async () => {
          try {
            await tripsApi.endTrip(activeTrip._id || activeTrip.id);
            queryClient.invalidateQueries({ queryKey: ['driver-active-trip'] });
            queryClient.invalidateQueries({ queryKey: ['driver-my-trips'] });
            Alert.alert('تم', 'تم إنهاء الرحلة بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل إنهاء الرحلة');
          }
        },
      },
    ]);
  }, [activeTrip, queryClient]);

  const actionBtnWidth = isXLarge ? 120 : isLarge ? 110 : 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refetchActive(); }} tintColor={colors.primary} />}
    >
      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.header}>
        <View style={[styles.headerInner, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }]}>
          <Text style={[typography.titleLarge, { color: colors.textInverse }]}>لوحة السائق</Text>
          <Text style={[typography.bodyMedium, { color: colors.secondaryLight, marginTop: spacing.xs }]}>
            {user?.fullName || 'السائق'}
          </Text>
          {driverInfo && (
            <View style={styles.driverInfoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="id-card-outline" size={14} color={colors.textInverse} />
                <Text style={styles.infoChipText}>{driverInfo.driverNumber}</Text>
              </View>
              {driverInfo.busId && (
                <View style={styles.infoChip}>
                  <Ionicons name="bus-outline" size={14} color={colors.textInverse} />
                  <Text style={styles.infoChipText}>{driverInfo.busId.busNumber}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={[{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any, paddingHorizontal: horizontalPadding }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 40 }} />
        ) : activeTrip ? (
          <LinearGradient colors={[colors.success + 'dd', colors.success]} style={styles.currentTrip}>
            <Text style={[typography.titleMedium, { color: colors.textInverse }]}>الرحلة الحالية</Text>
            <Text style={[typography.displaySmall, { color: colors.textInverse, marginTop: spacing.sm }]}>
              {activeTrip.tripNumber}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textInverse + 'dd', marginTop: spacing.xs }]}>
              {activeTrip.busId?.busNumber ?? '--'} | {activeTrip.routeId?.routeName ?? '--'}
            </Text>
            <View style={styles.badgeLight}>
              <Text style={[typography.labelLarge, { color: colors.textInverse }]}>قيد التنفيذ</Text>
            </View>
            <Text style={[typography.bodyMedium, { color: colors.textInverse + 'cc', marginTop: spacing.sm }]}>
              الطلاب على متن: {activeTrip.studentCount ?? 0}
            </Text>
            {activeTrip.destinationId && typeof activeTrip.destinationId === 'object' && (
              <Text style={[typography.bodySmall, { color: colors.textInverse + 'aa', marginTop: spacing.xs }]}>
                الوجهة: {activeTrip.destinationId.nameAr || activeTrip.destinationId.name || '--'}
              </Text>
            )}
          </LinearGradient>
        ) : (
          <Card style={styles.noTrip}>
            <Ionicons name="bus-outline" size={40} color={colors.textTertiary} />
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
              لا توجد رحلة نشطة حالياً
            </Text>
          </Card>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { width: actionBtnWidth }]}
            onPress={() => router.push('/(driver)/scanner')}
            activeOpacity={0.7}
            disabled={!activeTrip}
          >
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.actionGradient, !activeTrip && styles.actionDisabled]}>
              <Ionicons name="qr-code" size={24} color={colors.textInverse} />
            </LinearGradient>
            <Text style={[typography.bodySmall, { color: activeTrip ? colors.text : colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }]}>
              مسح QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { width: actionBtnWidth }]}
            onPress={handleEndTrip}
            activeOpacity={0.7}
            disabled={!activeTrip}
          >
            <LinearGradient
              colors={activeTrip ? [colors.danger + 'dd', colors.danger] : [colors.textTertiary, colors.textTertiary]}
              style={styles.actionGradient}
            >
              <Ionicons name="stop-circle" size={24} color={colors.textInverse} />
            </LinearGradient>
            <Text style={[typography.bodySmall, { color: activeTrip ? colors.danger : colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }]}>
              إنهاء الرحلة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { width: actionBtnWidth }]} activeOpacity={0.7}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionGradient}>
              <Ionicons name="warning" size={24} color={colors.textInverse} />
            </LinearGradient>
            <Text style={[typography.bodySmall, { color: '#EF4444', textAlign: 'center', marginTop: spacing.sm }]}>طوارئ</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: spacing.md }}>
          <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>إجراءات سريعة</Text>
          <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Ionicons name="camera-outline" size={32} color={colors.textTertiary} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
              {activeTrip ? 'استخدم الماسح الضوئي لتسجيل حضور الطلاب' : 'لا يمكنك استخدام الماسح بدون رحلة نشطة'}
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxxxl, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
  headerInner: {},
  driverInfoRow: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, gap: spacing.xs },
  infoChipText: { color: colors.textInverse, fontSize: 12, fontFamily: 'Cairo_Medium' },
  currentTrip: { margin: spacing.md, padding: spacing.xl, borderRadius: borderRadius.xl, alignItems: 'center', ...shadows.lg },
  noTrip: { margin: spacing.md, padding: spacing.xxl, alignItems: 'center' },
  badgeLight: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.sm },
  actions: { flexDirection: 'row', padding: spacing.md, gap: spacing.md, justifyContent: 'center' },
  actionBtn: { alignItems: 'center' },
  actionGradient: { width: 52, height: 52, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  actionDisabled: { opacity: 0.5 },
});
