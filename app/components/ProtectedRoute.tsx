// /components/ProtectedRoute.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
// import { router } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  redirectTo = '/(auth)/login'
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback || (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    // Redirect to login
    if (redirectTo) {
      navigate(redirectTo as any);
    }
    
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Authentication Required</Text>
        <Text className="text-gray-600 dark:text-gray-400">Redirecting to login...</Text>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};