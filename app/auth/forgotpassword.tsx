import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../components/ui/BackButton';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/auth';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(''); // Clear error when user starts typing
  };

  const handleSendOTP = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      // Call the AuthService sendPasswordResetOTP function
      const { success, error, message } = await AuthService.sendPasswordResetOTP(email.trim());

      if (!success) {
        // Show error alert
        Alert.alert(
          'Error',
          error || 'Failed to send OTP. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Success - show confirmation and navigate to OTP screen
        Alert.alert(
          'OTP Sent',
          message || 'A 4-digit OTP has been sent to your email address. Please check your inbox.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to OTP verification screen with email
                router.push({
                  pathname: '/auth/enter_otp',
                  params: { email: email.trim() }
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 app-background relative">
      <BackButton onPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        className="flex-1 pt-24 px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl text-heading mb-2">Forgot Your Password? 🔐</Text>
          <Text className="text-subheading leading-6">
            Enter the email associated with your Habitron account and we'll send you a 4-digit OTP to reset your password.
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="text-label mb-2">Your Registered Email</Text>
          <View className={`flex-row items-center bg-gray-200 dark:bg-gray-800 rounded-xl p-4 ${emailError ? 'border border-red-500' : ''}`}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              className="flex-1 text-black dark:text-white ml-3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
          {emailError ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">{emailError}</Text>
          ) : null}
        </View>

        {/* Send OTP Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleSendOTP}
            className={`btn-primary py-5 mx-5 ${(!email.trim() || loading) ? 'opacity-50' : ''}`}
            disabled={!email.trim() || loading}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;