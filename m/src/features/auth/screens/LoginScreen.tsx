import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, Animated, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradientColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows, animation } from '../../../theme/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { login } from '../../../store/slices/authSlice';
import { useAlert } from '../../../components/ui/Alert';
import { useResponsive } from '../../../hooks/useResponsive';

export const LoginScreen: React.FC = () => {
  const { isLarge, isXLarge } = useResponsive();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const alert = useAlert();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const buttonScale = useRef(new Animated.Value(1)).current;

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = 'يرجى إدخال اسم المستخدم';
    if (!password) errs.password = 'يرجى إدخال كلمة المرور';
    else if (password.length < 4) errs.password = 'كلمة المرور قصيرة جداً';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    Animated.spring(buttonScale, { toValue: 0.95, ...animation.spring, useNativeDriver: true }).start();
    const result = await dispatch(login({ username: username.trim(), password }));
    Animated.spring(buttonScale, { toValue: 1, ...animation.spring, useNativeDriver: true }).start();
    if (login.fulfilled.match(result)) {
      alert.toast('success', 'مرحباً بك', `تم تسجيل الدخول بنجاح`);
      const role = result.payload.user.role;
      const target = role === 'admin' || role === 'super_admin' ? '/(admin)/dashboard'
        : role === 'driver' ? '/(driver)/dashboard'
        : role === 'student' ? '/(student)/dashboard'
        : '/(parent)/dashboard';
      setTimeout(() => router.replace(target as any), 300);
    } else {
      const msg = (result.payload as string) || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      setErrors({ password: msg });
      alert.toast('error', 'خطأ في تسجيل الدخول', msg);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, (isLarge || isXLarge) && { alignItems: 'center' }]} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: 480 }}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="bus" size={40} color={colors.primary} />
            </View>
          </View>
          <Text style={[typography.displaySmall, { color: colors.textInverse, textAlign: 'center' }]}>
            الحركة والنقل
          </Text>
          <Text style={[typography.titleMedium, { color: colors.primaryLight, textAlign: 'center', marginTop: spacing.xs }]}>
            جامعة إقليم سبأ
          </Text>
        </LinearGradient>

        <View style={styles.formSection}>
          <Text style={[typography.headlineMedium, { color: colors.text, marginBottom: spacing.xs }]}>تسجيل الدخول</Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
            أدخل بياناتك للوصول إلى لوحة التحكم
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[typography.labelLarge, { color: colors.text, marginBottom: spacing.sm }]}>اسم المستخدم</Text>
            <View style={[styles.inputContainer, errors.username ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(t) => { setUsername(t); setErrors(prev => ({ ...prev, username: undefined })); }}
                placeholder="أدخل اسم المستخدم"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="right"
                textAlignVertical="center"
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          <View style={[styles.inputGroup, { marginTop: spacing.lg }]}>
            <Text style={[typography.labelLarge, { color: colors.text, marginBottom: spacing.sm }]}>كلمة المرور</Text>
            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors(prev => ({ ...prev, password: undefined })); }}
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                textAlign="right"
                textAlignVertical="center"
              />
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[typography.bodySmall, { color: colors.primary }]}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: spacing.xxl }}>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.loginButton}
            >
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.loginGradient}>
                {loading ? (
                  <Text style={[typography.button, { color: colors.textInverse }]}>جاري تسجيل الدخول...</Text>
                ) : (
                  <>
                    <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>تسجيل الدخول</Text>
                    <Ionicons name="log-in-outline" size={20} color={colors.textInverse} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.registerContainer}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>ليس لديك حساب؟</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700', marginRight: spacing.xs }]}>
                إنشاء حساب جديد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  headerSection: {
    paddingTop: 80,
    paddingBottom: spacing.xxxxl,
    paddingHorizontal: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xxxl,
    borderBottomRightRadius: borderRadius.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  inputGroup: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    height: 52,
    ...shadows.sm,
  },
  inputError: { borderColor: colors.danger },
  inputIcon: { marginRight: spacing.md },
  input: {
    flex: 1,
    fontFamily: 'Cairo',
    fontSize: 15,
    color: colors.text,
    height: '100%',
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: 'Cairo',
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  forgotPassword: { alignItems: 'center', marginTop: spacing.lg },
  loginButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xxxxl,
  },
});