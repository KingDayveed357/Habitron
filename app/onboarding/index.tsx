import { slides } from '@/constants/slide';
// import { useAppTheme } from '@/context/ThemeContext2';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import OnboardingItem from '../components/onboarding/OnboardingItem';
import Paginator from '../components/onboarding/Paginator';
import ThemeToggle from '../components/ThemeToggle';

const OnboardingScreen = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollViewConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleSkipOrNext = () => {
    router.push('/auth/getstarted');
  };

  return (
    <View className='app-background'>
      <ThemeToggle />
      <FlatList
        data={slides}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={scrollViewConfig}
      />

      <Paginator data={slides} scrollX={scrollX} />

      <TouchableOpacity
        className="mx-5 mb-10 rounded-xl py-4 btn-primary"
        onPress={handleSkipOrNext}
      >
        <Text className="text-btn-primary-text text-center font-semibold">
          {currentIndex === slides.length - 1 ? "Let's Get Started" : 'Skip'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;