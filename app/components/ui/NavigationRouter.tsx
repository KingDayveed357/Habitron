import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import type { AppState } from '@/utils/AppStateManager';

interface NavigationRouterProps {
  initialState: AppState;
}

export const NavigationRouter: React.FC<NavigationRouterProps> = ({ initialState }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false); // Prevent infinite redirects

  useEffect(() => {
    if (loading) return;

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === 'auth';
    const inOnboarding = firstSegment === 'onboarding';
    const inTabs = firstSegment === '(tabs)';
    const inScreens = firstSegment === 'screens'; // ✅ new allowance

    // ✅ Only handle navigation if we haven't already done it
    // This prevents re-replacing every time `segments` updates
    if (hasRedirected.current) return;

    if (user) {
      // Authenticated user
      if (!inTabs && !inScreens) {
        hasRedirected.current = true;
        router.replace('/(tabs)/Home');
      }
    } else {
      // Unauthenticated user
      if (initialState === 'onboarding' && !inOnboarding) {
        hasRedirected.current = true;
        router.replace('/onboarding');
      } else if (initialState === 'auth' && !inAuthGroup) {
        hasRedirected.current = true;
        router.replace('/auth/signin');
      }
    }
  }, [user, loading, segments, initialState]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="screens" options={{ headerShown: false }} />
    </Stack>
  );
};
