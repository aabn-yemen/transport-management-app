import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, Animated, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import apiClient from '../../../api/client';
import { useAlert } from '../../../components/ui/Alert';
import { useResponsive } from '../../../hooks/useResponsive';

const STEPS = ['البيانات الشخصية', 'رقم الطالب', 'كلمة المرور'];

export const RegisterScreen: React.FC = () => {
  const { isLarge, isXLarge } = useResponsive();
  const router = useRouter();
  const alert = useAlert();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getPasswordStrength = (p: string): { label: string; color: string; width: string } => {
    if (!p) return { label: '', color: colors.disabled, width: '0%' };
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /\d/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (p.length < 6) return { label: 'ضعيفة', color: colors.danger, width: '25%' };
    if (score < 2) return { label: 'متوسطة', color: colors.warning, width: '50%' };
    if (score < 3) return { label: 'جيدة', color: colors.info, width: '75%' };
    return { label: 'قوية', color: colors.success, width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const animateForward = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      cb();
      slideAnim.setValue(50);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!fullName.trim()) errs.fullName = 'يرجى إدخال الاسم الكامل';
      else if (fullName.trim().length < 3) errs.fullName = 'الاسم قصير جداً';
      if (!email.trim()) errs.email = 'يرجى إدخال البريد الإلكتروني';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'البريد الإلكتروني غير صالح';
      if (!phone.trim()) errs.phone = 'يرجى إدخال رقم الهاتف';
    } else if (step === 1) {
      if (!studentNumber.trim()) errs.studentNumber = 'يرجى إدخال رقم الطالب';
    } else if (step === 2) {
      if (!password) errs.password = 'يرجى إدخال كلمة المرور';
      else if (password.length < 6) errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      if (password !== confirmPassword) errs.confirmPassword = 'كلمة المرور غير متطابقة';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step < 2) animateForward(() => setStep(step + 1));
  };

  const prevStep = () => {
    if (step > 0) animateForward(() => setStep(step - 1));
  };

  const handleRegister = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: 'student',
        studentNumber: studentNumber.trim(),
      };
      if (universityId.trim()) payload.universityId = universityId.trim();
      if (college.trim()) payload.college = college.trim();
      if (department.trim()) payload.department = department.trim();

      const { data } = await apiClient.post('/auth/register', payload);
      if (data.success) {
        alert.show({ type: 'success', title: 'تم إنشاء الحساب', message: 'تم إنشاء حسابك بنجاح، يمكنك تسجيل الدخول الآن' });
        setTimeout(() => router.replace('/(auth)/login'), 1000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
      alert.toast('error', 'خطأ', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <View>
          <Text style={[typography.headlineMedium, { color: colors.text }]}>ما اسمك؟</Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl }]}>أدخل بياناتك الشخصية للبدء</Text>
          <View style={[styles.inputContainer, errors.fullName ? styles.inputError : null]}>
            <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={fullName} onChangeText={(t) => { setFullName(t); setErrors({}); }} placeholder="الاسم الكامل" placeholderTextColor={colors.textTertiary} textAlign="right" />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          <View style={[styles.inputContainer, { marginTop: spacing.lg }, errors.email ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={email} onChangeText={(t) => { setEmail(t); setErrors({}); }} placeholder="البريد الإلكتروني" placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" textAlign="right" />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          <View style={[styles.inputContainer, { marginTop: spacing.lg }, errors.phone ? styles.inputError : null]}>
            <Ionicons name="call-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={phone} onChangeText={(t) => { setPhone(t); setErrors({}); }} placeholder="رقم الهاتف" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" textAlign="right" />
          </View>
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>
      );
      case 1: return (
        <View>
          <Text style={[typography.headlineMedium, { color: colors.text }]}>معلومات الطالب</Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl }]}>أدخل رقم الطالب والمعلومات الأكاديمية</Text>
          <View style={[styles.inputContainer, errors.studentNumber ? styles.inputError : null]}>
            <Ionicons name="school-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={studentNumber} onChangeText={(t) => { setStudentNumber(t); setErrors({}); }} placeholder="رقم الطالب (مثال: STU-2024-001)" placeholderTextColor={colors.textTertiary} autoCapitalize="characters" textAlign="right" />
          </View>
          {errors.studentNumber ? <Text style={styles.errorText}>{errors.studentNumber}</Text> : null}
          <View style={[styles.inputContainer, { marginTop: spacing.lg }]}>
            <Ionicons name="finger-print-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={universityId} onChangeText={setUniversityId} placeholder="الرقم الجامعي (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" />
          </View>
          <View style={[styles.inputContainer, { marginTop: spacing.lg }]}>
            <Ionicons name="business-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={college} onChangeText={setCollege} placeholder="الكلية (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" />
          </View>
          <View style={[styles.inputContainer, { marginTop: spacing.lg }]}>
            <Ionicons name="ribbon-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="القسم (اختياري)" placeholderTextColor={colors.textTertiary} textAlign="right" />
          </View>
        </View>
      );
      case 2: return (
        <View>
          <Text style={[typography.headlineMedium, { color: colors.text }]}>كلمة المرور</Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl }]}>اختر كلمة مرور قوية لحماية حسابك</Text>
          <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: spacing.md }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="كلمة المرور" placeholderTextColor={colors.textTertiary} secureTextEntry={!showPassword} textAlign="right" />
          </View>
          {password ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              <Text style={[typography.caption, { color: strength.color, marginRight: spacing.sm }]}>{strength.label}</Text>
            </View>
          ) : null}
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          <View style={[styles.inputContainer, { marginTop: spacing.lg }, errors.confirmPassword ? styles.inputError : null]}>
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ marginLeft: spacing.md }}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="تأكيد كلمة المرور" placeholderTextColor={colors.textTertiary} secureTextEntry={!showConfirm} textAlign="right" />
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, (isLarge || isXLarge) && { alignItems: 'center' }]} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: 480 }}>
        <View style={styles.header}>
          <Text style={[typography.displaySmall, { color: colors.text, textAlign: 'center' }]}>إنشاء حساب طالب</Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            الخطوة {step + 1} من 3
          </Text>
        </View>

        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressStep}>
              <View style={[styles.progressDot, i <= step ? styles.progressActive : styles.progressInactive]}>
                <Text style={[typography.caption, { color: i <= step ? colors.textInverse : colors.textTertiary }]}>{i + 1}</Text>
              </View>
              <Text style={[typography.caption, { color: i <= step ? colors.primary : colors.textTertiary, marginTop: spacing.xs }]}>{s}</Text>
              {i < 2 && <View style={[styles.progressLine, i < step ? styles.progressLineActive : null]} />}
            </View>
          ))}
        </View>

        <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          {renderStep()}
        </Animated.View>

        <View style={styles.actionsContainer}>
          {step > 0 && (
            <TouchableOpacity onPress={prevStep} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, marginLeft: spacing.md }]}>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
              <Text style={[typography.button, { color: colors.text, marginRight: spacing.sm }]}>السابق</Text>
            </TouchableOpacity>
          )}
          {step < 2 ? (
            <TouchableOpacity onPress={nextStep} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
              <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>التالي</Text>
              <Ionicons name="arrow-back" size={20} color={colors.textInverse} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleRegister} disabled={loading} style={[styles.actionButton, { backgroundColor: colors.success }]}>
              {loading ? (
                <Text style={[typography.button, { color: colors.textInverse }]}>جاري الإنشاء...</Text>
              ) : (
                <>
                  <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>إنشاء الحساب</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.loginLink}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>لديك حساب بالفعل؟</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700', marginRight: spacing.xs }]}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxxxl },
  header: { paddingTop: spacing.xxxxxl, paddingHorizontal: spacing.xxl, alignItems: 'center' },
  progressContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: spacing.xxl, paddingHorizontal: spacing.xxl,
  },
  progressStep: { alignItems: 'center', flexDirection: 'row' },
  progressDot: {
    width: 32, height: 32, borderRadius: borderRadius.full,
    justifyContent: 'center', alignItems: 'center',
  },
  progressActive: { backgroundColor: colors.primary },
  progressInactive: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border },
  progressLine: {
    width: 40, height: 2, backgroundColor: colors.border, marginHorizontal: spacing.sm,
  },
  progressLineActive: { backgroundColor: colors.primary },
  formSection: { paddingHorizontal: spacing.xxl, minHeight: 300 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg, height: 52, ...shadows.sm,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: 'Cairo', fontSize: 15, color: colors.text, height: '100%', paddingVertical: 0 },
  errorText: { fontFamily: 'Cairo', fontSize: 12, color: colors.danger, marginTop: spacing.xs, textAlign: 'right' },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  strengthBar: { flex: 1, height: 4, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: borderRadius.full },
  actionsContainer: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: spacing.xxl, marginTop: spacing.xxl },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl, borderRadius: borderRadius.xl, ...shadows.sm,
  },
  loginLink: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: spacing.xxl,
  },
});
