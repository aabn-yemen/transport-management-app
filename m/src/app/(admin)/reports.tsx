import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAll } from '../../hooks/useApi';
import { reportsApi } from '../../api/reports';
import { colors, statusColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useResponsive } from '../../hooks/useResponsive';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { config } from '../../constants/config';

const emptyForm = { startDate: '', endDate: '' };

const reportTypes = [
  { key: 'students', label: 'الطلاب', icon: 'people' as const, color: colors.primary, apiMethod: reportsApi.getStudents },
  { key: 'drivers', label: 'السائقين', icon: 'person-circle' as const, color: colors.secondary, apiMethod: reportsApi.getDrivers },
  { key: 'buses', label: 'الحافلات', icon: 'bus' as const, color: colors.warning, apiMethod: reportsApi.getBuses },
  { key: 'attendance', label: 'الحضور', icon: 'checkmark-circle' as const, color: colors.success, apiMethod: reportsApi.getAttendance },
  { key: 'subscriptions', label: 'الاشتراكات', icon: 'card' as const, color: colors.purple, apiMethod: reportsApi.getSubscriptions },
  { key: 'maintenance', label: 'الصيانة', icon: 'construct' as const, color: colors.warning, apiMethod: reportsApi.getMaintenance },
  { key: 'fuel', label: 'الوقود', icon: 'flame' as const, color: colors.danger, apiMethod: reportsApi.getFuel },
  { key: 'financial', label: 'المالية', icon: 'cash' as const, color: colors.success, apiMethod: reportsApi.getFinancial },
];

