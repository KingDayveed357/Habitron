import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import NavigationButton from '../components/ui/NavButton';
import EnhancedThemeToggle from '../components/ThemeToggle';

const GetStarted = () => {
  return (
    <>
    <SafeAreaView className="flex-1 app-background">
    {/* <EnhancedThemeToggle /> */}
      <Image source={images.habitronLogo} className="w-[65px] h-[65px] mx-auto mt-10" />
      <Text className="text-4xl text-center mt-10 text-heading">
        Let's Get Started!
      </Text>
      <Text className="text-center mt-4 text-subheading">
        Let's dive into your account
      </Text>

      <View className="flex flex-col mx-5 mt-7">
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

      <View className="mt-5">
        <NavigationButton path="/auth/signup" text="Sign up" color='btn-primary' textColor='text-btn-primary-text' />
        <NavigationButton path="/auth/signin" text="Sign in" color="btn-outline" textColor='dark:text-white text-black'/>
      </View>

      <View className="flex flex-row mx-5 justify-end items-end mt-4">
        <Text className="text-sm text-muted dark:text-gray-400 flex-1">Privacy Policy</Text>
        <Text className="text-sm text-muted dark:text-gray-400">Terms of Service</Text>
      </View>
    </SafeAreaView>
    </>
  );
};

export default GetStarted;
