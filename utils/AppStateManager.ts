import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

export type AppState = 'loading' | 'onboarding' | 'auth' | 'authenticated';

export interface InitialState {
  state: AppState;
  userId?: string;
}

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@habitron:onboarding_completed',
  LAST_AUTH_CHECK: '@habitron:last_auth_check',
} as const;

export class AppStateManager {
  /**
   * Determine the initial app state based on onboarding and auth status
   */
  static async getInitialState(): Promise<InitialState> {
    try {
      // Check onboarding status
      const hasCompletedOnboarding = await this.hasCompletedOnboarding();
      
      // Check authentication status
      const authState = await this.getAuthState();

      // Decision tree for initial state
      if (authState.isAuthenticated && authState.userId) {
        return { state: 'authenticated', userId: authState.userId };
      }

      if (hasCompletedOnboarding) {
        return { state: 'auth' };
      }

      return { state: 'onboarding' };
    } catch (error) {
      console.error('Error determining initial state:', error);
      return { state: 'onboarding' };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      throw error;
    }
  }

  /**
   * Get authentication state from Supabase
   */
  static async getAuthState(): Promise<{
    isAuthenticated: boolean;
    userId?: string;
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching auth session:', error);
        return { isAuthenticated: false };
      }

      if (session?.user) {
        await this.updateLastAuthCheck();
        
        return {
          isAuthenticated: true,
          userId: session.user.id,
        };
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Error checking auth state:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Update last authentication check timestamp
   */
  private static async updateLastAuthCheck(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_AUTH_CHECK,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error updating last auth check:', error);
    }
  }

  /**
   * Reset app state (useful for testing or logout)
   */
  static async resetAppState(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.LAST_AUTH_CHECK,
      ]);
    } catch (error) {
      console.error('Error resetting app state:', error);
      throw error;
    }
  }

  /**
   * Check if auth session is still valid (optional optimization)
   */
  static async shouldRefreshAuth(): Promise<boolean> {
    try {
      const lastCheck = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AUTH_CHECK);
      
      if (!lastCheck) return true;

      const lastCheckTime = new Date(lastCheck).getTime();
      const now = Date.now();
      const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);

      return hoursSinceLastCheck > 1;
    } catch (error) {
      console.error('Error checking auth refresh need:', error);
      return true;
    }
  }
}
