import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Crown,
  BarChart3,
  Target,
  Zap,
  Moon,
  Volume2,
  Smartphone,
  Mail,
  Lock,
  Trash2,
  Download,
  Share,
  Star,
  MessageCircle,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface UserStats {
  streakDays: number;
  habitsCompleted: number;
  totalHabits: number;
  weeklyGoal: number;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  joinDate: string;
}

const AccountScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  const [user, setUser] = useState<UserProfile>({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isPremium: true,
    joinDate: 'January 2024',
  });

  const [stats, setStats] = useState<UserStats>({
    streakDays: 47,
    habitsCompleted: 234,
    totalHabits: 8,
    weeklyGoal: 85,
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    soundEnabled: true,
    weeklyReports: true,
  });

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return '🌙';
    if (theme === 'light') return '☀️';
    return '🔄'; // system
  };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') },
      ]
    );
  };

  const handleSaveProfile = () => {
    setUser({ ...user, name: editName, email: editEmail });
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; color: string }> = ({
    icon,
    value,
    label,
    color,
  }) => (
    <View className={`flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 mx-1 ${color}`}>
      <View className="flex-row items-center justify-between mb-2">
        {icon}
        <Text className="text-2xl font-bold text-gray-800 dark:text-white">{value}</Text>
      </View>
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
    </View>
  );

  const MenuButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }> = ({ icon, title, subtitle, onPress, showArrow = true, rightElement, danger = false }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl mb-2 shadow-sm"
    >
      <View className={`p-2 rounded-lg mr-3 ${
        danger 
          ? 'bg-red-100 dark:bg-red-900/30' 
          : 'bg-blue-100 dark:bg-blue-900/30'
      }`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`font-semibold ${
          danger 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-800 dark:text-white'
        }`}>
          {title}
        </Text>
        {subtitle && <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && (
        <Text className="text-gray-400 dark:text-gray-500 text-lg">›</Text>
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pb-6">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Account</Text>
          <Text className="text-gray-600 dark:text-gray-400">Manage your profile and preferences</Text>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-6">
          <View className="card">
            <View className="flex-row items-center mb-4">
              <View className="relative">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-20 h-20 rounded-full"
                />
                {user.isPremium && (
                  <View className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Crown size={16} color="white" />
                  </View>
                )}
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</Text>
                  {user.isPremium && (
                    <View className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">PRO</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-500 mt-1">Member since {user.joinDate}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditProfile(true)}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
              >
                <Edit3 size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Your Progress</Text>
          <View className="flex-row">
            <StatCard
              icon={<Zap size={20} color="#F59E0B" />}
              value={stats.streakDays.toString()}
              label="Day Streak"
              color="border-l-4 border-yellow-500"
            />
            <StatCard
              icon={<Target size={20} color="#10B981" />}
              value={`${stats.weeklyGoal}%`}
              label="Weekly Goal"
              color="border-l-4 border-green-500"
            />
          </View>
          <View className="flex-row mt-2">
            <StatCard
              icon={<BarChart3 size={20} color="#8B5CF6" />}
              value={stats.habitsCompleted.toString()}
              label="Completed"
              color="border-l-4 border-purple-500"
            />
            <StatCard
              icon={<User size={20} color="#EF4444" />}
              value={stats.totalHabits.toString()}
              label="Active Habits"
              color="border-l-4 border-red-500"
            />
          </View>
        </View>

        {/* Quick Settings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick Settings</Text>
          
          <MenuButton
            icon={<Bell size={20} color={settings.notifications ? "#3B82F6" : "#9CA3AF"} />}
            title="Notifications"
            subtitle="Get reminders for your habits"
            onPress={() => {}}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <MenuButton
            icon={<Moon size={20} color={isDark ? "#3B82F6" : "#9CA3AF"} />}
            title="Theme"
            subtitle={`Current: ${getThemeLabel()}`}
            onPress={toggleTheme}
            showArrow={false}
            rightElement={
              <TouchableOpacity 
                onPress={toggleTheme}
                className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full"
              >
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {getThemeIcon()} {getThemeLabel()}
                </Text>
              </TouchableOpacity>
            }
          />

          <MenuButton
            icon={<Volume2 size={20} color={settings.soundEnabled ? "#3B82F6" : "#9CA3AF"} />}
            title="Sound Effects"
            subtitle="Enable completion sounds"
            onPress={() => {}}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => setSettings({ ...settings, soundEnabled: value })}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Main Menu */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Settings</Text>
          
          <MenuButton
            icon={<Settings size={20} color="#3B82F6" />}
            title="App Preferences"
            subtitle="Customize your experience"
            onPress={() => router.push('/')}
          />

          <MenuButton
            icon={<Shield size={20} color="#3B82F6" />}
            title="Privacy & Security"
            subtitle="Manage your data and privacy"
            onPress={() => router.push('/')}
          />

          <MenuButton
            icon={<Mail size={20} color="#3B82F6" />}
            title="Weekly Reports"
            subtitle="Get insights via email"
            onPress={() => {}}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.weeklyReports}
                onValueChange={(value) => setSettings({ ...settings, weeklyReports: value })}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.weeklyReports ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <MenuButton
            icon={<Download size={20} color="#3B82F6" />}
            title="Export Data"
            subtitle="Download your habit data"
            onPress={() => Alert.alert('Export', 'Your data export will be emailed to you.')}
          />
        </View>

        {/* Support Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Support</Text>
          
          <MenuButton
            icon={<HelpCircle size={20} color="#3B82F6" />}
            title="Help Center"
            subtitle="Get help and tutorials"
            onPress={() => router.push('/')}
          />

          <MenuButton
            icon={<MessageCircle size={20} color="#3B82F6" />}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => router.push('/')}
          />

          <MenuButton
            icon={<Star size={20} color="#3B82F6" />}
            title="Rate Habitron"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Rate App', 'Thank you for your feedback!')}
          />

          <MenuButton
            icon={<Share size={20} color="#3B82F6" />}
            title="Share with Friends"
            subtitle="Invite others to join"
            onPress={() => Alert.alert('Share', 'Sharing options will appear here.')}
          />
        </View>

        {/* Danger Zone */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Account Actions</Text>
          
          <MenuButton
            icon={<LogOut size={20} color="#EF4444" />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger
          />

          <MenuButton
            icon={<Trash2 size={20} color="#EF4444" />}
            title="Delete Account"
            subtitle="Permanently remove your account"
            onPress={handleDeleteAccount}
            danger
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
          
          <View className="p-6">
            <View className="items-center mb-6">
              <Image
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full mb-3"
              />
              <TouchableOpacity className="flex-row items-center">
                <Camera size={16} color="#3B82F6" />
                <Text className="text-blue-500 dark:text-blue-400 ml-1 font-semibold">Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-white"
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-white"
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;