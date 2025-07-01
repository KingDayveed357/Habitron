import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const DevResetButton: React.FC = () => {
  const resetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear all onboarding and login data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'hasOnboarded',
                'isLoggedIn',
                'onboardingData'
              ]);
              // Restart the app flow
              router.replace('/');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
            }
          }
        }
      ]
    );
  };

  // Only show in development
  if (__DEV__) {
    return (
      <View className="absolute top-12 right-4 z-50">
        <TouchableOpacity
          onPress={resetOnboarding}
          className="bg-red-500 px-3 py-2 rounded"
        >
          <Text className="text-white text-xs font-bold">DEV: Reset</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

export default DevResetButton;