import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { notificationsApi } from '../../api/notifications';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

const typeConfig: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { label: 'نجاح', color: colors.success, icon: 'checkmark-circle' },
  warning: { label: 'تنبيه', color: colors.warning, icon: 'warning' },
  info: { label: 'معلومة', color: colors.info, icon: 'information-circle' },
  danger: { label: 'خطأ', color: colors.danger, icon: 'alert-circle' },
};

export default function EmployeeNotificationsScreen() {
  const { contentMaxWidth, modalWidth } = useResponsive();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { data: notifications, isLoading, refetch } = useGetAll<any[]>(['notifications'], notificationsApi.getAll);

  const items = notifications ?? [];

  const openDetail = async (item: any) => {
    setSelectedItem(item);
    setDetailVisible(true);
    try { await notificationsApi.markRead(item._id ?? item.id); refetch(); } catch {}
  };

  const handleMarkAllRead = async () => {
    setSaving(true);
    try { await notificationsApi.markAllRead(); refetch(); Alert.alert('تم', 'تم تعليم جميع الإشعارات كمقروءة'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل تعليم الإشعارات'); } finally { setSaving(false); }
  };

  const handleDelete = (item: any) => {
    Alert.alert('حذف إشعار', `هل أنت متأكد من حذف "${item.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { try { await notificationsApi.delete(item._id || item.id); refetch(); Alert.alert('تم', 'تم حذف الإشعار بنجاح'); } catch (err: any) { Alert.alert('خطأ', err?.response?.data?.message || 'فشل حذف الإشعار'); } } },
    ]);
  };

  const unreadCount = items.filter((n: any) => !n.read && !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <View style={styles.headerRow}>
        {unreadCount > 0 && (
          <TouchableOpacity style={[styles.markAllBtn, saving && { opacity: 0.6 }]} onPress={handleMarkAllRead} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.textInverse} size="small" /> : (
              <><Ionicons name="checkmark-done" size={18} color={colors.textInverse} /><Text style={[typography.button, { color: colors.textInverse, marginLeft: 6 }]}>تعليم الكل كمقروء ({unreadCount})</Text></>
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}>
          {items.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد إشعارات</Text>
            </View>
          ) : (
            items.map((item: any) => {
              const cfg = typeConfig[item.type] ?? typeConfig.info;
              const isUnread = !item.read && !item.isRead;
              return (
                <Card key={item._id ?? item.id} style={[styles.card, isUnread && styles.unreadCard]}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => openDetail(item)} style={styles.cardContent}>
                    <View style={styles.row}>
                      <View style={[styles.iconBox, { backgroundColor: cfg.color + '15' }]}><Ionicons name={cfg.icon} size={20} color={cfg.color} /></View>
                      <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                        <View style={styles.titleRow}>
                          <Text style={[typography.titleSmall, { color: colors.text, flex: 1 }]}>{item.title}</Text>
                          {isUnread && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>{item.body}</Text>
                        <View style={styles.bottomRow}>
                          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: cfg.color + '15' }]}><Text style={[typography.bodySmall, { color: cfg.color, fontSize: 10 }]}>{cfg.label}</Text></View>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={16} color={colors.danger} /></TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
      </View>

      <Modal visible={detailVisible} transparent animationType="fade" onRequestClose={() => setDetailVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDetailVisible(false)} />
          <View style={[styles.modalContent, { width: modalWidth }]}>
            {selectedItem && (() => {
              const cfg = typeConfig[selectedItem.type] ?? typeConfig.info;
              return (
                <>
                  <View style={[styles.detailIcon, { backgroundColor: cfg.color + '15' }]}><Ionicons name={cfg.icon} size={32} color={cfg.color} /></View>
                  <Text style={[typography.titleMedium, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>{selectedItem.title}</Text>
                  <Text style={[typography.bodySmall, { color: cfg.color, textAlign: 'center', marginTop: spacing.xs }]}>{cfg.label}</Text>
                  <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg, lineHeight: 22 }]}>{selectedItem.body}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md }]}>{new Date(selectedItem.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailVisible(false)}><Text style={[typography.button, { color: colors.textInverse }]}>إغلاق</Text></TouchableOpacity>
                </>
              );
            })()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, ...shadows.sm },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  cardContent: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.xs },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.md },
  deleteBtn: { padding: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.danger + '15' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, width: '88%', maxHeight: '85%', ...shadows.xl },
  detailIcon: { width: 64, height: 64, borderRadius: 32, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { marginTop: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
});
