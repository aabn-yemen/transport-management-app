import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { notificationsApi } from '../../api/notifications';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

const typeConfig: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  info: { color: colors.info, icon: 'information-circle' },
  warning: { color: colors.warning, icon: 'warning' },
  success: { color: colors.success, icon: 'checkmark-circle' },
  danger: { color: colors.danger, icon: 'alert-circle' },
};

export default function DriverNotifications() {
  const { contentMaxWidth } = useResponsive();
  const { data: notifications } = useGetAll<any[]>(['driver-notifications'], notificationsApi.getAll);
  const items = notifications?.length ? notifications : [];

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="notifications-off-outline" size={56} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا توجد إشعارات</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {items.map((item: any) => {
            const cfg = typeConfig[item.type] ?? typeConfig.info;
            return (
              <TouchableOpacity key={item._id ?? item.id} activeOpacity={0.7}>
                <Card style={{ marginBottom: spacing.sm }}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: cfg.color + '15' }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.body}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
});