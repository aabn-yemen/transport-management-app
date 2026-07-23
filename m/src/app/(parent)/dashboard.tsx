import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetAll } from '../../hooks/useApi';
import { useResponsive } from '../../hooks/useResponsive';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function ParentDashboard() {
  const router = useRouter();
  const { isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, horizontalPadding } = useResponsive();
  const { data: children, isLoading, refetch } = useGetAll<any[]>(['my-children'], studentsApi.getAll);
  const items = children?.length ? children : [];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={[typography.titleLarge, { color: colors.textInverse }]}>لوحة ولي الأمر</Text>
        <Text style={[typography.bodySmall, { color: colors.primaryLight, marginTop: spacing.xs }]}>تابع أبناءك في الوقت الحقيقي</Text>
      </LinearGradient>

      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any, paddingHorizontal: horizontalPadding }}>
        <View style={{ padding: spacing.md }}>
          <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>أبناؤك</Text>
          {isLoading ? (
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center' }]}>جاري التحميل...</Text>
          ) : items.length === 0 ? (
            <Card style={{ padding: spacing.xxl, alignItems: 'center' }}>
              <Ionicons name="people-outline" size={40} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد أبناء مسجلين</Text>
            </Card>
          ) : (
            items.map((child: any) => (
              <Card key={child._id || child.id} style={styles.childCard}>
                <View style={styles.childRow}>
                  <View style={styles.avatar}>
                    <Text style={[typography.titleMedium, { color: colors.primary }]}>
                      {(child.fullName || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{child.fullName}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {child.studentNumber} | {child.busId?.busNumber || 'غير محدد'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (child.status === 'active' ? colors.success : colors.warning) + '20' }]}>
                    <Text style={[typography.labelSmall, { color: child.status === 'active' ? colors.success : colors.warning }]}>
                      {child.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ padding: spacing.md }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(parent)/tracking')}>
            <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={[styles.liveCard, isLarge && { maxWidth: 600, alignSelf: 'center' }]}>
              <Ionicons name="locate" size={32} color={colors.textInverse} />
              <Text style={[typography.titleSmall, { color: colors.textInverse, marginTop: spacing.sm }]}>تتبع مباشر</Text>
              <Text style={[typography.bodySmall, { color: colors.secondaryLight, marginTop: spacing.xs }]}>تابع موقع الحافلة في الوقت الحقيقي</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xxxxl, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
  childCard: { marginBottom: spacing.sm },
  childRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  liveCard: { padding: spacing.xl, borderRadius: borderRadius.xl, alignItems: 'center', ...shadows.lg },
});