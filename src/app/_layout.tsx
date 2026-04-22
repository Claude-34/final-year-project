import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { hydrateAuthSession } from '@/features/auth/auth.bootstrap';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { queryClient } from '@/services/query/queryClient';
import { useUiStore } from '@/store/ui.store';
import { ThemeProvider } from '@/theme/ThemeProvider';

function ThemedStatusBar() {
  const isDark = useUiStore((s) => s.darkMode);
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function RootStack() {
  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
        <Stack.Screen name="assistant" options={{ presentation: 'modal' }} />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="detection" />
        <Stack.Screen name="community" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useOfflineSync();

  useEffect(() => {
    void hydrateAuthSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
