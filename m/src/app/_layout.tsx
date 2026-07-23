import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { StatusBar } from 'expo-status-bar';
import { SocketProvider } from '../providers/SocketProvider';
import { AlertProvider } from '../components/ui/Alert';
import { useFonts } from 'expo-font';
import { I18nManager } from 'react-native';

I18nManager.forceRTL(true);
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 1000 * 60 * 2, gcTime: 1000 * 60 * 5 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo: require('@expo-google-fonts/cairo/400Regular/Cairo_400Regular.ttf'),
    Cairo_Medium: require('@expo-google-fonts/cairo/500Medium/Cairo_500Medium.ttf'),
    Cairo_SemiBold: require('@expo-google-fonts/cairo/600SemiBold/Cairo_600SemiBold.ttf'),
    Cairo_Bold: require('@expo-google-fonts/cairo/700Bold/Cairo_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <SocketProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="(employee)" options={{ headerShown: false }} />
              <Stack.Screen name="(driver)" options={{ headerShown: false }} />
              <Stack.Screen name="(student)" options={{ headerShown: false }} />
              <Stack.Screen name="(parent)" options={{ headerShown: false }} />
            </Stack>
          </SocketProvider>
        </AlertProvider>
      </QueryClientProvider>
    </Provider>
  );
}