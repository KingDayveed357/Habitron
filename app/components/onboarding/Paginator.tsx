import React from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Paginator = ({ data, scrollX }: { data: any[]; scrollX: Animated.Value }) => {
  return (
    <View className="flex-row justify-center items-center h-16">
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 16, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i.toString()}
            style={{
              width: dotWidth,
              opacity,
            }}
            className="h-2 bg-indigo-600 rounded-full mx-1"
          />
        );
      })}
    </View>
  );
};

export default Paginator;
// This component renders a paginator for the onboarding screens, showing dots that indicate the current page.
// The dots animate their size and opacity based on the current scroll position, providing a visual cue to the user about their progress through the onboarding process.