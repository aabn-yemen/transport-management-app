import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/useRedux';
import { useResponsive } from '../../hooks/useResponsive';
import { useGetAll, useGetOne } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const { isSmall, isMedium, isLarge, isXLarge, numColumns, contentMaxWidth, horizontalPadding } = useResponsive();
  const { data: student, isLoading: studentLoading, refetch: refetchStudent } = useGetOne<any>(['my-profile'], studentsApi.getMe);
  const { data: attendance, isLoading: attLoading, refetch: refetchAtt } = useGetAll<any[]>(['my-attendance'], studentsApi.getMyAttendance);
  const isLoading = studentLoading || attLoading;

  const present = attendance?.filter((a: any) => a.status === 'present').length ?? 0;
  const total = attendance?.length ?? 0;

  const busNumber = student?.busId?.busNumber || '--';
  const routeName = student?.routeId?.routeName || '--';
  const sub = student?.subscriptionId;
  const subStatus = sub?.status;
  const subStatusText = subStatus === 'active' ? 'نشط' : subStatus === 'expired' ? 'منتهي' : 'غير مفعل';

  const onRefresh = () => {
    refetchStudent();
    refetchAtt();
  };

  const statCardWidth = isXLarge ? `${100 / numColumns - 3}%` : isLarge ? '31%' : '47%';

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }}>
          <Text style={[typography.titleLarge, { color: colors.textInverse }]}>بوابة الطالب</Text>
          <Text style={[typography.bodyMedium, { color: colors.primaryLight, marginTop: spacing.xs }]}>
            {user?.fullName || 'الطالب'}
          </Text>
          {student && (
            <Text style={[typography.bodySmall, { color: colors.primaryLight + 'aa', marginTop: spacing.xs }]}>
              {student.studentNumber} | {student.college || ''}
            </Text>
          )}
        </View>
      </LinearGradient>

      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any, paddingHorizontal: horizontalPadding }}>
        <LinearGradient colors={[colors.surface, colors.surface]} style={styles.busInfo}>
          <View style={styles.busIcon}>
            <Ionicons name="bus" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.displaySmall, { color: colors.primary, marginTop: spacing.sm }]}>
            {busNumber}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {routeName}
          </Text>
        </LinearGradient>

        <View style={styles.grid}>
          <Card style={[styles.stat, { width: statCardWidth as any }]}>
            <Ionicons name="card" size={28} color={subStatus === 'active' ? colors.success : colors.warning} />
            <Text style={[typography.titleSmall, { color: subStatus === 'active' ? colors.success : colors.warning, marginTop: spacing.sm }]}>{subStatusText}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الاشتراك</Text>
          </Card>
          <Card style={[styles.stat, { width: statCardWidth as any }]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.info} />
            <Text style={[typography.titleSmall, { color: colors.info, marginTop: spacing.sm }]}>{present}/{total}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الحضور</Text>
          </Card>
          <Card style={[styles.stat, { width: statCardWidth as any }]}>
            <Ionicons name="location" size={28} color="#8B5CF6" />
            <Text style={[typography.titleSmall, { color: '#8B5CF6', marginTop: spacing.sm, textAlign: 'center' }]} numberOfLines={1}>{routeName}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>المسار</Text>
          </Card>
          <Card style={[styles.stat, { width: statCardWidth as any }]}>
            <Ionicons name="time" size={28} color={colors.secondary} />
            <Text style={[typography.titleSmall, { color: colors.secondary, marginTop: spacing.sm }]}>{total > 0 ? `${Math.round((present / total) * 100)}%` : '--'}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>نسبة الحضور</Text>
          </Card>
        </View>

        <View style={{ padding: spacing.md }}>
          <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>آخر سجلات الحضور</Text>
          {attendance && attendance.length > 0 ? (
            attendance.slice(0, 3).map((record: any) => (
              <Card key={record._id} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.statusDot, { backgroundColor: record.status === 'present' ? colors.success : colors.warning }]}>
                    <Ionicons name={record.status === 'present' ? 'checkmark' : 'close'} size={12} color={colors.textInverse} />
                  </View>
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>
                      {record.tripId?.tripNumber || 'رحلة'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {new Date(record.createdAt).toLocaleDateString('ar-SA')}
                    </Text>
                  </View>
                  <Text style={[typography.labelSmall, { color: record.status === 'present' ? colors.success : colors.warning }]}>
                    {record.status === 'present' ? 'حاضر' : record.status}
                  </Text>
                </View>
              </Card>
            ))
          ) : (
            <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Ionicons name="notifications-off-outline" size={28} color={colors.textTertiary} />
              <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>لا توجد سجلات حضور</Text>
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxxxl, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
  busInfo: { margin: spacing.md, padding: spacing.xl, borderRadius: borderRadius.xl, alignItems: 'center', ...shadows.md },
  busIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.md },
  stat: { alignItems: 'center', paddingVertical: spacing.xl },
  statusDot: { width: 26, height: 26, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
});
