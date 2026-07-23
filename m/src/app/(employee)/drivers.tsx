import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { driversApi } from '../../api/drivers';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { driverNumber: '', fullName: '', password: '', phone: '', nationalId: '', licenseNumber: '', licenseExpiry: '', address: '', employmentDate: '', salary: '', busNumber: '', notes: '' };

export default function EmployeeDriversScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: drivers, isLoading, refetch } = useGetAll<any[]>(['drivers'], driversApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (drivers ?? []).filter((d: any) =>
    !search || d.fullName?.includes(search) || d.driverNumber?.includes(search) || d.phone?.includes(search)
  );

  const setField = useCallback((key: string, value: string) => { setForm((prev) => ({ ...prev, [key]: value })); }, []);

  const openAdd = () => { setForm(emptyForm); setAddVisible(true); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      driverNumber: item.driverNumber || '',
      fullName: item.fullName || '',
      password: '',
      phone: item.phone || '',
      nationalId: item.nationalId || '',
      licenseNumber: item.licenseNumber || '',
      licenseExpiry: item.licenseExpiry ? new Date(item.licenseExpiry).toISOString().slice(0, 10) : '',
      address: item.address || '',
      employmentDate: item.employmentDate ? new Date(item.employmentDate).toISOString().slice(0, 10) : '',
      salary: item.salary != null ? String(item.salary) : '',
      busNumber: item.busId?.busNumber || '',
      notes: item.notes || '',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.nationalId.trim() || !form.licenseNumber.trim() || !form.licenseExpiry.trim() || !form.address.trim() || !form.employmentDate.trim() || !form.salary.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        nationalId: form.nationalId.trim(),
        licenseNumber: form.licenseNumber.trim(),
        licenseExpiry: form.licenseExpiry.trim(),
        address: form.address.trim(),
        employmentDate: form.employmentDate.trim(),
        salary: Number(form.salary.trim()),
        busNumber: form.busNumber.trim() || undefined,
      };
      if (form.driverNumber.trim()) payload.driverNumber = form.driverNumber.trim();
      if (form.notes.trim()) payload.notes = form.notes.trim();
      await driversApi.create(payload);
      setAddVisible(false); setForm(emptyForm); refetch(); Alert.alert('تم', 'تمت إضافة السائق بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة السائق'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.fullName.trim() || !form.phone.trim() || !form.nationalId.trim() || !form.licenseNumber.trim() || !form.licenseExpiry.trim() || !form.address.trim() || !form.employmentDate.trim() || !form.salary.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        nationalId: form.nationalId.trim(),
        licenseNumber: form.licenseNumber.trim(),
        licenseExpiry: form.licenseExpiry.trim(),
        address: form.address.trim(),
        employmentDate: form.employmentDate.trim(),
        salary: Number(form.salary.trim()),
        busNumber: form.busNumber.trim() || undefined,
        notes: form.notes.trim(),
      };
      if (form.driverNumber.trim()) payload.driverNumber = form.driverNumber.trim();
      if (form.password.trim()) payload.password = form.password.trim();
      await driversApi.update(editItem._id || editItem.id, payload);
      setEditVisible(false); setEditItem(null); setForm(emptyForm); refetch(); Alert.alert('تم', 'تم تعديل بيانات السائق بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات السائق'); } finally { setSaving(false); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف سائق', `هل أنت متأكد من حذف "${item.fullName}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { try { await driversApi.delete(item._id || item.id); refetch(); Alert.alert('تم', 'تم حذف السائق بنجاح'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف السائق'); } } },
    ]);
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
          <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>
          <ScrollView style={{ maxHeight: '80%' }} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>الاسم الكامل *</Text>
          <TextInput style={styles.modalInput} value={form.fullName} onChangeText={(v) => setField('fullName', v)} placeholder="اسم السائق الكامل" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>رقم الهاتف *</Text>
          <TextInput style={styles.modalInput} value={form.phone} onChangeText={(v) => setField('phone', v)} placeholder="05XXXXXXXX" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="phone-pad" />
          <Text style={styles.label}>رقم الهوية الوطنية *</Text>
          <TextInput style={styles.modalInput} value={form.nationalId} onChangeText={(v) => setField('nationalId', v)} placeholder="رقم الهوية الوطنية" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="number-pad" />
          <Text style={styles.label}>رقم رخصة القيادة *</Text>
          <TextInput style={styles.modalInput} value={form.licenseNumber} onChangeText={(v) => setField('licenseNumber', v)} placeholder="رقم الرخصة" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>تاريخ انتهاء الرخصة *</Text>
          <TextInput style={styles.modalInput} value={form.licenseExpiry} onChangeText={(v) => setField('licenseExpiry', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>العنوان *</Text>
          <TextInput style={styles.modalInput} value={form.address} onChangeText={(v) => setField('address', v)} placeholder="العنوان" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>تاريخ التوظيف *</Text>
          <TextInput style={styles.modalInput} value={form.employmentDate} onChangeText={(v) => setField('employmentDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>الراتب (ريال) *</Text>
          <TextInput style={styles.modalInput} value={form.salary} onChangeText={(v) => setField('salary', v)} placeholder="الراتب" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric" />
          <Text style={styles.label}>رقم السائق</Text>
          <TextInput style={styles.modalInput} value={form.driverNumber} onChangeText={(v) => setField('driverNumber', v)} placeholder="اتركه فارغاً للإنشاء التلقائي" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>رقم الحافلة</Text>
          <TextInput style={styles.modalInput} value={form.busNumber} onChangeText={(v) => setField('busNumber', v)} placeholder="رقم الحافلة (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" />
          <Text style={styles.label}>ملاحظات</Text>
          <TextInput style={[styles.modalInput, { height: 60 }]} value={form.notes} onChangeText={(v) => setField('notes', v)} placeholder="ملاحظات (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" multiline />
          {title.includes('تعديل') && (
            <>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput style={styles.modalInput} value={form.password} onChangeText={(v) => setField('password', v)} placeholder="اتركها فارغة للاحتفاظ بكلمة المرور" placeholderTextColor={colors.textTertiary} textAlign="right" secureTextEntry />
            </>
          )}
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}><Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Text style={[typography.button, { color: colors.textInverse }]}>حفظ</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
          <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="بحث..." placeholderTextColor={colors.textTertiary} textAlign="right" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color={colors.textInverse} /></TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="person-circle-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد سائقين</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}><Ionicons name="person" size={22} color={colors.secondary} /></View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.fullName}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.driverNumber} | {item.busId?.busNumber ?? '--'}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.phone}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color={colors.danger} /></TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة سائق جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات السائق')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  input: { flex: 1, paddingVertical: spacing.sm, fontSize: 14, fontFamily: 'Cairo', color: colors.text },
  addBtn: { width: 44, height: 44, borderRadius: borderRadius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary + '15', justifyContent: 'center', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary + '15' },
  deleteBtn: { backgroundColor: colors.danger + '15' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
