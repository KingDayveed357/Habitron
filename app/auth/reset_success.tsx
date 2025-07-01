import { images } from '@/constants/images';
import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity } from 'react-native';

interface ResetSuccessProps {
  onGoHome: () => void;
}

const ResetSuccess: React.FC<ResetSuccessProps> = ({ onGoHome }) => {
  return (
    <SafeAreaView className="flex-1 app-background pt-12 items-center px-6">
      {/* Icon/Image */}
      <View className="">
        <Image
          source={images.resetPasswordSuccess}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
          
        />
      </View>

      {/* Text */}
      <Text className="text-3xl font-semibold text-heading mb-2">You're All Set!</Text>
      <Text className="text-subheading text-center mb-8">
        Your password has been successfully updated.
      </Text>

      {/* Button */}
      <View className='absolute bottom-0 left-0 right-0 py-8 app-background pb-6  border-t dark:border-t-slate-700 border-t-gray-200 pt-2'>
        <TouchableOpacity onPress={onGoHome} className="btn-primary py-5 mx-5">
        <Text className="text-white text-center font-semibold text-base">Go to Homepage</Text>
      </TouchableOpacity>
      </View>
     
    </SafeAreaView>
  );
};

export default ResetSuccess;