const reportFields: Record<string, { key: string; label: string; format?: (v: any) => string }[]> = {
  students: [
    { key: 'fullName', label: 'الاسم' },
    { key: 'studentNumber', label: 'رقم الطالب' },
    { key: 'universityId', label: 'الرقم الجامعي' },
    { key: 'college', label: 'الكلية' },
    { key: 'department', label: 'القسم' },
    { key: 'academicLevel', label: 'المستوى' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'gender', label: 'الجنس', format: (v) => v === 'male' ? 'ذكر' : v === 'female' ? 'أنثى' : v },
    { key: 'status', label: 'الحالة', format: (v) => v === 'active' ? 'نشط' : v === 'inactive' ? 'غير نشط' : v === 'suspended' ? 'موقوف' : v === 'graduated' ? 'خريج' : v },
    { key: 'busId', label: 'الحافلة', format: (v) => v?.busNumber || '--' },
    { key: 'routeId', label: 'المسار', format: (v) => v?.routeName || '--' },
  ],
  drivers: [
    { key: 'fullName', label: 'الاسم' },
    { key: 'driverNumber', label: 'رقم السائق' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'nationalId', label: 'رقم الهوية' },
    { key: 'licenseNumber', label: 'رقم الرخصة' },
    { key: 'licenseExpiry', label: 'انتهاء الرخصة', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'busId', label: 'الحافلة', format: (v) => v?.busNumber || '--' },
    { key: 'salary', label: 'الراتب', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'status', label: 'الحالة', format: (v) => v === 'active' ? 'نشط' : v === 'inactive' ? 'غير نشط' : v },
    { key: 'rating', label: 'التقييم', format: (v) => v != null ? `${v}/5` : '--' },
  ],
  buses: [
    { key: 'busNumber', label: 'رقم الحافلة' },
    { key: 'plateNumber', label: 'رقم اللوحة' },
    { key: 'brand', label: 'العلامة التجارية' },
    { key: 'modelName', label: 'الموديل' },
    { key: 'year', label: 'السنة' },
    { key: 'capacity', label: 'السعة' },
    { key: 'currentStudents', label: 'عدد الطلاب الحالي' },
    { key: 'fuelLevel', label: 'مستوى الوقود', format: (v) => `${v ?? 0}%` },
    { key: 'driverId', label: 'السائق', format: (v) => v?.fullName || '--' },
    { key: 'routeId', label: 'المسار', format: (v) => v?.routeName || '--' },
    { key: 'status', label: 'الحالة', format: (v) => v === 'active' ? 'نشط' : v === 'maintenance' ? 'صيانة' : v === 'inactive' ? 'غير نشط' : v },
  ],
  attendance: [
    { key: 'studentId', label: 'الطالب', format: (v) => v?.fullName || v?.studentNumber || '--' },
    { key: 'tripDate', label: 'التاريخ', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'status', label: 'حالة الحضور', format: (v) => v === 'present' ? 'حاضر' : v === 'absent' ? 'غائب' : v === 'late' ? 'متأخر' : v === 'excused' ? 'مستأذن' : v },
    { key: 'checkInTime', label: 'وقت الدخول', format: (v) => v ? new Date(v).toLocaleTimeString('ar-SA') : '--' },
    { key: 'checkOutTime', label: 'وقت الخروج', format: (v) => v ? new Date(v).toLocaleTimeString('ar-SA') : '--' },
    { key: 'tripId', label: 'الرحلة', format: (v) => v?.tripNumber || '--' },
    { key: 'checkInMethod', label: 'طريقة الدخول', format: (v) => v === 'qr' ? 'QR' : v === 'manual' ? 'يدوي' : v === 'gps' ? 'GPS' : v === 'nfc' ? 'NFC' : v || '--' },
  ],
  subscriptions: [
    { key: 'studentId', label: 'الطالب', format: (v) => v?.fullName || v?.studentNumber || '--' },
    { key: 'busId', label: 'الحافلة', format: (v) => v?.busNumber || '--' },
    { key: 'amount', label: 'المبلغ', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'discount', label: 'الخصم', format: (v) => v != null ? `${v} ر.س` : '0 ر.س' },
    { key: 'totalAmount', label: 'الإجمالي', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'startDate', label: 'تاريخ البداية', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'endDate', label: 'تاريخ الانتهاء', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'paymentStatus', label: 'حالة الدفع', format: (v) => v === 'paid' ? 'مدفوع' : v === 'pending' ? 'قيد الانتظار' : v === 'partial' ? 'جزئي' : v === 'refunded' ? 'مسترد' : v === 'cancelled' ? 'ملغي' : v },
    { key: 'status', label: 'الحالة', format: (v) => v === 'active' ? 'نشط' : v === 'expired' ? 'منتهي' : v === 'suspended' ? 'موقوف' : v === 'cancelled' ? 'ملغي' : v },
  ],
  maintenance: [
    { key: 'busId', label: 'الحافلة', format: (v) => v?.busNumber || '--' },
    { key: 'maintenanceType', label: 'نوع الصيانة', format: (v) => v?.nameAr || v?.name || '--' },
    { key: 'description', label: 'الوصف' },
    { key: 'maintenanceDate', label: 'تاريخ الصيانة', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'cost', label: 'التكلفة', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'odometer', label: 'العداد', format: (v) => v != null ? `${v} كم` : '--' },
    { key: 'status', label: 'الحالة', format: (v) => v === 'pending' ? 'قيد الانتظار' : v === 'approved' ? 'موافق عليه' : v === 'in_progress' ? 'قيد التنفيذ' : v === 'completed' ? 'مكتمل' : v === 'cancelled' ? 'ملغي' : v },
  ],
  fuel: [
    { key: 'busId', label: 'الحافلة', format: (v) => v?.busNumber || '--' },
    { key: 'driverId', label: 'السائق', format: (v) => v?.fullName || '--' },
    { key: 'liters', label: 'الكمية (لتر)', format: (v) => v != null ? `${v} لتر` : '--' },
    { key: 'price', label: 'السعر للتر', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'totalCost', label: 'التكلفة الإجمالية', format: (v) => v != null ? `${v} ر.س` : '--' },
    { key: 'station', label: 'المحطة' },
    { key: 'date', label: 'التاريخ', format: (v) => v ? new Date(v).toLocaleDateString('ar-SA') : '--' },
    { key: 'odometer', label: 'قراءة العداد', format: (v) => v != null ? `${v} كم` : '--' },
  ],
  financial: [],
};

function extractReportData(res: any): { items: any[]; summary: any } {
  const outer = res?.data ?? res;
  const inner = outer?.data ?? outer;
  if (Array.isArray(inner?.data)) {
    return { items: inner.data, summary: inner.summary ?? {} };
  }
  if (Array.isArray(inner)) {
    return { items: inner, summary: outer?.summary ?? {} };
  }
  return { items: [], summary: inner ?? outer ?? {} };
}

