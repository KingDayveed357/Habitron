import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../components/ui/BackButton';
import { useRouter } from 'expo-router';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) return;

    setLoading(true);

    try {
      router.push('/auth/enter_otp');
    } catch (error) {
      console.error('Failed to send OTP:', error);
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
            Enter the email associated with your Habitron account to receive a password reset code.
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="text-label mb-2">Your Registered Email</Text>
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              className="flex-1 text-black dark:text-white"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Send OTP Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleSendOTP}
            className={`btn-primary py-5 mx-5 ${!email ? 'opacity-50' : ''}`}
            disabled={!email || loading}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Sending...' : 'Send OTP Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
