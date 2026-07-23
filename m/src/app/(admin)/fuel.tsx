import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { fuelApi } from '../../api/fuel';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { busId: '', driverId: '', liters: '', price: '', station: '', odometer: '', date: '', notes: '' };

export default function FuelScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: fuelLogs, isLoading, refetch } = useGetAll<any[]>(['fuel'], fuelApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (fuelLogs ?? []).filter((f: any) =>
    !search || f.station?.includes(search) || f.busId?.busNumber?.includes(search)
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
      driverId: item.driverId?._id || item.driverId || '',
      liters: String(item.liters || ''),
      price: String(item.price || ''),
      station: item.station || '',
      odometer: String(item.odometer || ''),
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      notes: item.notes || '',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.busId.trim() || !form.liters.trim() || !form.price.trim() || !form.station.trim() || !form.date.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await fuelApi.create({
        busId: form.busId.trim(),
        driverId: form.driverId.trim() || undefined,
        liters: Number(form.liters),
        price: Number(form.price),
        station: form.station.trim(),
        odometer: form.odometer.trim() ? Number(form.odometer) : undefined,
        date: form.date.trim(),
        notes: form.notes.trim() || undefined,
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة سجل الوقود بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة سجل الوقود');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.busId.trim() || !form.liters.trim() || !form.price.trim() || !form.station.trim() || !form.date.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await fuelApi.update(editItem._id || editItem.id, {
        busId: form.busId.trim(),
        driverId: form.driverId.trim() || undefined,
        liters: Number(form.liters),
        price: Number(form.price),
        station: form.station.trim(),
        odometer: form.odometer.trim() ? Number(form.odometer) : undefined,
        date: form.date.trim(),
        notes: form.notes.trim() || undefined,
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل سجل الوقود بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل سجل الوقود');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف سجل وقود', `هل أنت متأكد من حذف هذا السجل؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await fuelApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف سجل الوقود بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف سجل الوقود');
          }
        },
      },
    ]);
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
          <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

          <Text style={styles.label}>معرف الحافلة *</Text>
          <TextInput
            style={styles.modalInput} value={form.busId} onChangeText={(v) => setField('busId', v)}
            placeholder="معرف الحافلة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>معرف السائق</Text>
          <TextInput
            style={styles.modalInput} value={form.driverId} onChangeText={(v) => setField('driverId', v)}
            placeholder="معرف السائق (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>اللترات *</Text>
          <TextInput
            style={styles.modalInput} value={form.liters} onChangeText={(v) => setField('liters', v)}
            placeholder="0" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
          />

          <Text style={styles.label}>السعر *</Text>
          <TextInput
            style={styles.modalInput} value={form.price} onChangeText={(v) => setField('price', v)}
            placeholder="0" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
          />

          <Text style={styles.label}>المحطة *</Text>
          <TextInput
            style={styles.modalInput} value={form.station} onChangeText={(v) => setField('station', v)}
            placeholder="اسم المحطة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>العداد</Text>
          <TextInput
            style={styles.modalInput} value={form.odometer} onChangeText={(v) => setField('odometer', v)}
            placeholder="رقم العداد (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
          />

          <Text style={styles.label}>التاريخ (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.modalInput} value={form.date} onChangeText={(v) => setField('date', v)}
            placeholder="2026-01-01" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>ملاحظات</Text>
          <TextInput
            style={styles.modalInput} value={form.notes} onChangeText={(v) => setField('notes', v)}
            placeholder="ملاحظات (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

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
              <Ionicons name="water-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد سجلات وقود</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Ionicons name="water" size={22} color={colors.info} />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>
                      الحافلة: {item.busId?.busNumber || item.busId}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      السائق: {item.driverId?.fullName || '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      {item.liters} لتر | {item.price} ر.س | الإجمالي: {item.totalCost ?? (item.liters * item.price)} ر.س
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      المحطة: {item.station} | العداد: {item.odometer ?? '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      التاريخ: {item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '--'}
                    </Text>
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

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة سجل وقود جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل سجل الوقود')}
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.info + '15', justifyContent: 'center', alignItems: 'center' },
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