function formatValue(value: any, format?: (v: any) => string): string {
  if (format) return format(value);
  if (value == null || value === '') return '--';
  if (typeof value === 'object') return value?.name || value?.nameAr || value?.busNumber || value?.fullName || value?.tripNumber || value?.studentNumber || '--';
  return String(value);
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.summaryItem, { borderRightColor: color }]}>
      <Text style={[typography.headlineMedium, { color }]}>{value}</Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function FinancialSummary({ summary }: { summary: any }) {
  const items = [
    { label: 'إجمالي الاشتراكات', value: summary.revenue ?? 0, color: colors.success, icon: 'card' as const },
    { label: 'إجمالي صيانة', value: summary.expenses?.maintenance ?? 0, color: colors.warning, icon: 'construct' as const },
    { label: 'إجمالي الوقود', value: summary.expenses?.fuel ?? 0, color: colors.danger, icon: 'flame' as const },
    { label: 'إجمالي المصروفات', value: summary.expenses?.total ?? 0, color: colors.danger, icon: 'trending-down' as const },
    { label: 'صافي الإيرادات', value: summary.net ?? 0, color: summary.net >= 0 ? colors.success : colors.danger, icon: 'cash' as const },
  ];
  return (
    <View style={styles.financialGrid}>
      {items.map((item, i) => (
        <Card key={i} style={[styles.financialCard, { borderRightWidth: 3, borderRightColor: item.color }]}>
          <Ionicons name={item.icon} size={20} color={item.color} style={{ marginBottom: spacing.xs }} />
          <Text style={[typography.headlineMedium, { color: item.color }]}>{item.value.toLocaleString('ar-SA')} ر.س</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.label}</Text>
        </Card>
      ))}
    </View>
  );
}

