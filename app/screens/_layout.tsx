// /app/screens/layout.tsx

import { Stack } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';
import BackButton from '../components/ui/BackButton';


export default function ScreensLayout() {
   const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


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
 
       {/* <Stack.Screen 
          name="account" 
          options={{ 
            headerShown: false 
          }} 
        /> */}
          <Stack.Screen
          name="account"
       options={{
        title: "Account",
        headerStyle: {
          backgroundColor: isDark ? "#000000" : "#f8f8f8",
          shadowColor: "transparent" ,
          elevation: 0,
          borderBottomWidth: 0,
        } as any,
        headerTintColor: isDark ? "#fff" : "#333",
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontWeight: "bold",
          color: isDark ? "#fff" : "#000",
        },
        headerBackTitle: "Back",
        headerShadowVisible: false,
      }}
      />

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
