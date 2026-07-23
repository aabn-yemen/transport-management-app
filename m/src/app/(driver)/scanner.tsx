import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { attendanceApi } from '../../api/attendance';
import { driversApi } from '../../api/drivers';
import { useGetOne } from '../../hooks/useApi';

export default function ScannerScreen() {
  const { contentMaxWidth, isLarge } = useResponsive();
  const [studentNumber, setStudentNumber] = useState('');
  const [scanned, setScanned] = useState(false);
  const [scannedName, setScannedName] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: activeTrip } = useGetOne<any>(
    ['driver-active-trip'],
    driversApi.getMyActiveTrip,
  );

  const handleCheckIn = async () => {
    if (!studentNumber.trim()) {
      Alert.alert('خطأ', 'أدخل رقم الطالب');
      return;
    }
    if (!activeTrip) {
      Alert.alert('خطأ', 'لا توجد رحلة نشطة');
      return;
    }

    setLoading(true);
    try {
      const tripId = activeTrip._id || activeTrip.id;
      await attendanceApi.checkIn({
        studentId: studentNumber.trim(),
        tripId,
        method: 'qr',
      });
      setScanned(true);
      setScannedName(`تم تسجيل حضور الطالب: ${studentNumber}`);
      setStudentNumber('');
      setTimeout(() => { setScanned(false); setScannedName(''); }, 4000);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل تسجيل الحضور');
    } finally {
      setLoading(false);
    }
  };

  if (!activeTrip) {
    return (
      <View style={styles.container}>
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', flex: 1 }}>
        <Card style={{ margin: spacing.md, padding: spacing.xxl, alignItems: 'center' }}>
          <Ionicons name="bus-outline" size={48} color={colors.textTertiary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
            لا توجد رحلة نشطة حالياً
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }]}>
            ابدأ رحلة أولاً من لوحة التحكم
          </Text>
        </Card>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
        <Card style={styles.tripInfo}>
          <View style={styles.tripRow}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={[typography.titleSmall, { color: colors.text, marginLeft: spacing.sm }]}>
              الرحلة: {activeTrip.tripNumber}
            </Text>
          </View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {activeTrip.busId?.busNumber ?? '--'} | {activeTrip.routeId?.routeName ?? '--'}
          </Text>
        </Card>

        <View style={[styles.cameraZone, isLarge && { height: 350 }]}>
          <View style={styles.scanFrame}>
            <Ionicons name="qr-code" size={64} color={colors.textTertiary} />
          </View>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            أدخل رقم الطالب أو امسح رمز QR
          </Text>
        </View>

        {scanned && scannedName && (
          <Card style={styles.successCard}>
            <View style={styles.successRow}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <Text style={[typography.titleSmall, { color: colors.success }]}>تم التسجيل</Text>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{scannedName}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={[styles.inputCard, isLarge && { maxWidth: 500, alignSelf: 'center', width: '100%' }]}>
          <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>رقم الطالب</Text>
          <TextInput
            style={[styles.input, isLarge && { maxWidth: 400, alignSelf: 'center' }]}
            placeholder="أدخل رقم الطالب (مثال: STU-001)"
            placeholderTextColor={colors.textTertiary}
            value={studentNumber}
            onChangeText={setStudentNumber}
            autoCapitalize="characters"
          />
        </Card>

        <View style={[styles.btnOuter, isLarge && { maxWidth: 500, alignSelf: 'center', width: '100%' }]}>
          <TouchableOpacity style={styles.scanBtn} onPress={handleCheckIn} activeOpacity={0.7} disabled={loading || !studentNumber.trim()}>
            <LinearGradient
              colors={loading || !studentNumber.trim() ? [colors.textTertiary, colors.textTertiary] : [colors.secondary, colors.secondaryDark]}
              style={styles.btnGradient}
            >
              <Ionicons name="checkmark-circle" size={22} color={colors.textInverse} />
              <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>
                {loading ? 'جاري التسجيل...' : 'تسجيل الحضور'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Card style={{ marginTop: spacing.md, borderColor: colors.info + '30', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
              للطالب أن يُظهر رمز QR الخاص به ليتم مسحه أو أدخل رقم الطالب يدوياً
            </Text>
          </View>
        </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tripInfo: { marginBottom: spacing.sm },
  tripRow: { flexDirection: 'row', alignItems: 'center' },
  cameraZone: { height: 250, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  scanFrame: { width: 120, height: 120, borderRadius: borderRadius.xl, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  successCard: { borderColor: colors.success, borderWidth: 2, borderRadius: borderRadius.lg },
  successRow: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontFamily: 'Cairo-Regular', fontSize: 16, color: colors.text, textAlign: 'center', backgroundColor: colors.surfaceVariant },
  scanBtn: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: borderRadius.lg },
  inputCard: { marginTop: spacing.md },
  btnOuter: { padding: spacing.md },
});
