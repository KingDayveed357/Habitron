import React, { useState, useRef, useEffect } from 'react';
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

const EnterOTP: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  
  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    if (!email || typeof email !== 'string') {
      Alert.alert('Error', 'Email not found. Please go back and try again.');
      return;
    }

    setLoading(true);

    try {
      const { success, error, message } = await AuthService.verifyPasswordResetOTP(email, otpString);

      if (!success) {
        Alert.alert(
          'Verification Failed',
          error || 'Invalid OTP. Please check and try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Success - navigate to reset password screen
        router.push({
          pathname: '/auth/forgotpassword',
          params: { email: email }
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email || typeof email !== 'string') {
      Alert.alert('Error', 'Email not found. Please go back and try again.');
      return;
    }

    setResendLoading(true);

    try {
      const { success, error, message } = await AuthService.sendPasswordResetOTP(email);

      if (!success) {
        Alert.alert(
          'Error',
          error || 'Failed to resend OTP. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'OTP Resent',
          message || 'A new OTP has been sent to your email.',
          [{ text: 'OK', style: 'default' }]
        );
        
        // Reset timer and clear current OTP
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
          <Text className="text-2xl text-heading mb-2">Enter OTP 🔢</Text>
          <Text className="text-subheading leading-6">
            We've sent a 4-digit OTP to{' '}
            <Text className="font-semibold text-heading">{email}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-6">
          <Text className="text-label mb-4">Enter 4-digit OTP</Text>
          <View className="flex-row justify-between mb-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { otpRefs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholder="0"
                placeholderTextColor="#888"
                className="w-16 h-16 text-2xl font-bold text-center bg-gray-100 dark:bg-gray-800 rounded-xl text-black dark:text-white"
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
                editable={!loading}
              />
            ))}
          </View>
        </View>

        {/* Timer and Resend */}
        <View className="mb-6">
          {!canResend ? (
            <Text className="text-center text-subheading">
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendLoading}
              className="py-2"
            >
              <Text className="text-center text-blue-600 dark:text-blue-400 font-semibold">
                {resendLoading ? 'Resending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleVerifyOTP}
            className={`btn-primary py-5 mx-5 ${(!isOtpComplete || loading) ? 'opacity-50' : ''}`}
            disabled={!isOtpComplete || loading}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnterOTP;