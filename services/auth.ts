// /services/auth.ts
import { supabase } from './supabase';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  joined_at: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

export interface OTPResponse {
  success: boolean;
  error: string | null;
  message?: string;
}

export class AuthService {
  // Supabase redirect URI
  private static readonly REDIRECT_URI = 'https://jituxcnvezofzwvjzctc.supabase.co/auth/v1/callback';

  // Email & Password Authentication
  static async signUpWithEmail(email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: this.REDIRECT_URI,
          data: {
            username,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            name: username,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            joined_at: new Date().toISOString(),
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: username,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Sign up failed' };
    } catch (error) {
      return { user: null, error: 'Network error occurred' };
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Sign in failed' };
    } catch (error) {
      return { user: null, error: 'Network error occurred' };
    }
  }

  // Google Authentication using expo-auth-session
  static useGoogleAuth() {
    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({
        scheme: 'habitron', 
        path: 'auth',
        // useProxy: true
        preferLocalhost: true,
      }),
    });

    return { request, response, promptAsync };
  }

  static async signInWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      if (!idToken) {
        return { user: null, error: 'No ID token received from Google' };
      }

      // Sign in with Supabase using the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create/update user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Google sign in failed' };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { user: null, error: 'Google sign in failed' };
    }
  }

  // Helper method to handle Google auth response
  static async handleGoogleAuthResponse(response: any): Promise<AuthResponse> {
    try {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        return await this.signInWithGoogle(id_token);
      } else if (response?.type === 'cancel') {
        return { user: null, error: 'Google sign in was cancelled' };
      } else {
        return { user: null, error: 'Google sign in failed' };
      }
    } catch (error) {
      console.error('Google auth response error:', error);
      return { user: null, error: 'Google sign in failed' };
    }
  }

  // Apple Authentication
  static async signInWithApple(): Promise<AuthResponse> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          // Create/update user profile
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              name: credential.fullName 
                ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
                : data.user.user_metadata?.name,
              avatar_url: data.user.user_metadata?.avatar_url,
              joined_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }

          return {
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name,
              avatar_url: data.user.user_metadata?.avatar_url,
              joined_at: data.user.created_at,
            },
            error: null,
          };
        }
      }

      return { user: null, error: 'Apple sign in failed' };
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        return { user: null, error: 'Sign in was cancelled' };
      }
      return { user: null, error: 'Apple sign in failed' };
    }
  }

  // Facebook Authentication
  static useFacebookAuth() {
    const [request, response, promptAsync] = Facebook.useAuthRequest({
      clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
      redirectUri: makeRedirectUri({
        scheme: 'your-app-scheme', // Replace with your app scheme
        path: 'auth',
      }),
    });

    return { request, response, promptAsync };
  }

  static async signInWithFacebook(accessToken: string): Promise<AuthResponse> {
    try {
      if (!accessToken) {
        return { user: null, error: 'No access token received from Facebook' };
      }

      // Sign in with Supabase using the Facebook access token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'facebook',
        token: accessToken,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create/update user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            joined_at: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Facebook sign in failed' };
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return { user: null, error: 'Facebook sign in failed' };
    }
  }

  // Helper method to handle Facebook auth response
  static async handleFacebookAuthResponse(response: any): Promise<AuthResponse> {
    try {
      if (response?.type === 'success') {
        const { access_token } = response.params;
        return await this.signInWithFacebook(access_token);
      } else if (response?.type === 'cancel') {
        return { user: null, error: 'Facebook sign in was cancelled' };
      } else {
        return { user: null, error: 'Facebook sign in failed' };
      }
    } catch (error) {
      console.error('Facebook auth response error:', error);
      return { user: null, error: 'Facebook sign in failed' };
    }
  }

  // Twitter Authentication (keeping OAuth redirect method)
  static async signInWithTwitter(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: this.REDIRECT_URI,
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: null, error: null }; // OAuth redirect will handle the rest
    } catch (error) {
      return { user: null, error: 'Twitter sign in failed' };
    }
  }

  // Generate 4-digit OTP
  private static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Send OTP for Password Reset
  static async sendPasswordResetOTP(email: string): Promise<OTPResponse> {
    try {
      // First, validate that the email exists in the system
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError || !userData) {
        return { 
          success: false, 
          error: 'No account found with this email address' 
        };
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP in database (you'll need to create this table)
      const { error: otpError } = await supabase
        .from('password_reset_otps')
        .upsert({
          email: email.toLowerCase().trim(),
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: new Date().toISOString(),
        });

      if (otpError) {
        console.error('OTP storage error:', otpError);
        return { 
          success: false, 
          error: 'Failed to generate OTP. Please try again.' 
        };
      }

      // Send OTP via email using Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email: email.toLowerCase().trim(),
          otp: otp,
          type: 'password_reset'
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        return { 
          success: false, 
          error: 'Failed to send OTP. Please try again.' 
        };
      }

      return { 
        success: true, 
        error: null, 
        message: 'OTP sent successfully to your email' 
      };

    } catch (error) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        error: 'Network error occurred. Please try again.' 
      };
    }
  }

  // Verify OTP for Password Reset
  static async verifyPasswordResetOTP(email: string, otp: string): Promise<OTPResponse> {
    try {
      const { data: otpData, error: otpError } = await supabase
        .from('password_reset_otps')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('otp_code', otp)
        .eq('used', false)
        .single();

      if (otpError || !otpData) {
        return { 
          success: false, 
          error: 'Invalid OTP. Please check and try again.' 
        };
      }

      // Check if OTP has expired
      const now = new Date();
      const expiresAt = new Date(otpData.expires_at);
      
      if (now > expiresAt) {
        return { 
          success: false, 
          error: 'OTP has expired. Please request a new one.' 
        };
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('password_reset_otps')
        .update({ used: true })
        .eq('id', otpData.id);

      if (updateError) {
        console.error('OTP update error:', updateError);
        return { 
          success: false, 
          error: 'Verification failed. Please try again.' 
        };
      }

      return { 
        success: true, 
        error: null, 
        message: 'OTP verified successfully' 
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      return { 
        success: false, 
        error: 'Network error occurred. Please try again.' 
      };
    }
  }

  // Reset Password with New Password
  static async resetPasswordWithOTP(email: string, newPassword: string): Promise<OTPResponse> {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError || !userData) {
        return { 
          success: false, 
          error: 'User not found' 
        };
      }

      // Update password using Supabase Admin API (you'll need to implement this via Edge Function)
      const { error: passwordError } = await supabase.functions.invoke('update-user-password', {
        body: {
          email: email.toLowerCase().trim(),
          newPassword: newPassword
        }
      });

      if (passwordError) {
        console.error('Password update error:', passwordError);
        return { 
          success: false, 
          error: 'Failed to update password. Please try again.' 
        };
      }

      // Clean up used OTPs for this email
      await supabase
        .from('password_reset_otps')
        .delete()
        .eq('email', email.toLowerCase().trim());

      return { 
        success: true, 
        error: null, 
        message: 'Password updated successfully' 
      };

    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: 'Network error occurred. Please try again.' 
      };
    }
  }

  // Legacy method - kept for backward compatibility
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: this.REDIRECT_URI,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Password reset failed' };
    }
  }

  // Sign Out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'Sign out failed' };
    }
  }

  // Get Current User
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          joined_at: user.created_at,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
          joined_at: session.user.created_at,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}