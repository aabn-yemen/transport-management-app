import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { rolesApi } from '../../api/roles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = { name: '', nameAr: '', description: '', status: 'active' };

export default function RolesScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: roles, isLoading, refetch } = useGetAll<any[]>(['roles'], rolesApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (roles ?? []).filter((r: any) =>
    !search || r.name?.includes(search) || r.nameAr?.includes(search)
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
      name: item.name || '',
      nameAr: item.nameAr || '',
      description: item.description || '',
      status: item.status || 'active',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.nameAr.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await rolesApi.create({
        name: form.name.trim(),
        nameAr: form.nameAr.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة الدور بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة الدور');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.name.trim() || !form.nameAr.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await rolesApi.update(editItem._id || editItem.id, {
        name: form.name.trim(),
        nameAr: form.nameAr.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل بيانات الدور بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات الدور');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف دور', `هل أنت متأكد من حذف "${item.nameAr || item.name}"؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await rolesApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف الدور بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الدور');
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

          <Text style={styles.label}>الاسم بالإنجليزية *</Text>
          <TextInput
            style={styles.modalInput} value={form.name} onChangeText={(v) => setField('name', v)}
            placeholder="Role Name" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>الاسم بالعربية *</Text>
          <TextInput
            style={styles.modalInput} value={form.nameAr} onChangeText={(v) => setField('nameAr', v)}
            placeholder="اسم الدور بالعربية" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>الوصف</Text>
          <TextInput
            style={styles.modalInput} value={form.description} onChangeText={(v) => setField('description', v)}
            placeholder="وصف الدور (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right"
          />

          <Text style={styles.label}>الحالة</Text>
          <View style={styles.statusRow}>
            {['active', 'inactive'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, form.status === s && styles.statusBtnActive]}
                onPress={() => setField('status', s)}
              >
                <Text style={[styles.statusBtnText, form.status === s && styles.statusBtnTextActive]}>
                  {s === 'active' ? 'نشط' : 'غير نشط'}
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
              <Ionicons name="shield-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد أدوار</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Ionicons name="shield" size={22} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.nameAr || item.name}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.name}</Text>
                    {item.description ? (
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.description}</Text>
                    ) : null}
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      الصلاحيات: {item.permissions?.length ?? 0}
                    </Text>
                    <View style={[styles.badge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={[styles.badgeText, item.status === 'active' ? styles.badgeTextActive : styles.badgeTextInactive]}>
                        {item.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Text>
                    </View>
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

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة دور جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات الدور')}
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
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, marginTop: spacing.xs },
  badgeActive: { backgroundColor: colors.success + '15' },
  badgeInactive: { backgroundColor: colors.danger + '15' },
  badgeTextActive: { color: colors.success },
  badgeTextInactive: { color: colors.danger },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%', ...shadows.xl },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'right' },
  modalInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 14, fontFamily: 'Cairo', color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statusBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statusBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  statusBtnText: { fontSize: 14, fontFamily: 'Cairo', color: colors.textSecondary },
  statusBtnTextActive: { color: colors.primary },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
