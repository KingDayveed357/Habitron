// app/(tabs)/account.tsx 
import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Lock,
  Trash2,
  Download,
  Share,
  Star,
  MessageCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Moon,
  Mail,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

// ============================================================================
// PASSWORD INPUT COMPONENT
// ============================================================================
const PasswordInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleShow: () => void;
  isDark: boolean;
}> = React.memo(({ value, onChangeText, placeholder, showPassword, onToggleShow, isDark }) => (
  <View className="flex-row items-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg">
    <TextInput
      value={value}
      onChangeText={onChangeText}
      className="flex-1 p-3 text-gray-800 dark:text-white"
      placeholder={placeholder}
      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
      secureTextEntry={!showPassword}
      autoCapitalize="none"
    />
    <TouchableOpacity onPress={onToggleShow} className="p-3">
      {showPassword ? (
        <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      ) : (
        <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      )}
    </TouchableOpacity>
  </View>
));

// ============================================================================
// MAIN ACCOUNT SCREEN COMPONENT
// ============================================================================
const AccountScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut, changePassword, loading } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: false,
    weeklyReports: false,
    dataPrivacy: true, // New: Privacy setting for community features
  });

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Edit profile states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================================================
  // LOAD USER SETTINGS
  // ============================================================================
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setSettings({
          notifications: data.notifications_enabled ?? false,
          weeklyReports: data.weekly_reports ?? false,
          dataPrivacy: data.data_privacy ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // ============================================================================
  // SAVE SETTINGS TO DATABASE
  // ============================================================================
const saveSettings = async (newSettings: typeof settings) => {
  if (!user) return;

  try {
    // First, try to fetch existing settings
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingSettings) {
      // Update existing record
      const { error } = await supabase
        .from('user_settings')
        .update({
          notifications_enabled: newSettings.notifications,
          weekly_reports: newSettings.weeklyReports,
          data_privacy: newSettings.dataPrivacy,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          notifications_enabled: newSettings.notifications,
          weekly_reports: newSettings.weeklyReports,
          data_privacy: newSettings.dataPrivacy,
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    Alert.alert('Error', 'Failed to save settings');
  }
};

  // ============================================================================
  // TOGGLE CALLBACKS
  // ============================================================================
  const toggleCurrentPassword = useCallback(() => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPassword = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // ============================================================================
  // HANDLE LOGOUT
  // ============================================================================
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const result = await signOut();
              
              if (result.success) {
                setTimeout(() => {
                  router.replace('/auth/signin');
                }, 150);
              } else {
                Alert.alert('Error', result.error || 'Failed to logout');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred during logout');
            }
          }
        },
      ]
    );
  };

  // ============================================================================
  // HANDLE DELETE ACCOUNT
  // ============================================================================
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (!user) return;

              setIsUpdating(true);

              // Call edge function to delete user account
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) throw new Error('No session');

              const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-user-account`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              const result = await response.json();

              if (result.success) {
                Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                  {
                    text: 'OK',
                    onPress: () => {
                      signOut();
                      router.replace('/auth/signin');
                    }
                  }
                ]);
              } else {
                throw new Error(result.error || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsUpdating(false);
            }
          }
        },
      ]
    );
  };

  // ============================================================================
  // HANDLE SAVE PROFILE - FIX FOR NAME UPDATE
  // ============================================================================
  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (!editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: editEmail.trim(),
        data: { name: editName.trim() }
      });

      if (authError) throw authError;

      // CRITICAL FIX: Update users table directly
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: editName.trim(),
          email: editEmail.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
      
      // Refresh user data
      window.location.reload(); // Force refresh to get updated user data
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================================================
  // HANDLE CHANGE PASSWORD
  // ============================================================================
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Password changed successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================================================
  // HANDLE EXPORT DATA
  // ============================================================================
  const handleExportData = async () => {
    try {
      if (!user) return;

      setIsUpdating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/export-user-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Your data export will be emailed to you shortly.');
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================================================
  // THEME HELPERS
  // ============================================================================
  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return '🌙';
    if (theme === 'light') return '☀️';
    return '🔄';
  };

  // ============================================================================
  // MENU BUTTON COMPONENT
  // ============================================================================
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

  // ============================================================================
  // LOADING STATES
  // ============================================================================
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 dark:text-gray-400 mt-2">Redirecting...</Text>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pb-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Profile Settings</Text>
          <Text className="text-gray-600 dark:text-gray-400">Manage your profile and preferences</Text>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="relative">
                <Image
                  source={{ 
                    uri: user.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                  }}
                  className="w-20 h-20 rounded-full"
                />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">{user.name || 'User'}</Text>
                <Text className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Member since {new Date(user.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
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

        {/* Quick Settings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick Settings</Text>
          
          <MenuButton
            icon={<Bell size={20} color={settings.notifications ? "#3B82F6" : "#9CA3AF"} />}
            title="Notifications"
            subtitle="Habit reminders (Coming soon)"
            onPress={() => {}}
            showArrow={false}
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={(value) => {
                  const newSettings = { ...settings, notifications: value };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
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
        </View>

        {/* Account Settings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Account Settings</Text>
          
          <MenuButton
            icon={<Lock size={20} color="#3B82F6" />}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => setShowChangePassword(true)}
          />

          <MenuButton
            icon={<Shield size={20} color="#3B82F6" />}
            title="Privacy & Security"
            subtitle="Manage your data visibility"
            onPress={() => setShowPrivacyModal(true)}
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
                onValueChange={(value) => {
                  const newSettings = { ...settings, weeklyReports: value };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.weeklyReports ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <MenuButton
            icon={<Download size={20} color="#3B82F6" />}
            title="Export Data"
            subtitle="Download your habit data"
            onPress={handleExportData}
          />
        </View>

        {/* Support Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Support</Text>
          
          <MenuButton
            icon={<HelpCircle size={20} color="#3B82F6" />}
            title="Help Center"
            subtitle="Get help and tutorials"
            onPress={() => Alert.alert('Help Center', 'Help documentation coming soon!')}
          />

          <MenuButton
            icon={<MessageCircle size={20} color="#3B82F6" />}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => Alert.alert('Contact Support', 'support@habitron.app')}
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
            <TouchableOpacity 
              onPress={() => setShowEditProfile(false)}
              disabled={isUpdating}
            >
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">Edit Profile</Text>
            <TouchableOpacity 
              onPress={handleSaveProfile}
              disabled={isUpdating}
              className="flex-row items-center"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-blue-500 dark:text-blue-400 font-semibold">Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
              <Image
                source={{ 
                  uri: user.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                }}
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
                editable={!isUpdating}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-white"
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isUpdating}
              />
            </View>

            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                <Text className="font-semibold">Note:</Text> Changing your email may require verification and could log you out of other devices.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity 
              onPress={() => {
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={isUpdating}
            >
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</Text>
            <TouchableOpacity 
              onPress={handleChangePassword}
              disabled={isUpdating}
              className="flex-row items-center"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-blue-500 dark:text-blue-400 font-semibold">Update</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-6">
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Current Password</Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                showPassword={showCurrentPassword}
                onToggleShow={toggleCurrentPassword}
                isDark={isDark}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">New Password</Text>
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                showPassword={showNewPassword}
                onToggleShow={toggleNewPassword}
                isDark={isDark}
              />
              {newPassword && (
                <View className="mt-2">
                  <View className="flex-row items-center">
                    {newPassword.length >= 6 ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <X size={16} color="#EF4444" />
                    )}
                    <Text className={`ml-2 text-sm ${
                      newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      At least 6 characters
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Confirm New Password</Text>
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                showPassword={showConfirmPassword}
                onToggleShow={toggleConfirmPassword}
                isDark={isDark}
              />
              {confirmPassword && (
                <View className="mt-2">
                  <View className="flex-row items-center">
                    {newPassword === confirmPassword && confirmPassword ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <X size={16} color="#EF4444" />
                    )}
                    <Text className={`ml-2 text-sm ${
                      newPassword === confirmPassword && confirmPassword 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Passwords match
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <Text className="text-blue-800 dark:text-blue-200 text-sm">
                <Text className="font-semibold">Security tip:</Text> Use a strong password with a mix of letters, numbers, and symbols. Avoid using personal information.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">Close</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">Privacy & Security</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView className="flex-1 p-6">
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 dark:text-white mb-2">Community Visibility</Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-4">
                Control how your data appears in the community feed and challenges.
              </Text>
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 pr-4">
                  <Text className="font-semibold text-gray-800 dark:text-white mb-1">
                    Keep Activity Private
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    When enabled, your habit completions and achievements won't appear in the community feed
                  </Text>
                </View>
                <Switch
                  value={settings.dataPrivacy}
                  onValueChange={(value) => {
                    const newSettings = { ...settings, dataPrivacy: value };
                    setSettings(newSettings);
                    saveSettings(newSettings);
                  }}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={settings.dataPrivacy ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <Text className="text-blue-800 dark:text-blue-200 text-sm">
                <Text className="font-semibold">Note:</Text> When privacy mode is on:
                {'\n'}• Your activities won't appear in the community feed
                {'\n'}• You can still join challenges, but your progress will be private
                {'\n'}• Your profile will still be visible if you interact with others
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 dark:text-white mb-2">What Gets Shared</Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-3">
                When privacy mode is off, the following may be visible to other users:
              </Text>
              
              <View className="space-y-2">
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-800 dark:text-white mr-2">•</Text>
                  <Text className="text-gray-600 dark:text-gray-400 flex-1">
                    Habit completion milestones (10, 25, 50, 100+ completions)
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-800 dark:text-white mr-2">•</Text>
                  <Text className="text-gray-600 dark:text-gray-400 flex-1">
                    Streak achievements (7, 14, 30+ day streaks)
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-800 dark:text-white mr-2">•</Text>
                  <Text className="text-gray-600 dark:text-gray-400 flex-1">
                    Challenge participation and progress
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-gray-800 dark:text-white mr-2">•</Text>
                  <Text className="text-gray-600 dark:text-gray-400 flex-1">
                    Profile information (name, avatar, join date)
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                <Text className="font-semibold">Privacy Reminder:</Text> Your specific habit details (names, descriptions, daily progress) are never shared publicly, regardless of this setting.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;