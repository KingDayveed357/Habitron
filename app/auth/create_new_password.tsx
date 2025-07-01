import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackButton from '../components/ui/BackButton';

const CreateNewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureText2, setSecureText2] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const router = useRouter();

  const isDisabled = !newPassword || !confirmPassword;

  const handleSubmit = () => {
    if (isDisabled) return;

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      router.push('/auth/reset_success');
    }, 1500); // simulate verifying
  };

  return (
    <SafeAreaView className="flex-1 app-background relative">
      <BackButton onPress={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 pt-24 px-6"
      >
        <ScrollView>
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl text-heading mb-2">Secure Your Account 🔒</Text>
            <Text className="text-subheading leading-6">
              Create a new password for your Habitron account. Make sure it's secure and easy to remember.
            </Text>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-label mb-2">New Password</Text>
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-black dark:text-white"
                secureTextEntry={secureText}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)} className="ml-2">
                <Text className="text-2xl">{secureText ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-8">
            <Text className="text-label mb-2">Confirm New Password</Text>
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-black dark:text-white"
                secureTextEntry={secureText2}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => setSecureText2(!secureText2)} className="ml-2">
                <Text className="text-2xl">{secureText2 ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verifying Loader */}
          {verifying && (
            <View className="items-center mb-6">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="mt-2 text-indigo-500 font-medium">Verifying...</Text>
            </View>
          )}
        </ScrollView>

        {/* Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isDisabled}
            className={`btn-primary py-5 mx-5 ${isDisabled ? 'opacity-50' : ''}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              Save New Password
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateNewPassword;
