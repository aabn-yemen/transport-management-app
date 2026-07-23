import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { routesApi } from '../../api/routes';
import { destinationsApi } from '../../api/destinations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const emptyForm = {
  routeName: '', routeCode: '', distance: '', estimatedTime: '', destinationId: '', status: 'active',
};

export default function RoutesScreen() {
  const { width, isSmall, isMedium, isLarge, isXLarge, contentMaxWidth, modalWidth, horizontalPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const { data: routes, isLoading, refetch } = useGetAll<any[]>(['routes'], routesApi.getAll);
  const { data: destinations } = useGetAll<any[]>(['destinations'], destinationsApi.getAll);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = (routes ?? []).filter((r: any) =>
    !search || r.routeName?.includes(search) || r.routeCode?.includes(search)
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
      routeName: item.routeName || '',
      routeCode: item.routeCode || '',
      distance: item.distance?.toString() || '',
      estimatedTime: item.estimatedTime?.toString() || '',
      destinationId: item.destinationId?._id || item.destinationId || '',
      status: item.status || 'active',
    });
    setEditVisible(true);
  };

  const handleAdd = async () => {
    if (!form.routeName.trim() || !form.routeCode.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await routesApi.create({
        routeName: form.routeName.trim(),
        routeCode: form.routeCode.trim(),
        distance: form.distance.trim() ? Number(form.distance.trim()) : undefined,
        estimatedTime: form.estimatedTime.trim() ? Number(form.estimatedTime.trim()) : undefined,
        destinationId: form.destinationId || undefined,
        status: form.status || 'active',
      });
      setAddVisible(false);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تمت إضافة المسار بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل إضافة المسار');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.routeName.trim() || !form.routeCode.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await routesApi.update(editItem._id || editItem.id, {
        routeName: form.routeName.trim(),
        routeCode: form.routeCode.trim(),
        distance: form.distance.trim() ? Number(form.distance.trim()) : undefined,
        estimatedTime: form.estimatedTime.trim() ? Number(form.estimatedTime.trim()) : undefined,
        destinationId: form.destinationId || undefined,
        status: form.status || 'active',
      });
      setEditVisible(false);
      setEditItem(null);
      setForm(emptyForm);
      refetch();
      Alert.alert('تم', 'تم تعديل بيانات المسار بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعديل بيانات المسار');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف مسار', `هل أنت متأكد من حذف "${item.routeName}"؟\nلا يمكن التراجع عن هذا الإجراء.`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await routesApi.delete(item._id || item.id);
            refetch();
            Alert.alert('تم', 'تم حذف المسار بنجاح');
          } catch (err: any) {
            Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف المسار');
          }
        },
      },
    ]);
  };

  const statusLabel = (s: string) => {
    if (s === 'active') return 'نشط';
    return 'غير نشط';
  };

  const statusColor = (s: string) => {
    if (s === 'active') return colors.success;
    return colors.textTertiary;
  };

  const renderFormModal = (visible: boolean, onClose: () => void, onSave: () => void, title: string) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <ScrollView>
          <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.lg, textAlign: 'center' }]}>{title}</Text>

            <Text style={styles.label}>اسم المسار *</Text>
            <TextInput
              style={styles.modalInput} value={form.routeName} onChangeText={(v) => setField('routeName', v)}
              placeholder="اسم المسار" placeholderTextColor={colors.textTertiary} textAlign="right"
            />

            <Text style={styles.label}>كود المسار *</Text>
            <TextInput
              style={styles.modalInput} value={form.routeCode} onChangeText={(v) => setField('routeCode', v)}
              placeholder="مثال: R001" placeholderTextColor={colors.textTertiary} textAlign="right"
            />

            <Text style={styles.label}>المسافة (كم)</Text>
            <TextInput
              style={styles.modalInput} value={form.distance} onChangeText={(v) => setField('distance', v)}
              placeholder="المسافة بالكيلومتر" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
            />

            <Text style={styles.label}>الوقت المقدر (دقيقة)</Text>
            <TextInput
              style={styles.modalInput} value={form.estimatedTime} onChangeText={(v) => setField('estimatedTime', v)}
              placeholder="الوقت المقدر بالدقائق" placeholderTextColor={colors.textTertiary} textAlign="right" keyboardType="numeric"
            />

            <Text style={styles.label}>الوجهة</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
              {(destinations ?? []).map((d: any) => (
                <TouchableOpacity
                  key={d._id || d.id}
                  style={[styles.destBtn, form.destinationId === (d._id || d.id) && styles.destBtnActive]}
                  onPress={() => setField('destinationId', d._id || d.id)}
                >
                  <Text style={[typography.bodySmall, { color: form.destinationId === (d._id || d.id) ? colors.textInverse : colors.text }]}>{d.name}</Text>
                </TouchableOpacity>
              ))}
              {(!destinations || destinations.length === 0) && (
                <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>لا توجد وجهات</Text>
              )}
            </View>

            <Text style={styles.label}>الحالة</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              {['active', 'inactive'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusBtn, form.status === s && { backgroundColor: statusColor(s), borderColor: statusColor(s) }]}
                  onPress={() => setField('status', s)}
                >
                  <Text style={[typography.bodySmall, { color: form.status === s ? colors.textInverse : colors.text }]}>{statusLabel(s)}</Text>
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
              <Ionicons name="map-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد مسارات</Text>
            </View>
          ) : (
            filtered.map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Ionicons name="map" size={22} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.routeName}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {item.routeCode} | {item.distance ? `${item.distance} كم` : '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      {item.estimatedTime ? `${item.estimatedTime} دقيقة` : '--'}
                      {item.destinationId?.name ? ` | ${item.destinationId.name}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '18' }]}>
                      <Text style={[typography.bodySmall, { color: statusColor(item.status), fontSize: 11 }]}>{statusLabel(item.status)}</Text>
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
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      </View>

      {renderFormModal(addVisible, () => setAddVisible(false), handleAdd, 'إضافة مسار جديد')}
      {renderFormModal(editVisible, () => { setEditVisible(false); setEditItem(null); }, handleEdit, 'تعديل بيانات المسار')}
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
  destBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  destBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
});
