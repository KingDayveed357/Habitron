import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { icons } from '@/constants/icons';

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000); 
    router.push("/auth/post_signup")
  };

  return (
    <SafeAreaView className="flex-1 app-background  relative">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={80}
        className="flex-1"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="top-5 left-4 z-10 p-2  rounded-full "
        >
          <FontAwesome6 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>

        <ScrollView 
          className="flex-grow px-6 pt-10 pb-24" // Added pb-24 to make space for fixed button
          contentContainerStyle={{ paddingBottom: 100 }} // Ensure enough space at bottom
        >
          <Text className="text-heading text-3xl mb-2">Join Habitron Today ✨</Text>
          <Text className="font-light text-subheading mb-6">
            Start your habit journey with Habitron. It's quick, easy, and free!
          </Text>

          {/* Email Field */}
          <Text className="text-body font-semibold mb-3">Email</Text>
          <View className="flex-row items-center bg-gray-200 dark:bg-gray-800 px-4 py-3 rounded-xl mb-4">
            <Fontisto name="email" size={20} color="gray" className="mr-2" />
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

          {/* Password Field */}
          <Text className="text-body font-semibold mb-3">Password</Text>
          <View className="flex-row items-center bg-gray-200 dark:bg-gray-800 px-4 py-3 rounded-xl mb-4">
  <FontAwesome6 name="lock" size={20} color="gray" className="mr-2" />
  <TextInput
    value={password}
    onChangeText={setPassword}
    placeholder="Enter your password"
    placeholderTextColor="#888"
    className="flex-1 text-black dark:text-white pr-10"
    secureTextEntry={secureText}
  />
  <TouchableOpacity 
    onPress={() => setSecureText(!secureText)} 
    className="ml-2"
  >
    <Text className="text-2xl">
      {secureText ? '🙈' : '👁️'}
    </Text>
  </TouchableOpacity>
</View>

          {/* Terms Checkbox */}
          <TouchableOpacity onPress={() => setAgreed(!agreed)} className="flex-row items-center mb-4">
            <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${agreed ? 'bg-primary' : 'border-gray-400'}`}>
              {agreed && <CheckIcon size={14} color="#fff" />}
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              I agree to Habitron <Text className="text-primary">Terms & Conditions</Text>.
            </Text>
          </TouchableOpacity>

          {/* Sign-in Link */}
          <View className="flex-row justify-center mt-5 mb-4">
            <Text className="text-gray-600 dark:text-gray-400 text-body">Already have an account? </Text>
            <Link href="/auth/signin" className="text-primary">Sign in</Link>
          </View>

          {/* Or separator with lines */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Social Buttons */}
          <View className="mb-4">
            <TouchableOpacity className="btn-auth">
              <Image source={icons.google} className="w-12 h-12 p-2" />
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="btn-auth">
              <Fontisto name="apple" size={28} color="black" className="p-2" />
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="btn-auth">
              <FontAwesome6 name="facebook" size={28} color="#0f89e3" className="p-2" />
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Facebook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="btn-auth">
              <Fontisto name="twitter" size={24} color="#0f89e3" className="p-2" />
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Twitter
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Sign Up Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background  pb-6 border-t dark:border-t-slate-700 border-t-gray-200  pt-2">
          <TouchableOpacity
            onPress={handleSignUp}
            className="btn-primary py-5 mx-5"
            disabled={!email || !password || !agreed || loading}
          >
            <Text className="text-white text-center font-semibold text-base">Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center">
          <View className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="mt-4 text-center text-gray-700 dark:text-gray-200">Signing up...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}