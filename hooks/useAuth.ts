// /hooks/useAuth.ts
import { useEffect } from 'react';
import { AuthService } from '@/services/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth as useAuthContext } from '@/context/AuthContext';

export interface UseAuthReturn {
  // Auth context methods
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetOTP: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyPasswordResetOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOTP: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // OAuth specific methods
  signInWithGoogleOAuth: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebookOAuth: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  
  // OAuth states
  googleRequest: any;
  googleResponse: any;
  facebookRequest: any;
  facebookResponse: any;
}

export const useAuth = (): UseAuthReturn => {
  const authContext = useAuthContext();

  // Google OAuth setup
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri({
      scheme: 'habitron',
      path: 'auth',
      preferLocalhost: true,
    }),
  });

  // Facebook OAuth setup
  const [facebookRequest, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
    redirectUri: makeRedirectUri({
      scheme: 'habitron',
      path: 'auth',
    }),
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess();
    }
  }, [googleResponse]);

  // Handle Facebook OAuth response
  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      handleFacebookSuccess();
    }
  }, [facebookResponse]);

  const handleGoogleSuccess = async () => {
    try {
      const response = await AuthService.handleGoogleAuthResponse(googleResponse);
      if (response.user) {
        authContext.refreshUser();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Google sign in failed' };
      }
    } catch (error) {
      console.error('Google auth error:', error);
      return { success: false, error: 'Google sign in failed' };
    }
  };

  const handleFacebookSuccess = async () => {
    try {
      const response = await AuthService.handleFacebookAuthResponse(facebookResponse);
      if (response.user) {
        authContext.refreshUser();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Facebook sign in failed' };
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      return { success: false, error: 'Facebook sign in failed' };
    }
  };

  const signInWithGoogleOAuth = async () => {
    try {
      const result = await promptGoogleAsync();
      if (result.type === 'success') {
        return await handleGoogleSuccess();
      } else if (result.type === 'cancel') {
        return { success: false, error: 'Google sign in was cancelled' };
      } else {
        return { success: false, error: 'Google sign in failed' };
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: 'Google sign in failed' };
    }
  };

  const signInWithFacebookOAuth = async () => {
    try {
      const result = await promptFacebookAsync();
      if (result.type === 'success') {
        return await handleFacebookSuccess();
      } else if (result.type === 'cancel') {
        return { success: false, error: 'Facebook sign in was cancelled' };
      } else {
        return { success: false, error: 'Facebook sign in failed' };
      }
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return { success: false, error: 'Facebook sign in failed' };
    }
  };

  const signInWithApple = async () => {
    return await authContext.signInWithApple();
  };

  return {
    ...authContext,
    signInWithGoogleOAuth,
    signInWithFacebookOAuth,
    signInWithApple,
    googleRequest,
    googleResponse,
    facebookRequest,
    facebookResponse,
  };
};