import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { attendanceApi } from '../../api/attendance';
import { studentsApi } from '../../api/students';
import { tripsApi } from '../../api/trips';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { studentId: '', tripId: '', status: 'present', checkInMethod: 'manual' };

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  present: { label: 'حاضر', color: colors.success, icon: 'checkmark-circle' },
  absent: { label: 'غائب', color: colors.danger, icon: 'close-circle' },
  late: { label: 'متأخر', color: '#F59E0B', icon: 'time' },
};

const statusOptions = ['present', 'absent', 'late'];
const methodOptions = [
  { value: 'qr', label: 'QR' },
  { value: 'manual', label: 'يدوي' },
  { value: 'gps', label: 'GPS' },
];

export default function EmployeeAttendanceScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: records, isLoading, refetch } = useGetAll<any[]>(['attendance'], attendanceApi.getAll);
  const { data: students } = useGetAll<any[]>(['students'], studentsApi.getAll);
  const { data: trips } = useGetAll<any[]>(['trips'], tripsApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (records ?? []).filter((r: any) =>
    !search || r.studentId?.fullName?.includes(search) || r.tripId?.tripNumber?.includes(search) || r.status?.includes(search)
  );

  const setField = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openAdd = () => { setForm(emptyForm); setAddVisible(true); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      studentId: item.studentId?._id || item.studentId?.id || '',
      tripId: item.tripId?._id || item.tripId?.id || '',
      status: item.status || 'present',
      checkInMethod: item.checkInMethod || 'manual',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.studentId.trim() || !form.tripId.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await attendanceApi.create({ studentId: form.studentId.trim(), tripId: form.tripId.trim(), status: form.status, checkInMethod: form.checkInMethod });
      setAddVisible(false); setForm(emptyForm); refetch();
      Alert.alert('تم', 'تمت إضافة سجل الحضور بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة سجل الحضور');
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.studentId.trim() || !form.tripId.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await attendanceApi.update(editItem._id || editItem.id, { studentId: form.studentId.trim(), tripId: form.tripId.trim(), status: form.status, checkInMethod: form.checkInMethod });
      setEditVisible(false); setEditItem(null); setForm(emptyForm); refetch();
      Alert.alert('تم', 'تم تعديل سجل الحضور بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل سجل الحضور');
    } finally { setSaving(false); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف سجل', `هل أنت متأكد من حذف سجل الحضور này؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { try { await attendanceApi.delete(item._id || item.id); refetch(); Alert.alert('تم', 'تم حذف سجل الحضور بنجاح'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف سجل الحضور'); } } },
    ]);
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

            <Text style={styles.label}>الطالب *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(students ?? []).map((s: any) => {
                const id = s._id || s.id;
                const selected = form.studentId === id;
                return (<TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('studentId', id)}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{s.fullName || id}</Text></TouchableOpacity>);
              })}
            </ScrollView>

            <Text style={styles.label}>الرحلة *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(trips ?? []).map((t: any) => {
                const id = t._id || t.id;
                const selected = form.tripId === id;
                return (<TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('tripId', id)}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t.tripNumber || id}</Text></TouchableOpacity>);
              })}
            </ScrollView>

            <Text style={styles.label}>الحالة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {statusOptions.map((s) => {
                const cfg = statusConfig[s];
                const selected = form.status === s;
                return (<TouchableOpacity key={s} style={[styles.chip, selected && { backgroundColor: cfg.color }]} onPress={() => setField('status', s)}><Text style={[styles.chipText, selected && { color: colors.textInverse }]}>{cfg.label}</Text></TouchableOpacity>);
              })}
            </ScrollView>

            <Text style={styles.label}>طريقة تسجيل الحضور</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {methodOptions.map((m) => {
                const selected = form.checkInMethod === m.value;
                return (<TouchableOpacity key={m.value} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('checkInMethod', m.value)}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{m.label}</Text></TouchableOpacity>);
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}><Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Text style={[typography.button, { color: colors.textInverse }]}>حفظ</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
              <Ionicons name="clipboard-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد سجلات حضور</Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const status = statusConfig[item.status] || statusConfig.present;
              return (
                <Card key={item._id ?? item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: status.color + '20' }]}><Ionicons name={status.icon as any} size={22} color={status.color} /></View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.studentId?.fullName || '--'}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الرحلة: {item.tripId?.tripNumber || '--'}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('ar-SA') : '--'} | {item.checkInMethod === 'qr' ? 'QR' : item.checkInMethod === 'gps' ? 'GPS' : 'يدوي'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.color + '20' }]}><Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text></View>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color={colors.danger} /></TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة سجل حضور')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل سجل الحضور')}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  badgeText: { fontSize: 11, fontFamily: 'Cairo', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'flex-end' },
  actionBtn: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary + '15' },
  deleteBtn: { backgroundColor: colors.danger + '15' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontFamily: 'Cairo', color: colors.text },
  chipTextSelected: { color: colors.textInverse },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
