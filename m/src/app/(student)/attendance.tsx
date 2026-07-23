import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetOne } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function StudentAttendance() {
  const { contentMaxWidth } = useResponsive();
  const { data: records, isLoading, refetch } = useGetOne<any[]>(
    ['my-attendance-records'],
    studentsApi.getMyAttendance,
  );

  const present = records?.filter((r: any) => r.status === 'present').length ?? 0;
  const total = records?.length ?? 0;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <Card style={styles.rateCard}>
        <Text style={[typography.displayLarge, { color: rate >= 75 ? colors.success : rate >= 50 ? colors.warning : colors.danger }]}>
          {total > 0 ? `${rate}%` : '--'}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}>نسبة الحضور</Text>
        {total > 0 && (
          <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            {present} حاضر من {total} سجل
          </Text>
        )}
      </Card>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: spacing.md }}
        >
          {(records || []).length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد سجلات حضور</Text>
            </View>
          ) : (
            (records || []).map((item: any) => {
              const isPresent = item.status === 'present';
              return (
                <Card key={item._id ?? item.id} style={styles.recordCard}>
                  <View style={styles.recordRow}>
                    <View style={[styles.statusDot, { backgroundColor: isPresent ? colors.success : colors.warning }]}>
                      <Ionicons name={isPresent ? 'checkmark' : 'close'} size={14} color={colors.textInverse} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={[typography.bodyMedium, { color: colors.text }]}>
                        {item.tripId?.tripNumber || 'رحلة'}
                      </Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                      {item.checkInTime && (
                        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                          تسجيل الحضور: {new Date(item.checkInTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.labelLarge, { color: isPresent ? colors.success : colors.warning }]}>
                        {isPresent ? 'حاضر' : item.status === 'absent' ? 'غائب' : item.status}
                      </Text>
                      <Text style={[typography.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>
                        {item.checkInMethod === 'qr' ? 'QR' : item.checkInMethod === 'gps' ? 'GPS' : 'يدوي'}
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
  rateCard: { margin: spacing.md, paddingVertical: spacing.xl, alignItems: 'center', ...shadows.sm },
  recordCard: { marginBottom: spacing.sm },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 26, height: 26, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
});
