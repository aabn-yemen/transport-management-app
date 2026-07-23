import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { studentsApi } from '../../api/students';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

export default function ChildrenScreen() {
  const { contentMaxWidth } = useResponsive();
  const router = useRouter();
  const { data: children, isLoading, refetch } = useGetAll<any[]>(['my-children'], studentsApi.getAll);
  const items = children?.length ? children : [];

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="people-outline" size={56} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>لا يوجد أبناء</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {items.map((item: any) => (
            <TouchableOpacity key={item._id ?? item.id} activeOpacity={0.7} onPress={() => router.push('/(parent)/tracking')}>
              <Card style={styles.childCard}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={[typography.titleMedium, { color: colors.primary }]}>
                      {(item.fullName || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.titleSmall, { color: colors.text }]}>{item.fullName}</Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {item.studentNumber} | {item.college || '--'}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.busId?.busNumber ?? '--'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  childCard: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
});