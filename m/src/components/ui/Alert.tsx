import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, useWindowDimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'loading';

interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  show: (config: AlertConfig) => void;
  hide: () => void;
  toast: (type: AlertType, title: string, message?: string) => void;
}

const AlertContext = createContext<AlertContextType>({
  show: () => {},
  hide: () => {},
  toast: () => {},
});

export const useAlert = () => useContext(AlertContext);

const getIcon = (type: AlertType) => {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
    case 'confirm': return '?';
    case 'loading': return '';
  }
};

const getColors = (type: AlertType) => {
  switch (type) {
    case 'success': return { bg: colors.successLight, icon: colors.success, text: colors.successDark };
    case 'error': return { bg: colors.dangerLight, icon: colors.danger, text: colors.dangerDark };
    case 'warning': return { bg: colors.warningLight, icon: colors.warning, text: colors.warningDark };
    case 'info': return { bg: colors.infoLight, icon: colors.info, text: colors.infoDark };
    case 'confirm': return { bg: colors.infoLight, icon: colors.info, text: colors.infoDark };
    case 'loading': return { bg: colors.surfaceVariant, icon: colors.primary, text: colors.text };
  }
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ type: 'info', title: '', message: '' });
  const [toasts, setToasts] = useState<Array<AlertConfig & { id: number }>>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const toastId = useRef(0);

  const dialogMaxWidth = screenWidth >= 1280 ? 420 : screenWidth >= 1024 ? 380 : 340;

  const show = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
    Animated.spring(scaleAnim, { toValue: 1, damping: 15, stiffness: 200, mass: 0.8, useNativeDriver: true }).start();
    if (cfg.type === 'loading') {
      Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 1500, useNativeDriver: true })).start();
    }
  }, []);

  const hide = useCallback(() => {
    Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setVisible(false);
      rotateAnim.setValue(0);
    });
  }, []);

  const toast = useCallback((type: AlertType, title: string, message?: string) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, type, title, message: message || '' }]);
    Animated.spring(translateY, { toValue: 0, damping: 15, stiffness: 200, mass: 0.8, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }).start();
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 250);
    }, 3000);
  }, []);

  const handleConfirm = () => {
    config.onConfirm?.();
    hide();
  };

  const handleCancel = () => {
    config.onCancel?.();
    hide();
  };

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const currentColors = getColors(config.type);

  return (
    <AlertContext.Provider value={{ show, hide, toast }}>
      {children}
      {toasts.map(t => {
        const tc = getColors(t.type);
        return (
          <Animated.View key={t.id} style={[styles.toast, { backgroundColor: tc.bg, transform: [{ translateY }] }]}>
            <View style={[styles.toastIcon, { backgroundColor: tc.icon }]}>
              <Text style={styles.toastIconText}>{getIcon(t.type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.titleSmall, { color: tc.text }]}>{t.title}</Text>
              {t.message ? <Text style={[typography.caption, { color: tc.text, marginTop: 2 }]}>{t.message}</Text> : null}
            </View>
          </Animated.View>
        );
      })}
      <Modal visible={visible} transparent animationType="none" onRequestClose={hide}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.dialog, { backgroundColor: colors.surface, maxWidth: dialogMaxWidth, transform: [{ scale: scaleAnim }] }]}>
            {config.type === 'loading' ? (
              <View style={styles.loadingContainer}>
                <Animated.Text style={[styles.loadingIcon, { transform: [{ rotate: rotation }] }]}>◌</Animated.Text>
                <Text style={[typography.titleMedium, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>{config.title}</Text>
                {config.message ? <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>{config.message}</Text> : null}
              </View>
            ) : (
              <>
                <View style={[styles.iconContainer, { backgroundColor: currentColors.bg }]}>
                  <Text style={[styles.icon, { color: currentColors.icon }]}>{getIcon(config.type)}</Text>
                </View>
                <Text style={[typography.titleLarge, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>{config.title}</Text>
                {config.message ? <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>{config.message}</Text> : null}
                <View style={styles.actions}>
                  {config.type === 'confirm' ? (
                    <>
                      <TouchableOpacity onPress={handleCancel} style={[styles.button, { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={[typography.button, { color: colors.text }]}>{config.cancelText || 'إلغاء'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleConfirm} style={[styles.button, { backgroundColor: colors.primary }]}>
                        <Text style={[typography.button, { color: colors.textInverse }]}>{config.confirmText || 'تأكيد'}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity onPress={hide} style={[styles.button, { backgroundColor: currentColors.icon }]}>
                      <Text style={[typography.button, { color: '#fff' }]}>حسناً</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    zIndex: 9999,
  },
  toastIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toastIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingIcon: {
    fontSize: 48,
    color: colors.primary,
  },
});