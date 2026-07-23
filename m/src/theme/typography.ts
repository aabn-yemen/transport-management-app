import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Cairo',
  medium: 'Cairo_Medium',
  semiBold: 'Cairo_SemiBold',
  bold: 'Cairo_Bold',
} as const;

export const typography: Record<string, TextStyle> = {
  displayLarge: { fontFamily: fontFamily.bold, fontSize: 34, lineHeight: 44, letterSpacing: -0.5 },
  displayMedium: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 38, letterSpacing: -0.3 },
  displaySmall: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  headlineLarge: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 30 },
  headlineMedium: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 28 },
  headlineSmall: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 26 },
  titleLarge: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 24 },
  titleMedium: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22 },
  titleSmall: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 22 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 18 },
  labelLarge: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  labelMedium: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  labelSmall: { fontFamily: fontFamily.medium, fontSize: 10, lineHeight: 14 },
  button: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  buttonSmall: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 14, letterSpacing: 1.5 },
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};