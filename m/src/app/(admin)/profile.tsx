import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout, getProfile } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import apiClient from '../../api/client';
import { useResponsive } from '../../hooks/useResponsive';

const emptyProfileForm = { fullName: '', phone: '' };
const emptyPasswordForm = { currentPassword: '', newPassword: '' };

export default function AdminProfile() {
  const { contentMaxWidth, modalWidth } = useResponsive();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, []);

  const setProfileField = useCallback((key: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setPasswordField = useCallback((key: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    });
    setEditVisible(true);
  };

  const openChangePassword = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم الكامل');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/auth/profile', {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
      });
      setEditVisible(false);
      dispatch(getProfile());
      Alert.alert('تم', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (passwordForm.newPassword.trim().length < 6) {
      Alert.alert('تنبيه', 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword.trim(),
        newPassword: passwordForm.newPassword.trim(),
      });
      setPasswordVisible(false);
      setPasswordForm(emptyPasswordForm);
      Alert.alert('تم', 'تم تغيير كلمة المرور بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'خروج', style: 'destructive',
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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={[typography.displayMedium, { color: colors.textInverse }]}>
            {(user?.fullName || 'م').charAt(0)}
          </Text>
        </View>
        <Text style={[typography.titleLarge, { color: colors.textInverse, marginTop: spacing.md }]}>
          {user?.fullName || 'المشرف'}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.primaryLight }]}>
          {user?.email || 'admin@university.edu'}
        </Text>
        {user?.phone && (
          <Text style={[typography.bodySmall, { color: colors.primaryLight, marginTop: spacing.xs }]}>
            {user.phone}
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
      >
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.sectionTitle}>
            <Ionicons name="person" size={18} color={colors.primary} />
            <Text style={[typography.titleSmall, { color: colors.text, marginLeft: spacing.sm }]}>الملف الشخصي</Text>
          </View>
          <InfoRow label="الاسم الكامل" value={user?.fullName} icon="person-outline" />
          <InfoRow label="البريد الإلكتروني" value={user?.email} icon="mail-outline" />
          <InfoRow label="رقم الهاتف" value={user?.phone} icon="call-outline" />
          <InfoRow label="الدور" value={user?.role} icon="shield-outline" />
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <TouchableOpacity style={styles.menuItem} onPress={openEditProfile}>
            <View style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>تعديل الملف الشخصي</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={openChangePassword}>
            <View style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>تغيير كلمة المرور</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Card>
            <View style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: colors.danger + '15' }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[typography.bodyMedium, { color: colors.danger, flex: 1 }]}>تسجيل الخروج</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center' }]}>
            نظام إدارة الحركة والنقل الذكي
          </Text>
        </Card>
      </ScrollView>
      </View>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={[styles.modalContent, { width: modalWidth }]}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>تعديل الملف الشخصي</Text>

            <Text style={styles.label}>الاسم الكامل *</Text>
            <TextInput
              style={styles.modalInput} value={profileForm.fullName} onChangeText={(v) => setProfileField('fullName', v)}
              placeholder="الاسم الكامل" placeholderTextColor={colors.textTertiary} textAlign="right"
            />

            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.modalInput} value={profileForm.phone} onChangeText={(v) => setProfileField('phone', v)}
              placeholder="05XXXXXXXX" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)} disabled={saving}>
                <Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[typography.button, { color: colors.textInverse }]}>حفظ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={passwordVisible} transparent animationType="fade" onRequestClose={() => setPasswordVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPasswordVisible(false)} />
          <View style={[styles.modalContent, { width: modalWidth }]}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>تغيير كلمة المرور</Text>

            <Text style={styles.label}>كلمة المرور الحالية *</Text>
            <TextInput
              style={styles.modalInput} value={passwordForm.currentPassword} onChangeText={(v) => setPasswordField('currentPassword', v)}
              placeholder="كلمة المرور الحالية" placeholderTextColor={colors.textTertiary} textAlign="right" secureTextEntry
            />

            <Text style={styles.label}>كلمة المرور الجديدة *</Text>
            <TextInput
              style={styles.modalInput} value={passwordForm.newPassword} onChangeText={(v) => setPasswordField('newPassword', v)}
              placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" placeholderTextColor={colors.textTertiary} textAlign="right" secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPasswordVisible(false)} disabled={saving}>
                <Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[typography.button, { color: colors.textInverse }]}>تغيير</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const InfoRow = ({ label, value, icon }: { label: string; value?: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={colors.textTertiary} style={{ marginLeft: spacing.sm }} />
    <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
    <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'right' }]}>{value ?? '--'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuItem: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  menuIcon: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, width: '88%', maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
