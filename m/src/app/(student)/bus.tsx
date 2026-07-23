import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetOne } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function BusScreen() {
  const { contentMaxWidth } = useResponsive();
  const { data: student, isLoading } = useGetOne<any>(['my-profile'], studentsApi.getMe);
  const bus = student?.busId;
  const route = student?.routeId;
  const destination = student?.destinationId;

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!bus) {
    return (
      <View style={styles.container}>
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1, padding: spacing.md }}>
        <Card style={{ margin: spacing.md, padding: spacing.xxl, alignItems: 'center' }}>
          <Ionicons name="bus-outline" size={48} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لم يتم تعيين حافلة لك بعد</Text>
        </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1, padding: spacing.md }}>
      <Card style={styles.busCard}>
        <View style={styles.busIconWrap}>
          <Ionicons name="bus" size={40} color={colors.primary} />
        </View>
        <Text style={[typography.displaySmall, { color: colors.primary, marginTop: spacing.md }]}>
          {bus.busNumber || '--'}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          {bus.busType || ''} {bus.year ? `- ${bus.year}` : ''}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: spacing.xs }]}>
          السعة: {bus.capacity || '--'} مقعد
        </Text>
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>السائق</Text>
        {bus.driverId ? (
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.secondary} />
            </View>
            <View style={{ marginRight: spacing.md, flex: 1 }}>
              <Text style={[typography.titleSmall, { color: colors.text }]}>{bus.driverId.fullName || '--'}</Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>رقم السائق: {bus.driverId.driverNumber || '--'}</Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>التقييم: {bus.driverId.rating || '--'} / 5</Text>
            </View>
          </View>
        ) : (
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>لم يتم تعيين سائق</Text>
        )}
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>المسار</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <View style={{ marginRight: spacing.md, flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{route?.routeName || '--'}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              كود المسار: {route?.routeCode || '--'}
            </Text>
          </View>
        </View>
        {route?.distance && (
          <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
            <Ionicons name="map-outline" size={20} color={colors.info} />
            <Text style={[typography.bodyMedium, { color: colors.text, marginRight: spacing.md }]}>{route.distance} كم</Text>
          </View>
        )}
      </Card>

      {destination && (
        <Card>
          <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>الوجهة</Text>
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color={colors.warning} />
            <Text style={[typography.bodyMedium, { color: colors.text, marginRight: spacing.md }]}>
              {destination.nameAr || destination.name || '--'}
            </Text>
          </View>
        </Card>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  busCard: { alignItems: 'center', paddingVertical: spacing.xxl, marginBottom: spacing.md },
  busIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', ...shadows.md },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondary + '15', justifyContent: 'center', alignItems: 'center', marginLeft: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
});
