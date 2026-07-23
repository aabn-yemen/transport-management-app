import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon,
}) => {
  const isDisabled = disabled || loading;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary': return { backgroundColor: colors.primary };
      case 'secondary': return { backgroundColor: colors.secondary };
      case 'danger': return { backgroundColor: colors.danger };
      case 'outlined': return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'text': return { backgroundColor: 'transparent' };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outlined': return { color: colors.primary };
      case 'text': return { color: colors.primary };
      default: return { color: colors.textInverse };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
      case 'lg': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl };
      default: return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress} disabled={isDisabled}
      style={[styles.container, getContainerStyle(), getSizeStyle(), isDisabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outlined' || variant === 'text' ? colors.primary : colors.textInverse} />
      ) : (
        <>
          {icon}
          <Text style={[typography.button, getTextStyle(), textStyle, icon ? { marginLeft: spacing.sm } : null]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg },
  disabled: { opacity: 0.5 },
});
