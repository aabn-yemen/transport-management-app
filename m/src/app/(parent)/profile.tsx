import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function ParentProfile() {
  const { contentMaxWidth } = useResponsive();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => { dispatch(logout()); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={[typography.displayMedium, { color: colors.primary }]}>
            {(user?.fullName || 'و').charAt(0)}
          </Text>
        </View>
        <Text style={[typography.titleLarge, { color: colors.text, marginTop: spacing.md }]}>
          {user?.fullName || 'ولي الأمر'}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          {user?.email || 'parent@email.com'}
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('تعديل الملف الشخصي', 'قريباً...')}>
          <View style={styles.menuRow}>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} style={{ marginLeft: spacing.md }} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>تعديل الملف الشخصي</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('إعدادات الإشعارات', 'قريباً...')}>
          <View style={styles.menuRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} style={{ marginLeft: spacing.md }} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>إعدادات الإشعارات</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('إضافة ابن', 'قريباً...')}>
          <View style={styles.menuRow}>
            <Ionicons name="person-add-outline" size={20} color={colors.textSecondary} style={{ marginLeft: spacing.md }} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>إضافة ابن</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.menuRow}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginLeft: spacing.md }} />
            <Text style={[typography.bodyMedium, { color: colors.danger, flex: 1 }]}>تسجيل الخروج</Text>
          </View>
        </TouchableOpacity>
      </Card>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  menuItem: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
});