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
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { CheckIcon } from 'lucide-react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { icons } from '@/constants/icons';
import { AuthService } from '@/services/auth';
import DevResetButton from '../components/DevResetButton';
import BackButton from '../components/ui/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onLoginSuccess?: (userEmail: string) => void;
  onForgotPassword?: (userEmail: string) => void;
}

export default function SignIn({ onLoginSuccess, onForgotPassword }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Google Auth Setup
  const { request: googleRequest, response: googleResponse, promptAsync: promptGoogleAsync } = AuthService.useGoogleAuth();

  // Facebook Auth Setup
  const { request: facebookRequest, response: facebookResponse, promptAsync: promptFacebookAsync } = AuthService.useFacebookAuth();

  // Handle Google Auth Response
  useEffect(() => {
    if (googleResponse) {
      handleGoogleAuthResponse();
    }
  }, [googleResponse]);

  // Handle Facebook Auth Response
  useEffect(() => {
    if (facebookResponse) {
      handleFacebookAuthResponse();
    }
  }, [facebookResponse]);

  const handleGoogleAuthResponse = async () => {
    setSocialLoading('google');
    try {
      const result = await AuthService.handleGoogleAuthResponse(googleResponse);
      
      if (result.error) {
        Alert.alert('Google Sign In Failed', result.error);
      } else if (result.user) {
        onLoginSuccess?.(result.user.email);
        router.push('/(tabs)/Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookAuthResponse = async () => {
    setSocialLoading('facebook');
    try {
      const result = await AuthService.handleFacebookAuthResponse(facebookResponse);
      
      if (result.error) {
        Alert.alert('Facebook Sign In Failed', result.error);
      } else if (result.user) {
        onLoginSuccess?.(result.user.email);
        router.push('/(tabs)/Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Facebook sign in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const { user, error } = await AuthService.signInWithEmail(email, password);
      
      if (error) {
        Alert.alert('Sign In Failed', error);
      } else if (user) {
        onLoginSuccess?.(user.email);
        router.push('/(tabs)/Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    
    try {
      switch (provider) {
        case 'google':
          if (googleRequest) {
            await promptGoogleAsync();
          } else {
            Alert.alert('Error', 'Google sign in is not available');
            setSocialLoading(null);
          }
          break;
          
        case 'apple':
          const appleResult = await AuthService.signInWithApple();
          if (appleResult.error) {
            Alert.alert('Apple Sign In Failed', appleResult.error);
          } else if (appleResult.user) {
            onLoginSuccess?.(appleResult.user.email);
            router.push('/(tabs)/Home');
          }
          setSocialLoading(null);
          break;
          
        case 'facebook':
          if (facebookRequest) {
            await promptFacebookAsync();
          } else {
            Alert.alert('Error', 'Facebook sign in is not available');
            setSocialLoading(null);
          }
          break;
          
        case 'twitter':
          const twitterResult = await AuthService.signInWithTwitter();
          if (twitterResult.error) {
            Alert.alert('Twitter Sign In Failed', twitterResult.error);
          }
          setSocialLoading(null);
          break;
          
        default:
          setSocialLoading(null);
          return;
      }
    } catch (error) {
      Alert.alert('Error', `${provider} sign in failed. Please try again.`);
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      // Use the new OTP-based password reset
      const result = await AuthService.sendPasswordResetOTP(email);
      
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert(
          'Password Reset',
          'We sent you a 4-digit OTP code. Please check your email.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                onForgotPassword?.(email);
                router.push('/auth/forgotpassword');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} className="flex-1 app-background relative">
      <DevResetButton />
      {/* <BackButton onPress={() => router.back()} /> */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={80}
        className="flex-1 "
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className=" left-4 z-10 p-2 rounded-full"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>

        <ScrollView 
          className="flex-grow px-6 pt-4 pb-24"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text className="text-heading text-3xl mb-2">Welcome Back 👋</Text>
          <Text className="font-light text-subheading mb-6">
            Sign in to access your personalized habit tracking experience.
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
              autoComplete="email"
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
              autoComplete="password"
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

          {/* Remember me and Forgot Password */}
          <View className='flex-row justify-between items-center mb-4'>
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
              <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${rememberMe ? 'bg-primary' : 'border-gray-400'}`}>
                {rememberMe && <CheckIcon size={14} color="#fff" />}
              </View>
              <Text className="text-body text-gray-600 dark:text-gray-300">
                Remember me
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/auth/forgotpassword')} className='my-auto'>
              <Text className='text-body text-primary'>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign-up Link */}
          <View className="flex-row justify-center mt-5 mb-4">
            <Text className="text-gray-600 dark:text-gray-400 text-body">Don't have an account? </Text>
            <Link href="/auth/signup" className="text-primary">Sign up</Link>
          </View>

          {/* Or separator with lines */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Social Buttons */}
          <View className="mb-4">
            <TouchableOpacity 
              className="btn-auth"
              onPress={() => handleSocialSignIn('google')}
              disabled={socialLoading === 'google'}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Image source={icons.google} className="w-12 h-12 p-2" />
              )}
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="btn-auth"
              onPress={() => handleSocialSignIn('apple')}
              disabled={socialLoading === 'apple'}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Fontisto name="apple" size={28} color="black" className="p-2" />
              )}
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="btn-auth"
              onPress={() => handleSocialSignIn('facebook')}
              disabled={socialLoading === 'facebook'}
            >
              {socialLoading === 'facebook' ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <FontAwesome6 name="facebook" size={28} color="#0f89e3" className="p-2" />
              )}
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Facebook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="btn-auth"
              onPress={() => handleSocialSignIn('twitter')}
              disabled={socialLoading === 'twitter'}
            >
              {socialLoading === 'twitter' ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Fontisto name="twitter" size={24} color="#0f89e3" className="p-2" />
              )}
              <Text className="text-lg text-center font-semibold px-4 py-2 text-black dark:text-white">
                Continue with Twitter
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Sign In Button */}
        <View className="absolute bottom-0 left-0 right-0 py-20 app-background pb-6 border-t dark:border-t-slate-700 border-t-gray-200 pt-2">
          <TouchableOpacity
            onPress={handleSignIn}
            className={`btn-primary py-5 mx-5 ${!email || !password || loading ? 'opacity-50' : ''}`}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">Sign in</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)' }}>
          <View className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="mt-4 text-center text-gray-700 dark:text-gray-200">Signing in...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

})