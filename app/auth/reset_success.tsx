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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthService } from '@/services/auth';

const ResetSuccess: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const router = useRouter();
  const { email } = useLocalSearchParams();

  // Password validation function
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // Handle password input change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(''); // Clear error when user starts typing
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(''); // Clear error when user starts typing
  };

  // Handle password reset
  const handleResetPassword = async () => {
    // Validate inputs
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!email || typeof email !== 'string') {
      Alert.alert('Error', 'Email not found. Please start the process again.');
      return;
    }

    setLoading(true);
    setPasswordError('');
    setConfirmPasswordError('');

    try {
      const { success, error, message } = await AuthService.resetPasswordWithOTP(email, password);

      if (!success) {
        Alert.alert(
          'Error',
          error || 'Failed to reset password. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Success - navigate to success screen
        router.push('/auth/reset_success');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password.trim() && confirmPassword.trim() && password === confirmPassword && validatePassword(password);

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
          <Text className="text-2xl text-heading mb-2">Create New Password 🔒</Text>
          <Text className="text-subheading leading-6">
            Enter your new password below. Make sure it's at least 8 characters long.
          </Text>
        </View>

        {/* New Password Input */}
        <View className="mb-6">
          <Text className="text-label mb-2">New Password</Text>
          <View className={`flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 ${passwordError ? 'border border-red-500' : ''}`}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter new password"
              placeholderTextColor="#888"
              className="flex-1 text-black dark:text-white ml-3"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="p-1"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">{passwordError}</Text>
          ) : null}
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="text-label mb-2">Confirm New Password</Text>
          <View className={`flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 ${confirmPasswordError ? 'border border-red-500' : ''}`}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Confirm new password"
              placeholderTextColor="#888"
              className="flex-1 text-black dark:text-white ml-3"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1"
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text className="text-red-500 text-sm mt-1 ml-1">{confirmPasswordError}</Text>
          ) : null}
        </View>

        {/* Password Requirements */}
        <View className="mb-6">
          <Text className="text-sm text-subheading">Password Requirements:</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons
              name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={password.length >= 8 ? '#10B981' : '#6B7280'}
            />
            <Text className={`text-sm ml-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              At least 8 characters
            </Text>
          </View>
        </View>

        {/* Reset Password Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleResetPassword}
            className={`btn-primary py-5 mx-5 ${(!isFormValid || loading) ? 'opacity-50' : ''}`}
            disabled={!isFormValid || loading}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetSuccess;