import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { subscriptionsApi } from '../../api/subscriptions';
import { colors, statusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { studentId: '', busId: '', startDate: '', endDate: '', amount: '', discount: '', paymentStatus: 'pending' };

export default function EmployeeSubscriptionsScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: subscriptions, isLoading, refetch } = useGetAll<any[]>(['subscriptions'], subscriptionsApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (subscriptions ?? []).filter((s: any) =>
    !search || s.studentId?.fullName?.includes(search) || s.busId?.busNumber?.includes(search)
  );

  const setField = useCallback((key: string, value: string) => { setForm((prev) => ({ ...prev, [key]: value })); }, []);

  const openAdd = () => { setForm(emptyForm); setAddVisible(true); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      studentId: item.studentId?._id || item.studentId || '',
      busId: item.busId?._id || item.busId || '',
      startDate: item.startDate?.slice(0, 10) || '',
      endDate: item.endDate?.slice(0, 10) || '',
      amount: String(item.amount ?? ''),
      discount: String(item.discount ?? ''),
      paymentStatus: item.paymentStatus || 'pending',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.studentId.trim() || !form.busId.trim() || !form.startDate.trim() || !form.endDate.trim() || !form.amount.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSaving(true);
    try {
      await subscriptionsApi.create({ studentId: form.studentId.trim(), busId: form.busId.trim(), startDate: form.startDate.trim(), endDate: form.endDate.trim(), amount: Number(form.amount), discount: form.discount ? Number(form.discount) : 0, paymentStatus: form.paymentStatus });
      setAddVisible(false); setForm(emptyForm); refetch(); Alert.alert('تم', 'تمت إضافة الاشتراك بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة الاشتراك'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.studentId.trim() || !form.busId.trim() || !form.startDate.trim() || !form.endDate.trim() || !form.amount.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSaving(true);
    try {
      await subscriptionsApi.update(editItem._id || editItem.id, { studentId: form.studentId.trim(), busId: form.busId.trim(), startDate: form.startDate.trim(), endDate: form.endDate.trim(), amount: Number(form.amount), discount: form.discount ? Number(form.discount) : 0, paymentStatus: form.paymentStatus });
      setEditVisible(false); setEditItem(null); setForm(emptyForm); refetch(); Alert.alert('تم', 'تم تعديل بيانات الاشتراك بنجاح');
    } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الاشتراك'); } finally { setSaving(false); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف اشتراك', `هل أنت متأكد من حذف هذا الاشتراك؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { try { await subscriptionsApi.delete(item._id || item.id); refetch(); Alert.alert('تم', 'تم حذف الاشتراك بنجاح'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الاشتراك'); } } },
    ]);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; fg: string; label: string }> = {
      active: { bg: statusColors.active + '20', fg: statusColors.active, label: 'نشط' },
      expired: { bg: statusColors.expired + '20', fg: statusColors.expired, label: 'منتهي' },
      pending: { bg: statusColors.pending + '20', fg: statusColors.pending, label: 'قيد الانتظار' },
      cancelled: { bg: statusColors.cancelled + '20', fg: statusColors.cancelled, label: 'ملغي' },
    };
    return map[status] || { bg: colors.surfaceVariant, fg: colors.textSecondary, label: status };
  };

  const getPaymentBadge = (status: string) => {
    const map: Record<string, { bg: string; fg: string; label: string }> = {
      paid: { bg: statusColors.paid + '20', fg: statusColors.paid, label: 'مدفوع' },
      pending: { bg: statusColors.pending + '20', fg: statusColors.pending, label: 'قيد الانتظار' },
      partial: { bg: statusColors.warning + '20', fg: statusColors.warning, label: 'جزئي' },
    };
    return map[status] || { bg: colors.surfaceVariant, fg: colors.textSecondary, label: status };
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
          <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

          <Text style={styles.label}>رقم الطالب *</Text>
          <TextInput style={styles.modalInput} value={form.studentId} onChangeText={(v) => setField('studentId', v)} placeholder="معرف الطالب" placeholderTextColor={colors.textTertiary} textAlign="right" />

          <Text style={styles.label}>رقم الحافلة *</Text>
          <TextInput style={styles.modalInput} value={form.busId} onChangeText={(v) => setField('busId', v)} placeholder="معرف الحافلة" placeholderTextColor={colors.textTertiary} textAlign="right" />

          <Text style={styles.label}>تاريخ البداية *</Text>
          <TextInput style={styles.modalInput} value={form.startDate} onChangeText={(v) => setField('startDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right" />

          <Text style={styles.label}>تاريخ النهاية *</Text>
          <TextInput style={styles.modalInput} value={form.endDate} onChangeText={(v) => setField('endDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right" />

          <Text style={styles.label}>المبلغ *</Text>
          <TextInput style={styles.modalInput} value={form.amount} onChangeText={(v) => setField('amount', v)} placeholder="0" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric" />

          <Text style={styles.label}>الخصم</Text>
          <TextInput style={styles.modalInput} value={form.discount} onChangeText={(v) => setField('discount', v)} placeholder="0" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric" />

          <Text style={styles.label}>حالة الدفع</Text>
          <View style={styles.chipRow}>
            {['pending', 'paid', 'partial'].map((s) => (
              <TouchableOpacity key={s} style={[styles.chip, form.paymentStatus === s && styles.chipActive]} onPress={() => setField('paymentStatus', s)}>
                <Text style={[typography.bodySmall, { color: form.paymentStatus === s ? colors.textInverse : colors.textSecondary }]}>{s === 'pending' ? 'قيد الانتظار' : s === 'paid' ? 'مدفوع' : 'جزئي'}</Text>
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
              <Ionicons name="card-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد اشتراكات</Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const sBadge = getStatusBadge(item.status);
              const pBadge = getPaymentBadge(item.paymentStatus);
              return (
                <Card key={item._id ?? item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.studentId?.fullName || item.studentId || 'طالب'}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>حافلة: {item.busId?.busNumber || item.busNumber || '--'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sBadge.bg }]}><Text style={[typography.bodySmall, { color: sBadge.fg }]}>{sBadge.label}</Text></View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.startDate?.slice(0, 10) || '--'} ← {item.endDate?.slice(0, 10) || '--'}</Text>
                    <Text style={[typography.bodySmall, { color: colors.text }]}>المبلغ: {item.amount} ر.س</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, { backgroundColor: pBadge.bg }]}><Text style={[typography.bodySmall, { color: pBadge.fg }]}>{pBadge.label}</Text></View>
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color={colors.danger} /></TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة اشتراك جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الاشتراك')}
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
