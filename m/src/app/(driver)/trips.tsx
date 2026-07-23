import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetOne } from '../../hooks/useApi';
import { driversApi } from '../../api/drivers';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

const statusConfig: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  scheduled: { label: 'مجدولة', color: colors.info, icon: 'time-outline' },
  in_progress: { label: 'قيد التنفيذ', color: colors.success, icon: 'play-circle-outline' },
  completed: { label: 'مكتملة', color: colors.textTertiary, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'ملغية', color: colors.danger, icon: 'close-circle-outline' },
};

export default function DriverTrips() {
  const { contentMaxWidth } = useResponsive();
  const { data: trips, isLoading, refetch } = useGetOne<any[]>(
    ['driver-my-trips'],
    driversApi.getMyTrips,
  );

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.secondary} />}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
        >
          {(trips || []).length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="navigate-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد رحلات</Text>
            </View>
          ) : (
            (trips || []).map((item: any) => {
              const cfg = statusConfig[item.status] ?? { label: item.status, color: colors.textSecondary, icon: 'help-outline' as const };
              return (
                <Card key={item._id ?? item.id} style={styles.card}>
                  <View style={styles.row}>
                    <View style={[styles.indicator, { backgroundColor: cfg.color + '20' }]}>
                      <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.tripNumber}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        {item.routeId?.routeName ?? '--'} | {item.busId?.busNumber ?? '--'}
                      </Text>
                      {item.date && (
                        <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>
                          {new Date(item.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                      )}
                      <View style={[styles.badge, { backgroundColor: cfg.color + '20', alignSelf: 'flex-start', marginTop: spacing.xs }]}>
                        <Ionicons name={cfg.icon} size={12} color={cfg.color} style={{ marginRight: 4 }} />
                        <Text style={[typography.labelSmall, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <View style={styles.studentCount}>
                      <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 4 }]}>
                        {item.studentCount ?? 0}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  indicator: { width: 44, height: 44, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  studentCount: { flexDirection: 'row', alignItems: 'center' },
});
