import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = {
  studentNumber: '', universityId: '', firstName: '', secondName: '', lastName: '',
  gender: '', college: '', department: '', academicLevel: '', phone: '',
  guardianPhone: '', address: '',
};

export default function EmployeeStudentsScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: students, isLoading, refetch } = useGetAll<any[]>(['students'], studentsApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (students ?? []).filter((s: any) =>
    !search || s.fullName?.includes(search) || s.studentNumber?.includes(search)
  );

  const setField = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setAddVisible(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      studentNumber: item.studentNumber || '',
      universityId: item.universityId || '',
      firstName: item.firstName || '',
      secondName: item.secondName || '',
      lastName: item.lastName || '',
      gender: item.gender || '',
      college: item.college || '',
      department: item.department || '',
      academicLevel: item.academicLevel || '',
      phone: item.phone || '',
      guardianPhone: item.guardianPhone || '',
      address: item.address || '',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.studentNumber.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await studentsApi.create({
        studentNumber: form.studentNumber.trim(),
        universityId: form.universityId.trim() || undefined,
        firstName: form.firstName.trim(),
        secondName: form.secondName.trim() || undefined,
        lastName: form.lastName.trim(),
        gender: form.gender || undefined,
        college: form.college.trim() || undefined,
        department: form.department.trim() || undefined,
        academicLevel: form.academicLevel.trim() || undefined,
        phone: form.phone.trim() || undefined,
        guardianPhone: form.guardianPhone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة الطالب بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة الطالب');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.studentNumber.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await studentsApi.update(editItem._id || editItem.id, {
        studentNumber: form.studentNumber.trim(),
        universityId: form.universityId.trim() || undefined,
        firstName: form.firstName.trim(),
        secondName: form.secondName.trim() || undefined,
        lastName: form.lastName.trim(),
        gender: form.gender || undefined,
        college: form.college.trim() || undefined,
        department: form.department.trim() || undefined,
        academicLevel: form.academicLevel.trim() || undefined,
        phone: form.phone.trim() || undefined,
        guardianPhone: form.guardianPhone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل بيانات الطالب بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الطالب');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف طالب', `هل أنت متأكد من حذف "${item.fullName}"؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await studentsApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف الطالب بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الطالب');
          }
        },
      },
    ]);
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <ScrollView>
          <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

            <Text style={styles.label}>رقم الطالب *</Text>
            <TextInput style={styles.modalInput} value={form.studentNumber} onChangeText={(v) => setField('studentNumber', v)} placeholder="مثال: STU001" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>الرقم الجامعي</Text>
            <TextInput style={styles.modalInput} value={form.universityId} onChangeText={(v) => setField('universityId', v)} placeholder="الرقم الجامعي" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>الاسم الأول *</Text>
            <TextInput style={styles.modalInput} value={form.firstName} onChangeText={(v) => setField('firstName', v)} placeholder="الاسم الأول" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>الاسم الأوسط</Text>
            <TextInput style={styles.modalInput} value={form.secondName} onChangeText={(v) => setField('secondName', v)} placeholder="الاسم الأوسط" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>اسم العائلة *</Text>
            <TextInput style={styles.modalInput} value={form.lastName} onChangeText={(v) => setField('lastName', v)} placeholder="اسم العائلة" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>الجنس</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <TouchableOpacity style={[styles.genderBtn, form.gender === 'male' && styles.genderBtnActive]} onPress={() => setField('gender', 'male')}>
                <Text style={[typography.bodySmall, { color: form.gender === 'male' ? colors.textInverse : colors.text }]}>ذكر</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, form.gender === 'female' && styles.genderBtnActive]} onPress={() => setField('gender', 'female')}>
                <Text style={[typography.bodySmall, { color: form.gender === 'female' ? colors.textInverse : colors.text }]}>أنثى</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>الكلية</Text>
            <TextInput style={styles.modalInput} value={form.college} onChangeText={(v) => setField('college', v)} placeholder="الكلية" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>القسم</Text>
            <TextInput style={styles.modalInput} value={form.department} onChangeText={(v) => setField('department', v)} placeholder="القسم" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>المستوى الأكاديمي</Text>
            <TextInput style={styles.modalInput} value={form.academicLevel} onChangeText={(v) => setField('academicLevel', v)} placeholder="مثال: السنة الثانية" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput style={styles.modalInput} value={form.phone} onChangeText={(v) => setField('phone', v)} placeholder="05XXXXXXXX" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="phone-pad" />

            <Text style={styles.label}>هاتف ولي الأمر</Text>
            <TextInput style={styles.modalInput} value={form.guardianPhone} onChangeText={(v) => setField('guardianPhone', v)} placeholder="05XXXXXXXX" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="phone-pad" />

            <Text style={styles.label}>العنوان</Text>
            <TextInput style={styles.modalInput} value={form.address} onChangeText={(v) => setField('address', v)} placeholder="العنوان" placeholderTextColor={colors.textTertiary} textAlign="right" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
                <Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Text style={[typography.button, { color: colors.textInverse }]}>حفظ</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="school-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد طلاب</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={[typography.titleMedium, { color: colors.secondary }]}>{(item.fullName || item.firstName || '?')[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.fullName || `${item.firstName} ${item.lastName}`}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.studentNumber} | {item.college || '--'}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.busId?.busNumber ? `حافلة: ${item.busId.busNumber}` : '--'}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}>
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة طالب جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الطالب')}
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
  genderBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
