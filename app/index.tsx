import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);
  const [showDevOptions, setShowDevOptions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');

        if (onboarded !== 'true') {
          setRoute('/onboarding');
        } else if (loggedIn !== 'true') {
          setRoute('/auth/signin');
        } else {
          setRoute('/(tabs)');
        }
      } catch (error) {
        console.error('Error loading onboarding/login state:', error);
        setRoute('/onboarding'); 
      }
    })();
  }, []);

  const resetAndGoToOnboarding = async () => {
    await AsyncStorage.multiRemove(['hasOnboarded', 'isLoggedIn', 'onboardingData']);
    setRoute('/onboarding');
  };

  const resetAndGoToSignIn = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    await AsyncStorage.removeItem('isLoggedIn');
    setRoute('/auth/signin');
  };

  const goToTabs = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setRoute('/(tabs)');
  };

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
        
        {/* Development Options - Only show in dev mode */}
        {__DEV__ && (
          <View className="mt-8">
            <TouchableOpacity
              onPress={() => setShowDevOptions(!showDevOptions)}
              className="bg-gray-200 px-4 py-2 rounded mb-4"
            >
              <Text className="text-gray-700 font-semibold">
                {showDevOptions ? 'Hide' : 'Show'} Dev Options
              </Text>
            </TouchableOpacity>

            {showDevOptions && (
              <View className="space-y-2">
                <TouchableOpacity
                  onPress={resetAndGoToOnboarding}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  <Text className="text-white text-center font-semibold">
                    Test Onboarding
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={resetAndGoToSignIn}
                  className="bg-green-500 px-4 py-2 rounded"
                >
                  <Text className="text-white text-center font-semibold">
                    Test Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goToTabs}
                  className="bg-purple-500 px-4 py-2 rounded"
                >
                  <Text className="text-white text-center font-semibold">
                    Go to Main App
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return <Redirect href={route} />;
}