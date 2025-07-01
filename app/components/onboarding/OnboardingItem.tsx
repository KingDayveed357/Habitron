import { OnboardingItemProps } from '@/interfaces/interfaces';
import React from 'react';
import { Text, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView
      className="w-full flex-1 items-center justify-center px-6 "
      style={{ width }}
    >
      <Image source={item.image} style={{ width: 300, height: 300 }} resizeMode="contain" />
      <Text className="text-3xl leading-relaxed font-bold text-center mt-5 text-heading">
        {item.title}
      </Text>
      <Text className="text-lg text-center mt-2 text-caption">
        {item.description}
      </Text>
    </SafeAreaView>
  );
};

export default OnboardingItem;
