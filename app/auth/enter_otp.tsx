import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../components/ui/BackButton';
import { MessageSquareX } from 'lucide-react-native';


const Otp = () => {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (otp.length === 4) {
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        router.push('/auth/create_new_password');
      }, 1500); // simulate verification delay
    }
  }, [otp]);

  const handleKeyPress = (key: string) => {
    if (otp.length < 4) {
      setOtp(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
  };

  const renderOtpBoxes = () => {
    return [0, 1, 2, 3].map((_, i) => (
      <View
        key={i}
        className={`w-16 h-14 rounded-lg border-2 flex items-center justify-center ${
          otp.length === i
            ? 'border-indigo-500 bg-gray-100 dark:bg-gray-800'
            : ' border-gray-200 dark:border-gray-800  bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Text className="text-subheading font-semibold">{otp[i] || ''}</Text>
      </View>
    ));
  };

  const renderKey = (label: any, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      className="w-20 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-md flex items-center justify-center"
    >
      <Text className="text-xl font-bold text-black dark:text-white">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 app-background px-6 pt-12">
      <BackButton onPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        className="flex-1"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl text-heading mb-2">Enter OTP Code 🔐</Text>
          <Text className="text-subheading leading-6">
            Check your email inbox for a password reset code.
            Enter the code below to continue.
          </Text>
        </View>

        {/* OTP Boxes */}
        <View className="flex-row justify-evenly mb-6">{renderOtpBoxes()}</View>

        {/* Resend Code Timer */}
        <View className="items-center mb-6">
          <Text className="text-sm text-gray-500">
            You can resend the code in {timer} seconds
          </Text>
        </View>

        {/* Verifying Feedback */}
        {verifying && (
          <View className="items-center mb-6">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="mt-2 text-indigo-500 font-medium">Verifying...</Text>
          </View>
        )}

        {/* Custom Keypad */}
        <View className='absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2'>
    <View className="flex-row flex-wrap justify-center gap-4 mt-4">
          {[...'123456789'].map((digit) => renderKey(digit, () => handleKeyPress(digit)))}
          {renderKey('*', () => {})}
          {renderKey('0', () => handleKeyPress('0'))}
          {renderKey(<MessageSquareX color="#6366f1" />, handleBackspace)}
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Otp;
