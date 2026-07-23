import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { driversApi } from '../../api/drivers';
import { busesApi } from '../../api/buses';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function TrackingScreen() {
  const { contentMaxWidth } = useResponsive();
  const { data: children, isLoading: loadingChildren } = useGetAll<any[]>(['my-children'], studentsApi.getAll);
  const { data: drivers } = useGetAll<any[]>(['drivers'], driversApi.getAll);
  const { data: buses } = useGetAll<any[]>(['buses'], busesApi.getAll);

  const child = children?.[0];
  const bus = child?.busId && typeof child.busId === 'object' ? child.busId : buses?.find((b: any) => (b._id || b.id) === child?.busId);
  const driver = bus?.driverId && typeof bus.driverId === 'object' ? bus.driverId : drivers?.find((d: any) => (d._id || d.id) === bus?.driverId);
  const hasTracking = !!bus;

  if (loadingChildren) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>جاري تحميل بيانات التتبع...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Card style={styles.mapCard}>
        <View style={styles.mapIcon}>
          <Ionicons name={hasTracking ? "location" : "location-outline"} size={48} color={hasTracking ? colors.success : colors.primary} />
        </View>
        <Text style={[typography.titleLarge, { color: colors.primary, marginTop: spacing.md }]}>تتبع مباشر</Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          {hasTracking ? 'موقع الحافلة في الوقت الحقيقي' : 'لا يوجد رحلة نشطة حالياً'}
        </Text>
      </Card>

      {hasTracking ? (
        <Card style={{ marginTop: spacing.md }}>
          <DetailRow label="الحافلة" value={bus.busNumber || bus.bus_number || 'غير محدد'} />
          <DetailRow label="السائق" value={driver?.fullName || driver?.full_name || 'غير محدد'} />
          <DetailRow label="الخط" value={bus.route || bus.routeName || 'غير محدد'} />
          <DetailRow label="الحالة" value={bus.status === 'active' ? 'في الطريق' : 'متوقف'} valueColor={bus.status === 'active' ? colors.success : colors.warning} last />
        </Card>
      ) : (
        <Card style={{ marginTop: spacing.md, alignItems: 'center', padding: spacing.xxl }}>
          <Ionicons name="bus-outline" size={40} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
            لا توجد حافلة مخصصة حالياً
          </Text>
        </Card>
      )}
    </ScrollView>
      </View>
    </View>
  );
}

const DetailRow = ({ label, value, valueColor, last }: { label: string; value: string; valueColor?: string; last?: boolean }) => (
  <View style={[detailStyles.row, !last && detailStyles.border]}>
    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[typography.bodyMedium, { color: valueColor ?? colors.text }]}>{value}</Text>
  </View>
);

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  border: { borderBottomWidth: 1, borderBottomColor: colors.divider },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  mapCard: { alignItems: 'center', padding: spacing.xxl },
  mapIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', ...shadows.md },
});