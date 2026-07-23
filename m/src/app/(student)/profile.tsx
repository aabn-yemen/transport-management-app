import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { useGetOne } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentProfile() {
  const { contentMaxWidth } = useResponsive();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const { data: student } = useGetOne<any>(['my-profile'], studentsApi.getMe);

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'خروج',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={[typography.displayMedium, { color: colors.textInverse }]}>
            {(user?.fullName || 'ط').charAt(0)}
          </Text>
        </View>
        <Text style={[typography.titleLarge, { color: colors.textInverse, marginTop: spacing.md }]}>
          {user?.fullName || 'الطالب'}
        </Text>
        {student && (
          <>
            <Text style={[typography.bodyMedium, { color: colors.textInverse + 'cc', marginTop: spacing.xs }]}>
              {student.studentNumber}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textInverse + '99', marginTop: spacing.xs }]}>
              {student.college || ''} - {student.department || ''}
            </Text>
          </>
        )}
      </LinearGradient>

      <Card style={styles.infoCard}>
        <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>معلومات الحساب</Text>
        <InfoRow icon="mail-outline" label="البريد" value={user?.email || '--'} />
        <InfoRow icon="call-outline" label="الهاتف" value={user?.phone || student?.phone || '--'} />
        <InfoRow icon="school-outline" label="الرقم الأكاديمي" value={student?.universityId || '--'} />
        <InfoRow icon="car-outline" label="الحافلة" value={student?.busId?.busNumber || 'غير معيّنة'} />
        <InfoRow icon="location-outline" label="العنوان" value={student?.address || '--'} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuRow}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1, marginRight: spacing.md }]}>رمز QR الخاص بي</Text>
            <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuRow}>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1, marginRight: spacing.md }]}>تعديل الملف الشخصي</Text>
            <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuRow}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1, marginRight: spacing.md }]}>تغيير كلمة المرور</Text>
            <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <View style={[styles.menuRow, { paddingVertical: spacing.lg }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[typography.bodyMedium, { color: colors.danger, flex: 1, marginRight: spacing.md }]}>تسجيل الخروج</Text>
          </View>
        </TouchableOpacity>
      </Card>
    </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginRight: spacing.sm, width: 100 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text, flex: 1, textAlign: 'left' }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { alignItems: 'center', paddingVertical: spacing.xxl, borderRadius: 20, marginBottom: spacing.md, marginTop: -spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  infoCard: { padding: spacing.lg },
  menuItem: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
});
