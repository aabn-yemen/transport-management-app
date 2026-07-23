import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetOne } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentSubscription() {
  const { contentMaxWidth } = useResponsive();
  const { data: student } = useGetOne<any>(['my-profile'], studentsApi.getMe);
  const sub = student?.subscriptionId;
  const isActive = sub?.status === 'active';
  const gradColors: readonly [string, string] = isActive ? ['#10B981', '#059669'] : ['#94A3B8', '#64748B'];

  const expiryDate = sub?.endDate
    ? new Date(sub.endDate).toLocaleDateString('ar-SA')
    : '--';

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1, padding: spacing.md }}>
      <LinearGradient colors={gradColors} style={styles.subCard}>
        <Ionicons name="card" size={48} color={colors.textInverse} />
        <Text style={[typography.titleLarge, { color: colors.textInverse, marginTop: spacing.md }]}>
          {isActive ? 'نشط' : 'غير مفعل'}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textInverse + 'cc', marginTop: spacing.sm }]}>
          ساري حتى: {expiryDate}
        </Text>
      </LinearGradient>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>تفاصيل الاشتراك</Text>
        <DetailRow label="النوع" value={sub?.type || '--'} />
        <DetailRow label="السعر" value={sub?.price ? `${sub.price.toLocaleString()} ر.ي` : '--'} />
        <DetailRow label="الحالة" value={isActive ? 'مدفوع' : 'غير مدفوع'} valueColor={isActive ? colors.success : colors.danger} last />
      </Card>
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
  container: { flex: 1, backgroundColor: colors.background },
  subCard: { borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center', ...shadows.lg },
});
