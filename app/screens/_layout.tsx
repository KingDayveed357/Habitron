// /app/screens/layout.tsx

import { Stack } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';

export default function ScreensLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
          },
          headerTitleStyle: {
            color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
            fontWeight: 'bold',
          },
          headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',  // Back button and icons
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="ai-chat" 
          options={{ 
            headerShown: false 
          }} 
        />
         <Stack.Screen 
          name="mood_history" 
          options={{ 
            headerShown: false 
          }} 
        />
</Stack>

      
    </>
  );
}
