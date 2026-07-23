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

export default function ActivityLogsScreen() {
  const { contentMaxWidth } = useResponsive();
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const params: Record<string, any> = {};
  if (module.trim()) params.module = module.trim();
  if (action.trim()) params.action = action.trim();

  const { data: logs, isLoading, refetch } = useGetAll<any[]>(['activity-logs'], logsApi.getActivity, Object.keys(params).length ? params : undefined);

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      <View style={styles.filtersRow}>
        <View style={styles.filterBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.input} value={module} onChangeText={setModule}
            placeholder="الوحدة" placeholderTextColor={colors.textTertiary} textAlign="right"
          />
        </View>
        <View style={styles.filterBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.input} value={action} onChangeText={setAction}
            placeholder="الإجراء" placeholderTextColor={colors.textTertiary} textAlign="right"
          />
        </View>
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
              <Ionicons name="pulse-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد سجلات نشاط</Text>
            </View>
          ) : (
            (logs ?? []).map((item: any) => (
              <Card key={item._id ?? item.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="pulse" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <View style={styles.cardHeader}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.module}</Text>
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>{item.action}</Text>
                      </View>
                    </View>
                    {item.description ? (
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.description}</Text>
                    ) : null}
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      المستخدم: {item.userId?.fullName || '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString('ar-SA') : '--'}
                    </Text>
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
  filtersRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  filterBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  input: { flex: 1, paddingVertical: spacing.sm, fontSize: 14, fontFamily: 'Cairo', color: colors.text },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  actionBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  actionBadgeText: { fontSize: 11, fontFamily: 'Cairo', color: colors.primary },
});
