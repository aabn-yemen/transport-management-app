import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { settingsApi } from '../../api/settings';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = {
  systemName: '', universityName: '', academicYear: '', semester: '',
  supportEmail: '', supportPhone: '', defaultLanguage: 'ar', defaultTheme: 'light',
};

export default function SettingsScreen() {
  const { contentMaxWidth, modalWidth } = useResponsive();
  const { data: settings, isLoading, refetch } = useGetAll<any>(['settings'], settingsApi.get);
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const setField = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (settings) {
      setForm({
        systemName: settings.systemName || '',
        universityName: settings.universityName || '',
        academicYear: settings.academicYear || '',
        semester: settings.semester || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        defaultLanguage: settings.defaultLanguage || 'ar',
        defaultTheme: settings.defaultTheme || 'light',
      });
    }
  }, [settings]);

  const openEdit = () => {
    if (settings) {
      setForm({
        systemName: settings.systemName || '',
        universityName: settings.universityName || '',
        academicYear: settings.academicYear || '',
        semester: settings.semester || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        defaultLanguage: settings.defaultLanguage || 'ar',
        defaultTheme: settings.defaultTheme || 'light',
      });
    }
    setEditVisible(true);
  };

  const handleSave = async () => {
    if (!form.systemName.trim() || !form.universityName.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.update({
        systemName: form.systemName.trim(),
        universityName: form.universityName.trim(),
        academicYear: form.academicYear.trim(),
        semester: form.semester.trim(),
        supportEmail: form.supportEmail.trim(),
        supportPhone: form.supportPhone.trim(),
        defaultLanguage: form.defaultLanguage,
        defaultTheme: form.defaultTheme,
      });
      setEditVisible(false);
      refetch();
      Alert.alert('تم', 'تم حفظ الإعدادات بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : settings ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
              <Ionicons name="create-outline" size={18} color={colors.textInverse} />
              <Text style={[typography.button, { color: colors.textInverse, marginLeft: 6 }]}>تعديل</Text>
            </TouchableOpacity>
          </View>

          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={[typography.titleSmall, { color: colors.text, marginLeft: spacing.sm }]}>معلومات النظام</Text>
            </View>
            <Row label="اسم النظام" value={settings.systemName} icon="desktop" />
            <Row label="الجامعة" value={settings.universityName} icon="school" />
            <Row label="السنة الأكاديمية" value={settings.academicYear} icon="calendar" />
            <Row label="الفصل الدراسي" value={settings.semester} icon="book" />
          </Card>

          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={18} color={colors.primary} />
              <Text style={[typography.titleSmall, { color: colors.text, marginLeft: spacing.sm }]}>جهات الاتصال</Text>
            </View>
            <Row label="البريد الإلكتروني" value={settings.supportEmail} icon="mail" />
            <Row label="رقم الدعم" value={settings.supportPhone} icon="call" />
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Ionicons name="options" size={18} color={colors.primary} />
              <Text style={[typography.titleSmall, { color: colors.text, marginLeft: spacing.sm }]}>التفضيلات</Text>
            </View>
            <Row label="اللغة الافتراضية" value={settings.defaultLanguage === 'ar' ? 'العربية' : settings.defaultLanguage === 'en' ? 'الإنجليزية' : settings.defaultLanguage} icon="language" />
            <Row label="السمة الافتراضية" value={settings.defaultTheme === 'light' ? 'فاتح' : settings.defaultTheme === 'dark' ? 'داكن' : settings.defaultTheme} icon="moon" />
          </Card>
        </ScrollView>
      ) : (
        <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
          <Ionicons name="settings-outline" size={48} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد إعدادات</Text>
        </View>
      )}
      </View>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={[styles.modalContent, { width: modalWidth }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>تعديل الإعدادات</Text>

              <Text style={styles.label}>اسم النظام *</Text>
              <TextInput
                style={styles.modalInput} value={form.systemName} onChangeText={(v) => setField('systemName', v)}
                placeholder="اسم النظام" placeholderTextColor={colors.textTertiary} textAlign="right"
              />

              <Text style={styles.label}>الجامعة *</Text>
              <TextInput
                style={styles.modalInput} value={form.universityName} onChangeText={(v) => setField('universityName', v)}
                placeholder="اسم الجامعة" placeholderTextColor={colors.textTertiary} textAlign="right"
              />

              <Text style={styles.label}>السنة الأكاديمية</Text>
              <TextInput
                style={styles.modalInput} value={form.academicYear} onChangeText={(v) => setField('academicYear', v)}
                placeholder="مثال: 2025-2026" placeholderTextColor={colors.textTertiary} textAlign="right"
              />

              <Text style={styles.label}>الفصل الدراسي</Text>
              <TextInput
                style={styles.modalInput} value={form.semester} onChangeText={(v) => setField('semester', v)}
                placeholder="مثال: الفصل الأول" placeholderTextColor={colors.textTertiary} textAlign="right"
              />

              <Text style={styles.label}>البريد الإلكتروني للدعم</Text>
              <TextInput
                style={styles.modalInput} value={form.supportEmail} onChangeText={(v) => setField('supportEmail', v)}
                placeholder="support@university.edu" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="email-address"
              />

              <Text style={styles.label}>رقم الدعم</Text>
              <TextInput
                style={styles.modalInput} value={form.supportPhone} onChangeText={(v) => setField('supportPhone', v)}
                placeholder="05XXXXXXXX" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="phone-pad"
              />

              <Text style={styles.label}>اللغة الافتراضية</Text>
              <TextInput
                style={styles.modalInput} value={form.defaultLanguage} onChangeText={(v) => setField('defaultLanguage', v)}
                placeholder="ar / en" placeholderTextColor={colors.textTertiary} textAlign="right"
              />

              <Text style={styles.label}>السمة الافتراضية</Text>
              <TextInput
                style={styles.modalInput} value={form.defaultTheme} onChangeText={(v) => setField('defaultTheme', v)}
                placeholder="light / dark" placeholderTextColor={colors.textTertiary} textAlign="right"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)} disabled={saving}>
                <Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
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
    </View>
  );
}

const Row = ({ label, value, icon }: { label: string; value?: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={16} color={colors.textTertiary} style={{ marginLeft: spacing.sm }} />
    <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
    <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'right' }]}>{value ?? '--'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, ...shadows.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, width: '88%', maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
