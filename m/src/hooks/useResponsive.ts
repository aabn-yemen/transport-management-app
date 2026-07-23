import { useWindowDimensions, Platform } from 'react-native';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmall = width < BREAKPOINTS.sm;
  const isMedium = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
  const isLarge = width >= BREAKPOINTS.lg;
  const isXLarge = width >= BREAKPOINTS.xl;

  const numColumns = width >= BREAKPOINTS.xl ? 4 : width >= BREAKPOINTS.lg ? 3 : width >= BREAKPOINTS.sm ? 2 : 1;

  const contentMaxWidth = isXLarge ? 1400 : isLarge ? 1100 : '100%' as any;

  const horizontalPadding = isXLarge ? 32 : isLarge ? 24 : 16;

  const modalWidth = isXLarge ? '60%' : isLarge ? '70%' : isMedium ? '80%' : '90%';

  const isWeb = Platform.OS === 'web';

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    numColumns,
    contentMaxWidth,
    horizontalPadding,
    modalWidth,
    isWeb,
    breakpoints: BREAKPOINTS,
  };
}
