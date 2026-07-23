import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { busesApi } from '../../api/buses';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { busNumber: '', plateNumber: '', brand: '', modelName: '', year: '', capacity: '', status: 'active' };

export default function EmployeeBusesScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: buses, isLoading, refetch } = useGetAll<any[]>(['buses'], busesApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (buses ?? []).filter((b: any) =>
    !search || b.busNumber?.includes(search) || b.plateNumber?.includes(search) || b.brand?.includes(search)
  );

  const setField = useCallback((key: string, value: string) => { setForm((prev) => ({ ...prev, [key]: value })); }, []);

  const openAdd = () => { setForm(emptyForm); setAddVisible(true); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ busNumber: item.busNumber || '', plateNumber: item.plateNumber || '', brand: item.brand || '', modelName: item.modelName || '', year: item.year?.toString() || '', capacity: item.capacity?.toString() || '', status: item.status || 'active' });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.busNumber.trim() || !form.plateNumber.trim()) { Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة'); return; }
    setSaving(true);
    try {
      await busesApi.create({ busNumber: form.busNumber.trim(), plateNumber: form.plateNumber.trim(), brand: form.brand.trim() || undefined, modelName: form.modelName.trim() || undefined, year: form.year.trim() ? Number(form.year.trim()) : undefined, capacity: form.capacity.trim() ? Number(form.capacity.trim()) : undefined, status: form.status || 'active' });
      setAddVisible(false); setForm(emptyForm); refetch(); Alert.alert('تم', 'تمت إضافة الحافلة بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة الحافلة'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.busNumber.trim() || !form.plateNumber.trim()) { Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة'); return; }
    setSaving(true);
    try {
      await busesApi.update(editItem._id || editItem.id, { busNumber: form.busNumber.trim(), plateNumber: form.plateNumber.trim(), brand: form.brand.trim() || undefined, modelName: form.modelName.trim() || undefined, year: form.year.trim() ? Number(form.year.trim()) : undefined, capacity: form.capacity.trim() ? Number(form.capacity.trim()) : undefined, status: form.status || 'active' });
      setEditVisible(false); setEditItem(null); setForm(emptyForm); refetch(); Alert.alert('تم', 'تم تعديل بيانات الحافلة بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الحافلة'); } finally { setSaving(false); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف حافلة', `هل أنت متأكد من حذف حافلة "${item.busNumber}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { try { await busesApi.delete(item._id || item.id); refetch(); Alert.alert('تم', 'تم حذف الحافلة بنجاح'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الحافلة'); } } },
    ]);
  };

  const statusLabel = (s: string) => { if (s === 'active') return 'نشط'; if (s === 'maintenance') return 'صيانة'; return 'غير نشط'; };
  const statusColor = (s: string) => { if (s === 'active') return colors.success; if (s === 'maintenance') return colors.warning; return colors.textTertiary; };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <ScrollView>
          <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>
            <Text style={styles.label}>رقم الحافلة *</Text>
            <TextInput style={styles.modalInput} value={form.busNumber} onChangeText={(v) => setField('busNumber', v)} placeholder="مثال: BUS001" placeholderTextColor={colors.textTertiary} textAlign="right" />
            <Text style={styles.label}>رقم اللوحة *</Text>
            <TextInput style={styles.modalInput} value={form.plateNumber} onChangeText={(v) => setField('plateNumber', v)} placeholder="رقم اللوحة" placeholderTextColor={colors.textTertiary} textAlign="right" />
            <Text style={styles.label}>الماركة</Text>
            <TextInput style={styles.modalInput} value={form.brand} onChangeText={(v) => setField('brand', v)} placeholder="مثال: Toyota" placeholderTextColor={colors.textTertiary} textAlign="right" />
            <Text style={styles.label}>الموديل</Text>
            <TextInput style={styles.modalInput} value={form.modelName} onChangeText={(v) => setField('modelName', v)} placeholder="موديل الحافلة" placeholderTextColor={colors.textTertiary} textAlign="right" />
            <Text style={styles.label}>السنة</Text>
            <TextInput style={styles.modalInput} value={form.year} onChangeText={(v) => setField('year', v)} placeholder="مثال: 2024" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric" />
            <Text style={styles.label}>السعة</Text>
            <TextInput style={styles.modalInput} value={form.capacity} onChangeText={(v) => setField('capacity', v)} placeholder="عدد المقاعد" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric" />
            <Text style={styles.label}>الحالة</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              {['active', 'maintenance', 'inactive'].map((s) => (
                <TouchableOpacity key={s} style={[styles.statusBtn, form.status === s && { backgroundColor: statusColor(s), borderColor: statusColor(s) }]} onPress={() => setField('status', s)}>
                  <Text style={[typography.bodySmall, { color: form.status === s ? colors.textInverse : colors.text }]}>{statusLabel(s)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}><Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text></TouchableOpacity>
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
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Ionicons name="add" size={22} color={colors.textInverse} /></TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="bus-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد حافلات</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}><Ionicons name="bus" size={22} color={colors.secondary} /></View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.busNumber}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.plateNumber} | {item.brand} {item.modelName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>السعة: {item.capacity ?? '--'}</Text>
                      {item.driverId?.fullName && <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>| السائق: {item.driverId.fullName}</Text>}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '18' }]}><Text style={[typography.bodySmall, { color: statusColor(item.status), fontSize: 11 }]}>{statusLabel(item.status)}</Text></View>
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color={colors.danger} /></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة حافلة جديدة')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الحافلة')}
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
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md, alignSelf: 'flex-start' },
  statusBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
});
