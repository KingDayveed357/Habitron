// app/components/modal/CreateHabit.tsx
import { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HabitForm } from './HabitForm';
import { CreateHabitRequest } from '@/types/habit';
import { useHabits } from '@/hooks/usehabits';
import { useAuth } from '@/hooks/useAuth';

const CreateHabitScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { createHabit } = useHabits();
  const [loading, setLoading] = useState(false);

  const handleSave = async (habitData: CreateHabitRequest) => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create habits');
      return;
    }

    setLoading(true);
    try {
      await createHabit(habitData);

      Alert.alert(
        'Success!',
        'Your new habit has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Sign In Required
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You need to be signed in to create habits.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            className="bg-indigo-500 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <HabitForm
        mode="create"
        onSubmit={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />
    </SafeAreaView>
  );
};

export default CreateHabitScreen;