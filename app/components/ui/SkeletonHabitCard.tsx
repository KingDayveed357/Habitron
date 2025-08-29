// components/ui/SkeletonHabitCard.tsx
import { View, Text, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'

interface SkeletonHabitCardProps {
  index?: number
  isLast?: boolean
}

const SkeletonHabitCard: React.FC<SkeletonHabitCardProps> = ({ index = 0, isLast = false }) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current
  const pulseAnimation = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Shimmer effect animation
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    )

    // Gentle pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    )

    shimmer.start()
    pulse.start()

    return () => {
      shimmer.stop()
      pulse.stop()
    }
  }, [shimmerAnimation, pulseAnimation])

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-300, 300],
        }),
      },
    ],
  }

  // Staggered animation delay for multiple cards
  const cardDelay = index * 100

  return (
    <Animated.View 
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden ${!isLast ? 'mb-4' : ''}`}
      style={{
        opacity: pulseAnimation,
      }}
    >
      {/* Shimmer Overlay */}
      <Animated.View
        className="absolute inset-0 z-10"
        style={[
          shimmerStyle,
          {
            width: '150%',
            height: '100%',
            backgroundColor: 'transparent',
          },
        ]}
      >
        <View 
          className="w-20 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/20 to-transparent"
          style={{
            transform: [{ skewX: '-20deg' }],
          }}
        />
      </Animated.View>

      <View className="p-4 pr-20 relative">
        <View className="flex-row items-center mb-3">
          {/* Skeleton Icon */}
          <View className="w-8 h-8 mr-3 relative">
            <View className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full" />
            <View className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 dark:via-gray-500/10 to-transparent rounded-full" />
          </View>
          
          <View className="flex-1">
            {/* Skeleton Habit Name */}
            <View 
              className="h-4 rounded-md mb-2 relative overflow-hidden"
              style={{ width: `${60 + (index * 8)}%` }}
            >
              <View className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
              <View className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-500/10 to-transparent" />
            </View>
            
            {/* Skeleton Category (appears on some cards for variety) */}
            {index % 2 === 0 && (
              <View 
                className="h-3 rounded mb-1 relative overflow-hidden"
                style={{ width: '35%' }}
              >
                <View className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800" />
              </View>
            )}
            
            {/* Skeleton Stats */}
            <View 
              className="h-3 rounded relative overflow-hidden"
              style={{ width: `${75 + (index * 5)}%` }}
            >
              <View className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800" />
            </View>
          </View>
        </View>
        
        {/* Skeleton Progress Bar */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 relative overflow-hidden">
          <View 
            className="rounded-full h-2 relative"
            style={{ width: `${25 + (index * 20)}%` }}
          >
            <View className="w-full h-full bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200 dark:from-indigo-800 dark:via-indigo-700 dark:to-indigo-800" />
            <View className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-indigo-400/20 to-transparent" />
          </View>
        </View>
      </View>

      {/* Skeleton Toggle Button */}
      <View className="absolute right-3 top-1/2 w-14 h-14 rounded-full transform -translate-y-7">
        <View className="w-full h-full rounded-full border-2 border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <View className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full" />
          <View className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 dark:via-gray-500/10 to-transparent rounded-full" />
        </View>
      </View>

      {/* Subtle completion indicator for variety */}
      {index === 1 && (
        <View className="absolute top-3 right-20">
          <View className="px-2 py-1 rounded-full relative overflow-hidden">
            <View className="w-12 h-5 bg-gradient-to-r from-green-100 via-green-50 to-green-100 dark:from-green-900 dark:via-green-800 dark:to-green-900 rounded-full" />
          </View>
        </View>
      )}
    </Animated.View>
  )
}

// Skeleton Container Component
const SkeletonHabitsContainer: React.FC = () => {
  const fadeIn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [fadeIn])

  return (
    <Animated.View style={{ opacity: fadeIn }}>
      {/* Skeleton Cards */}
      {[0, 1, 2].map((index) => (
        <SkeletonHabitCard
          key={`skeleton-${index}`}
          index={index}
          isLast={index === 2}
        />
      ))}
      
      {/* Premium Loading Indicator */}
      <View className="flex-row justify-center items-center mt-8 py-6">
        <View className="flex-row mr-4">
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full mx-1"
              style={{
                opacity: fadeIn,
                transform: [{
                  scale: fadeIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }}
            />
          ))}
        </View>
        <Text className="text-indigo-500 dark:text-indigo-400 text-sm font-medium tracking-wide">
          Preparing your habits...
        </Text>
      </View>
    </Animated.View>
  )
}

export { SkeletonHabitCard, SkeletonHabitsContainer }