export default function ReportsScreen() {
  const { contentMaxWidth } = useResponsive();
  const { data: dashboard, isLoading, refetch } = useGetAll<any>(['report-dashboard'], reportsApi.getDashboard);
  const [form, setForm] = useState(emptyForm);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const setField = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadReport = async (report: typeof reportTypes[0]) => {
    setActiveReport(report.key);
    setLoadingReport(true);
    setReportData([]);
    setReportSummary(null);
    try {
      const params: Record<string, any> = {};
      if (form.startDate.trim()) params.startDate = form.startDate.trim();
      if (form.endDate.trim()) params.endDate = form.endDate.trim();
      const res = await report.apiMethod(Object.keys(params).length ? params : undefined);
      const { items, summary } = extractReportData(res);
      setReportData(items);
      setReportSummary(summary);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل جلب التقرير');
    } finally {
      setLoadingReport(false);
    }
  };

  const exportPdf = async (reportKey: string) => {
    setExportingPdf(true);
    try {
      const params: Record<string, any> = { type: reportKey };
      if (form.startDate.trim()) params.startDate = form.startDate.trim();
      if (form.endDate.trim()) params.endDate = form.endDate.trim();
      const res = await reportsApi.exportPdf(reportKey, params);
      let base64Data: string;
      const data = res.data;
      if (typeof data === 'string') {
        base64Data = data;
      } else if (data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        base64Data = global.btoa(binary);
      } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
        base64Data = data.toString('base64');
      } else {
        const blob = data as Blob;
        const arrayBuf = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        base64Data = global.btoa(binary);
      }
      const now = new Date();
      const fileName = `SUTMS_${reportKey}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;
      const fileUri = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '') + fileName;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      await Linking.openURL(fileUri);
      Alert.alert('تم بنجاح', `تم تصدير التقرير: ${fileName}`);
    } catch (err: any) {
      Alert.alert('خطأ', 'فشل تصدير التقرير. تأكد من أن الخادم يدعم التصدير.');
    } finally {
      setExportingPdf(false);
    }
  };

  const activeReportConfig = reportTypes.find((r) => r.key === activeReport);
  const fields = activeReport ? reportFields[activeReport] ?? [] : [];

  const renderSummary = () => {
    if (!reportSummary || !activeReport || activeReport === 'financial') return null;
    const summaryItems: { label: string; value: string | number; color: string }[] = [];
    const s = reportSummary;
    switch (activeReport) {
      case 'students':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.primary },
          { label: 'نشط', value: s.active ?? 0, color: colors.success },
          { label: 'ذكور', value: s.male ?? 0, color: colors.info },
          { label: 'إناث', value: s.female ?? 0, color: colors.purple },
        );
        break;
      case 'drivers':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.secondary },
          { label: 'نشط', value: s.active ?? 0, color: colors.success },
          { label: 'معين', value: s.assigned ?? 0, color: colors.info },
        );
        break;
      case 'buses':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.warning },
          { label: 'نشط', value: s.active ?? 0, color: colors.success },
          { label: 'صيانة', value: s.maintenance ?? 0, color: colors.danger },
          { label: 'السعة', value: s.totalCapacity ?? 0, color: colors.info },
        );
        break;
      case 'attendance':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.primary },
          { label: 'حاضر', value: s.present ?? 0, color: colors.success },
          { label: 'غائب', value: s.absent ?? 0, color: colors.danger },
          { label: 'متأخر', value: s.late ?? 0, color: colors.warning },
        );
        break;
      case 'subscriptions':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.purple },
          { label: 'نشط', value: s.active ?? 0, color: colors.success },
          { label: 'منتهي', value: s.expired ?? 0, color: colors.danger },
          { label: 'الإيرادات', value: `${(s.totalRevenue ?? 0).toLocaleString('ar-SA')} ر.س`, color: colors.success },
        );
        break;
      case 'maintenance':
        summaryItems.push(
          { label: 'الإجمالي', value: s.total ?? reportData.length, color: colors.warning },
          { label: 'قيد الانتظار', value: s.pending ?? 0, color: colors.danger },
          { label: 'مكتمل', value: s.completed ?? 0, color: colors.success },
          { label: 'التكلفة', value: `${(s.totalCost ?? 0).toLocaleString('ar-SA')} ر.س`, color: colors.danger },
        );
        break;
      case 'fuel':
        summaryItems.push(
          { label: 'السجلات', value: s.count ?? reportData.length, color: colors.danger },
          { label: 'الكمية', value: `${s.totalLiters ?? 0} لتر`, color: colors.info },
          { label: 'التكلفة', value: `${(s.totalCost ?? 0).toLocaleString('ar-SA')} ر.س`, color: colors.danger },
        );
        break;
    }
    if (summaryItems.length === 0) return null;
    return (
      <Card style={styles.summaryCard}>
        <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>ملخص التقرير</Text>
        <View style={styles.summaryGrid}>
          {summaryItems.map((item, i) => (
            <SummaryCard key={i} label={item.label} value={item.value} color={item.color} />
          ))}
        </View>
      </Card>
    );
  };

  const renderRecords = () => {
    if (activeReport === 'financial') {
      return <FinancialSummary summary={reportSummary ?? {}} />;
    }
    if (fields.length === 0) return null;
    return reportData.map((item: any, i: number) => (
      <Card key={item._id ?? item.id ?? i} style={styles.recordCard}>
        <View style={styles.recordIndex}>
          <Text style={[typography.labelSmall, { color: colors.textInverse }]}>{i + 1}</Text>
        </View>
        {fields.map((field) => {
          const rawValue = field.key.includes('.') ? field.key.split('.').reduce((o, k) => o?.[k], item) : item[field.key];
          const displayValue = formatValue(rawValue, field.format);
          if (displayValue === '--' && !item[field.key] && !field.key.includes('.')) return null;
          return (
            <View key={field.key} style={styles.recordRow}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, width: 120 }]} numberOfLines={1}>{field.label}</Text>
              <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'right', flex: 1 }]} numberOfLines={1}>
                {displayValue}
              </Text>
            </View>
          );
        })}
      </Card>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxxl }}
          >
            {dashboard && (
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Ionicons name="people" size={20} color={colors.primary} style={{ marginBottom: spacing.xs }} />
                  <Text style={[typography.displaySmall, { color: colors.primary }]}>{dashboard.totalStudents ?? 0}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الطلاب</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="person-circle" size={20} color={colors.secondary} style={{ marginBottom: spacing.xs }} />
                  <Text style={[typography.displaySmall, { color: colors.secondary }]}>{dashboard.totalDrivers ?? 0}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>السائقين</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="bus" size={20} color={colors.warning} style={{ marginBottom: spacing.xs }} />
                  <Text style={[typography.displaySmall, { color: colors.warning }]}>{dashboard.totalBuses ?? 0}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الحافلات</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="navigate" size={20} color={colors.info} style={{ marginBottom: spacing.xs }} />
                  <Text style={[typography.displaySmall, { color: colors.info }]}>{dashboard.activeTrips ?? 0}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>الرحلات النشطة</Text>
                </Card>
              </View>
            )}

            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[typography.titleSmall, { color: colors.text, marginBottom: spacing.md }]}>فلتر بالتاريخ</Text>
              <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.xs }]}>من تاريخ</Text>
                  <TextInput
                    style={styles.filterInput} value={form.startDate} onChangeText={(v) => setField('startDate', v)}
                    placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.xs }]}>إلى تاريخ</Text>
                  <TextInput
                    style={styles.filterInput} value={form.endDate} onChangeText={(v) => setField('endDate', v)}
                    placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} textAlign="right"
                  />
                </View>
              </View>
            </Card>

            <Text style={[typography.titleMedium, { marginBottom: spacing.md, color: colors.text }]}>أنواع التقارير</Text>
            <View style={styles.grid}>
              {reportTypes.map((r) => {
                const isActive = activeReport === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.reportBtn, isActive && { backgroundColor: r.color + '10', borderWidth: 1, borderColor: r.color }]}
                    activeOpacity={0.7}
                    onPress={() => loadReport(r)}
                  >
                    <View style={[styles.reportIcon, { backgroundColor: r.color + '15' }]}>
                      <Ionicons name={r.icon} size={24} color={r.color} />
                    </View>
                    <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'center', marginTop: spacing.sm }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeReportConfig && (
              <View style={{ marginTop: spacing.xl }}>
                <View style={styles.reportHeaderRow}>
                  <Text style={[typography.titleMedium, { color: colors.text, flex: 1 }]}>تقرير {activeReportConfig.label}</Text>
                  {reportData.length > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: activeReportConfig.color + '15' }]}>
                      <Text style={[typography.bodySmall, { color: activeReportConfig.color }]}>{reportData.length} سجل</Text>
                    </View>
                  )}
                  {reportData.length > 0 && (
                    <TouchableOpacity
                      style={[styles.exportBtn, { backgroundColor: activeReportConfig.color }]}
                      onPress={() => exportPdf(activeReportConfig.key)}
                      disabled={exportingPdf}
                    >
                      {exportingPdf ? (
                        <ActivityIndicator size="small" color={colors.textInverse} />
                      ) : (
                        <Ionicons name="download-outline" size={16} color={colors.textInverse} />
                      )}
                      <Text style={[typography.labelMedium, { color: colors.textInverse, marginLeft: spacing.xs }]}>PDF</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {loadingReport ? (
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                ) : reportData.length > 0 || (activeReport === 'financial' && reportSummary) ? (
                  <>
                    {renderSummary()}
                    {renderRecords()}
                  </>
                ) : (
                  <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
                    <Ionicons name="document-text-outline" size={40} color={colors.textTertiary} />
                    <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>لا توجد بيانات</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { width: '48%', alignItems: 'center', paddingVertical: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.md },
  filterInput: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.sm, fontSize: 14, fontFamily: 'Cairo', color: colors.text, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  reportBtn: { alignItems: 'center', width: '47%', padding: spacing.lg, borderRadius: borderRadius.xl, backgroundColor: colors.surface },
  reportIcon: { width: 52, height: 52, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  reportHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  countBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.md },
  exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  summaryCard: { marginBottom: spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryItem: { width: '48%', alignItems: 'center', paddingVertical: spacing.sm, borderRightWidth: 3, paddingRight: spacing.sm },
  financialGrid: { gap: spacing.sm },
  financialCard: { marginBottom: spacing.sm },
  recordCard: { marginBottom: spacing.sm, position: 'relative' },
  recordIndex: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.full, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  recordRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
});
