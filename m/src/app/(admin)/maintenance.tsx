import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { maintenanceApi } from '../../api/maintenance';
import { colors, statusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { busId: '', maintenanceType: '', description: '', cost: '', maintenanceDate: '', status: 'pending' };

export default function MaintenanceScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: items, isLoading, refetch } = useGetAll<any[]>(['maintenance'], maintenanceApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (items ?? []).filter((m: any) =>
    !search || m.maintenanceType?.includes(search) || m.busId?.busNumber?.includes(search)
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
      busId: item.busId?._id || item.busId || '',
      maintenanceType: item.maintenanceType || '',
      description: item.description || '',
      cost: String(item.cost ?? ''),
      maintenanceDate: item.maintenanceDate?.slice(0, 10) || '',
      status: item.status || 'pending',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.busId.trim() || !form.maintenanceType.trim() || !form.cost.trim() || !form.maintenanceDate.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await maintenanceApi.create({
        busId: form.busId.trim(),
        maintenanceType: form.maintenanceType.trim(),
        description: form.description.trim(),
        cost: Number(form.cost),
        maintenanceDate: form.maintenanceDate.trim(),
        status: form.status,
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة سجل الصيانة بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة سجل الصيانة');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.busId.trim() || !form.maintenanceType.trim() || !form.cost.trim() || !form.maintenanceDate.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await maintenanceApi.update(editItem._id || editItem.id, {
        busId: form.busId.trim(),
        maintenanceType: form.maintenanceType.trim(),
        description: form.description.trim(),
        cost: Number(form.cost),
        maintenanceDate: form.maintenanceDate.trim(),
        status: form.status,
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل بيانات الصيانة بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الصيانة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف صيانة', `هل أنت متأكد من حذف سجل الصيانة هذا؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await maintenanceApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف سجل الصيانة بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف سجل الصيانة');
          }
        },
      },
    ]);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; fg: string; label: string }> = {
      completed: { bg: statusColors.completed + '20', fg: statusColors.completed, label: 'مكتمل' },
      pending: { bg: statusColors.pending + '20', fg: statusColors.pending, label: 'قيد الانتظار' },
      in_progress: { bg: statusColors.in_progress + '20', fg: statusColors.in_progress, label: 'قيد التنفيذ' },
    };
    return map[status] || { bg: colors.surfaceVariant, fg: colors.textSecondary, label: status };
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
          <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

          <Text style={styles.label}>رقم الحافلة *</Text>
          <TextInput
            style={styles.modalInput} value={form.busId} onChangeText={(v) => setField('busId', v)}
            placeholder="معرف الحافلة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>نوع الصيانة *</Text>
          <TextInput
            style={styles.modalInput} value={form.maintenanceType} onChangeText={(v) => setField('maintenanceType', v)}
            placeholder="نوع الصيانة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>الوصف</Text>
          <TextInput
            style={styles.modalInput} value={form.description} onChangeText={(v) => setField('description', v)}
            placeholder="وصف الصيانة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>التكلفة *</Text>
          <TextInput
            style={styles.modalInput} value={form.cost} onChangeText={(v) => setField('cost', v)}
            placeholder="0" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
          />

          <Text style={styles.label}>تاريخ الصيانة *</Text>
          <TextInput
            style={styles.modalInput} value={form.maintenanceDate} onChangeText={(v) => setField('maintenanceDate', v)}
            placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>الحالة</Text>
          <View style={styles.chipRow}>
            {['pending', 'in_progress', 'completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, form.status === s && styles.chipActive]}
                onPress={() => setField('status', s)}
              >
                <Text style={[typography.bodySmall, { color: form.status === s ? colors.textInverse : colors.textSecondary }]}>
                  {s === 'pending' ? 'قيد الانتظار' : s === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={[typography.button, { color: colors.textSecondary }]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
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
  );

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.input} value={search} onChangeText={setSearch}
            placeholder="بحث..." placeholderTextColor={colors.textTertiary} textAlign="right"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="construct-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد سجلات صيانة</Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const badge = getStatusBadge(item.status);
              return (
                <Card key={item._id ?? item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.maintenanceType}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        حافلة: {item.busId?.busNumber || item.busNumber || '--'}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[typography.bodySmall, { color: badge.fg }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    {item.description ? (
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.description}</Text>
                    ) : null}
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      {item.maintenanceDate?.slice(0, 10) || '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.text }]}>التكلفة: {item.cost} ر.س</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View />
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
              );
            })
          )}
        </ScrollView>
      )}

      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة سجل صيانة جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الصيانة')}
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardBody: { marginTop: spacing.sm, gap: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary + '15' },
  deleteBtn: { backgroundColor: colors.danger + '15' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
