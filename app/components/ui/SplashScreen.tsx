// /components/ui/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { images } from '@/constants/images';

export const SplashScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 35,
        friction: 6,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle pulse for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered loading dots
    const dotAnimations = dotAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(dotAnimations).start();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black items-center justify-center">
      {/* Main content */}
      <Animated.View
        className="items-center"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo */}
        <Animated.View
          className="mb-8"
          style={{
            transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
          }}
        >
          <View className="w-32 h-32 items-center justify-center">
            <Image
              source={images.habitronLogo}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App name */}
        <Text className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
          Habitron
        </Text>

        {/* Tagline */}
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-base font-medium text-gray-600 dark:text-gray-400">
            AI-Powered Habit Tracking
          </Text>
        </View>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View
        className="absolute bottom-24 items-center"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row gap-2 mb-3">
          {dotAnims.map((anim, index) => (
            <Animated.View
              key={index}
              className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500"
              style={{
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 1.1],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-500">
          Loading...
        </Text>
      </Animated.View>
    </View>
  );
};