import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { loadStoredAuth, getProfile } from '../store/slices/authSlice';
import { colors } from '../theme/colors';

export default function Index() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, initialLoading } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !initialLoading) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, initialLoading]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !initialLoading) {
      if (user) {
        const role = user.role;
        if (role === 'admin' || role === 'super_admin') router.replace('/(admin)/dashboard');
        else if (role === 'transport_manager' || role === 'dispatcher') router.replace('/(employee)/dashboard');
        else if (role === 'driver') router.replace('/(driver)/dashboard');
        else if (role === 'student') router.replace('/(student)/dashboard');
        else if (role === 'parent') router.replace('/(parent)/dashboard');
        else router.replace('/(auth)/login');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, user, initialLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
