// /components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  redirectTo = '/auth/signin'
}) => {
  const { user, loading } = useAuth();

  // Use useEffect for navigation instead of calling it during render
  useEffect(() => {
    if (!loading && !user && redirectTo) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        router.replace(redirectTo as any);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, redirectTo]);

  if (loading) {
    return fallback || (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    // Show loading state while redirecting
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Authentication Required</Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-2">Redirecting to login...</Text>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};


