import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useUserStore } from '../src/store/userStore';

export default function RootLayout() {
  const { isAuthenticated, isOnboarded, loadStoredAuth } = useUserStore();
  const [initializing, setInitializing] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        await loadStoredAuth();
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'login';
    const inOnboardingGroup = segments[0] === 'genre-select' || segments[0] === 'username-input';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !isOnboarded && !inOnboardingGroup) {
      router.replace('/genre-select');
    } else if (isAuthenticated && isOnboarded && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isOnboarded, initializing, segments]);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000000' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="genre-select" options={{ headerShown: false }} />
          <Stack.Screen name="username-input" options={{ headerShown: false }} />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
