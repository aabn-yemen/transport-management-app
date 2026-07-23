import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { tripsApi } from '../../api/trips';
import { busesApi } from '../../api/buses';
import { driversApi } from '../../api/drivers';
import { routesApi } from '../../api/routes';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { tripNumber: '', busId: '', driverId: '', routeId: '', date: '', status: 'scheduled' };

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  scheduled: { label: 'مجدول', bg: colors.info + '20', color: colors.info },
  in_progress: { label: 'قيد التنفيذ', bg: colors.success + '20', color: colors.success },
  completed: { label: 'مكتمل', bg: colors.textTertiary + '20', color: colors.textTertiary },
  cancelled: { label: 'ملغي', bg: colors.danger + '20', color: colors.danger },
};

const statusOptions = ['scheduled', 'in_progress', 'completed', 'cancelled'];

export default function TripsScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: trips, isLoading, refetch } = useGetAll<any[]>(['trips'], tripsApi.getAll);
  const { data: buses } = useGetAll<any[]>(['buses'], busesApi.getAll);
  const { data: drivers } = useGetAll<any[]>(['drivers'], driversApi.getAll);
  const { data: routes } = useGetAll<any[]>(['routes'], routesApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (trips ?? []).filter((t: any) =>
    !search || t.tripNumber?.includes(search) || t.busId?.busNumber?.includes(search) || t.driverId?.fullName?.includes(search) || t.routeId?.routeCode?.includes(search)
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
      tripNumber: item.tripNumber || '',
      busId: item.busId?._id || item.busId?.id || '',
      driverId: item.driverId?._id || item.driverId?.id || '',
      routeId: item.routeId?._id || item.routeId?.id || '',
      date: item.date || '',
      status: item.status || 'scheduled',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.tripNumber.trim() || !form.busId.trim() || !form.driverId.trim() || !form.routeId.trim() || !form.date.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await tripsApi.create({
        tripNumber: form.tripNumber.trim(),
        busId: form.busId.trim(),
        driverId: form.driverId.trim(),
        routeId: form.routeId.trim(),
        date: form.date.trim(),
        status: form.status,
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة الرحلة بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة الرحلة');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.tripNumber.trim() || !form.busId.trim() || !form.driverId.trim() || !form.routeId.trim() || !form.date.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await tripsApi.update(editItem._id || editItem.id, {
        tripNumber: form.tripNumber.trim(),
        busId: form.busId.trim(),
        driverId: form.driverId.trim(),
        routeId: form.routeId.trim(),
        date: form.date.trim(),
        status: form.status,
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل بيانات الرحلة بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الرحلة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف رحلة', `هل أنت متأكد من حذف "${item.tripNumber}"؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await tripsApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف الرحلة بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الرحلة');
          }
        },
      },
    ]);
  };

  const handleStartTrip = (item: any) => {
    Alert.alert('بدء الرحلة', `هل تريد بدء الرحلة "${item.tripNumber}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'بدء',
        onPress: async () => {
          try {
            await tripsApi.startTrip(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم بدء الرحلة بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل بدء الرحلة');
          }
        },
      },
    ]);
  };

  const handleEndTrip = (item: any) => {
    Alert.alert('إنهاء الرحلة', `هل تريد إنهاء الرحلة "${item.tripNumber}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إنهاء',
        onPress: async () => {
          try {
            await tripsApi.endTrip(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم إنهاء الرحلة بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل إنهاء الرحلة');
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

            <Text style={styles.label}>رقم الرحلة *</Text>
            <TextInput
              style={styles.modalInput} value={form.tripNumber} onChangeText={(v) => setField('tripNumber', v)}
              placeholder="مثال: TRIP001" placeholderTextColor={colors.textTertiary} textAlign="right"
            />

            <Text style={styles.label}>الحافلة *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(buses ?? []).map((b: any) => {
                const id = b._id || b.id;
                const selected = form.busId === id;
                return (
                  <TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('busId', id)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{b.busNumber || id}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>السائق *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(drivers ?? []).map((d: any) => {
                const id = d._id || d.id;
                const selected = form.driverId === id;
                return (
                  <TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('driverId', id)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{d.fullName || id}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>المسار *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(routes ?? []).map((r: any) => {
                const id = r._id || r.id;
                const selected = form.routeId === id;
                return (
                  <TouchableOpacity key={id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setField('routeId', id)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{r.routeCode || id}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>التاريخ *</Text>
            <TextInput
              style={styles.modalInput} value={form.date} onChangeText={(v) => setField('date', v)}
              placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right"
            />

            <Text style={styles.label}>الحالة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {statusOptions.map((s) => {
                const cfg = statusConfig[s];
                const selected = form.status === s;
                return (
                  <TouchableOpacity key={s} style={[styles.chip, selected && { backgroundColor: cfg.color }]} onPress={() => setField('status', s)}>
                    <Text style={[styles.chipText, selected && { color: colors.textInverse }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

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
              <Ionicons name="bus-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد رحلات</Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const status = statusConfig[item.status] || statusConfig.scheduled;
              return (
                <Card key={item._id ?? item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                      <Ionicons name="bus" size={22} color={colors.secondary} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.tripNumber}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        {item.busId?.busNumber || '--'} | {item.driverId?.fullName || '--'}
                      </Text>
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                        {item.routeId?.routeCode || '--'} | {item.date || '--'}
                      </Text>
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                        الطلاب: {item.studentCount ?? 0}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}>
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                    {item.status === 'scheduled' && (
                      <TouchableOpacity style={[styles.actionBtn, styles.startBtn]} onPress={() => handleStartTrip(item)}>
                        <Ionicons name="play" size={18} color={colors.success} />
                      </TouchableOpacity>
                    )}
                    {item.status === 'in_progress' && (
                      <TouchableOpacity style={[styles.actionBtn, styles.endBtn]} onPress={() => handleEndTrip(item)}>
                        <Ionicons name="stop" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}

      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة رحلة جديدة')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الرحلة')}
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary + '15', justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  badgeText: { fontSize: 11, fontFamily: 'Cairo', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'flex-end' },
  actionBtn: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary + '15' },
  deleteBtn: { backgroundColor: colors.danger + '15' },
  startBtn: { backgroundColor: colors.success + '15' },
  endBtn: { backgroundColor: colors.danger + '20' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontFamily: 'Cairo', color: colors.text },
  chipTextSelected: { color: colors.textInverse },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
