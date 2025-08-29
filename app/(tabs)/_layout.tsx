// (tabs)/_layout.tsx
import React from 'react';
import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Tabs, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '@/constants/images'; 
import { ProtectedRoute } from '../components/ProtectedRoute';

const TabIcon = ({ name, focused }: { name: any; focused: boolean }) => {
  return (
    <Ionicons
      name={name}
      size={focused ? 26 : 22}
      color={focused ? '#4F46E5' : '#9CA3AF'}
    />
  );
};

const CustomHeader = ({ route }: { route: { name: string } }) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isHome = route.name === 'Home';

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 12,
        backgroundColor: isDark ? '#000' : 'transparent',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? '#111827;' : '#e5e7eb',
      }}
    >
      {isHome ? (
        <Image
          source={images.habitronLogo}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 22, fontWeight: '700' }}>
          {route.name}
        </Text>
      )}

      <Link href="/screens/account" asChild>
        <TouchableOpacity >
          <Ionicons name="person-circle-outline" size={32} color="#6B7280" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const TabLayout = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
     <ProtectedRoute>
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        header: ({ route }) => <CustomHeader route={route} />,
        tabBarStyle: {
          left: 16,
          right: 16,
          overflow: 'hidden',
          borderWidth: 0,
          elevation: 0,
          backgroundColor: isDark? "black" : "white",
          borderTopWidth: 0,          
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai_coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses-outline" focused={focused} />,
           headerShown: false 
        }}
        
      />
      <Tabs.Screen
        name="mood_stat"
        options={{
          title: 'Mood',
          tabBarIcon: ({ focused }) => <TabIcon name="happy-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => <TabIcon name="people-outline" focused={focused} />,
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
};

export default TabLayout;
