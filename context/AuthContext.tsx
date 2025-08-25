// /context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, AuthUser } from '@/services/auth';
import { Alert } from 'react-native';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetOTP: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyPasswordResetOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOTP: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUserSession();
    
    // Listen to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSession = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthService.signInWithEmail(email, password);
      if (response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const response = await AuthService.signUpWithEmail(email, password, username);
      if (response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Sign up failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // This would be implemented in your component using the useGoogleAuth hook
      // For now, return a placeholder
      return { success: false, error: 'Google sign in not implemented in context' };
    } catch (error) {
      return { success: false, error: 'Google sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    try {
      const response = await AuthService.signInWithApple();
      if (response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Apple sign in failed' };
      }
    } catch (error) {
      return { success: false, error: 'Apple sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      // This would be implemented in your component using the useFacebookAuth hook
      return { success: false, error: 'Facebook sign in not implemented in context' };
    } catch (error) {
      return { success: false, error: 'Facebook sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      // Import supabase to update user profile
      const { supabase } = require('@/services/supabase');
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: email,
        data: { name: name }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Update user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: name,
          email: email,
        })
        .eq('id', user.id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      // Update local user state
      setUser({
        ...user,
        name: name,
        email: email,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { supabase } = require('@/services/supabase');
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  };

  const sendPasswordResetOTP = async (email: string) => {
    try {
      const response = await AuthService.sendPasswordResetOTP(email);
      return {
        success: response.success,
        error: response.error || undefined,
        message: response.message
      };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyPasswordResetOTP = async (email: string, otp: string) => {
    try {
      const response = await AuthService.verifyPasswordResetOTP(email, otp);
      return {
        success: response.success,
        error: response.error || undefined,
      };
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  };

  const resetPasswordWithOTP = async (email: string, newPassword: string) => {
    try {
      const response = await AuthService.resetPasswordWithOTP(email, newPassword);
      return {
        success: response.success,
        error: response.error || undefined,
      };
    } catch (error) {
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signOut,
    updateProfile,
    changePassword,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPasswordWithOTP,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};