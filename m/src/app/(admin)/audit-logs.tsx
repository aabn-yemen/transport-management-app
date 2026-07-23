import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { logsApi } from '../../api/logs';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';

export default function AuditLogsScreen() {
  const { contentMaxWidth } = useResponsive();
  const [collectionName, setCollectionName] = useState('');
  const [operation, setOperation] = useState('');
  const params: Record<string, any> = {};
  if (collectionName.trim()) params.collectionName = collectionName.trim();
  if (operation) params.operation = operation;

  const { data: logs, isLoading, refetch } = useGetAll<any[]>(['audit-logs'], logsApi.getAudit, Object.keys(params).length ? params : undefined);

  const opLabel = (op: string) => {
    if (op === 'create') return 'إنشاء';
    if (op === 'update') return 'تعديل';
    if (op === 'delete') return 'حذف';
    return op;
  };

  const opColor = (op: string) => {
    if (op === 'create') return colors.success;
    if (op === 'update') return colors.primary;
    if (op === 'delete') return colors.danger;
    return colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <View style={styles.filtersRow}>
        <View style={styles.filterBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.input} value={collectionName} onChangeText={setCollectionName}
            placeholder="ال COLLECTION" placeholderTextColor={colors.textTertiary} textAlign="right"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.opsRow}>
          {['', 'create', 'update', 'delete'].map((op) => (
            <TouchableOpacity
              key={op}
              style={[styles.opBtn, operation === op && styles.opBtnActive]}
              onPress={() => setOperation(op)}
            >
              <Text style={[styles.opBtnText, operation === op && styles.opBtnTextActive]}>
                {op ? opLabel(op) : 'الكل'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
        >
          {(logs ?? []).length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
              <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد سجلات</Text>
            </View>
          ) : (
            (logs ?? []).map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.opDot, { backgroundColor: opColor(item.operation) }]} />
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <View style={styles.cardHeader}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.collectionName}</Text>
                      <View style={[styles.opBadge, { backgroundColor: opColor(item.operation) + '15' }]}>
                        <Text style={[styles.opBadgeText, { color: opColor(item.operation) }]}>{opLabel(item.operation)}</Text>
                      </View>
                    </View>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      المستخدم: {item.userId?.fullName || '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString('ar-SA') : '--'}
                    </Text>
                    {item.ipAddress ? (
                      <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>IP: {item.ipAddress}</Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersRow: { padding: spacing.md, gap: spacing.sm },
  filterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.sm, fontSize: 14, fontFamily: 'Cairo', color: colors.text },
  opsRow: { flexDirection: 'row' },
  opBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  opBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  opBtnText: { fontSize: 13, fontFamily: 'Cairo', color: colors.textSecondary },
  opBtnTextActive: { color: colors.primary },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  opDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  opBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  opBadgeText: { fontSize: 11, fontFamily: 'Cairo' },
});
