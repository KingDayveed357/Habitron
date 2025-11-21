// hooks/useCommunity.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface EnrichedFeedItem {
  id: string;
  user_id: string;
  type: string;
  habit_id: string | null;
  challenge_id: string | null;
  metadata: any;
  created_at: string;
  likes_count: number;
  is_liked_by_user: boolean;
  user_name: string;
  user_avatar: string | null;
  user_streak: number;
}

interface EnrichedChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_days: number;
  icon: string;
  created_by: string;
  participants_count: number;
  user_progress: number;
  user_joined: boolean;
}

interface UseCommunityReturn {
  feedItems: EnrichedFeedItem[];
  challenges: EnrichedChallenge[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isGeneratingChallenges: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  refresh: () => Promise<void>;
  likeFeedItem: (feedId: string) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  generateAIChallenges: () => Promise<void>;
  createFeedEvent: (type: string, habitId?: string, challengeId?: string) => Promise<void>;
}

export const useCommunity = (): UseCommunityReturn => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<EnrichedFeedItem[]>([]);
  const [challenges, setChallenges] = useState<EnrichedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingChallenges, setIsGeneratingChallenges] = useState(false);

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

  const realtimeChannelRef = useRef<any>(null);

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadFeedItems(),
        loadChallenges()
      ]);
    } catch (err) {
      console.error('Error loading community data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadFeedItems = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_feed_with_likes', {
      user_id_param: user.id,
      limit_param: 50,
      offset_param: 0
    });

    if (error) throw error;
    setFeedItems(data || []);
  };

  const loadChallenges = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_challenges_with_stats', {
      user_id_param: user.id
    });

    if (error) throw error;
    setChallenges(data || []);
  };

  // ============================================================================
  // REFRESH
  // ============================================================================
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ============================================================================
  // LIKE FEED ITEM
  // ============================================================================
  const likeFeedItem = useCallback(async (feedId: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setFeedItems(prev => prev.map(item => {
        if (item.id === feedId) {
          const wasLiked = item.is_liked_by_user;
          return {
            ...item,
            is_liked_by_user: !wasLiked,
            likes_count: wasLiked ? item.likes_count - 1 : item.likes_count + 1
          };
        }
        return item;
      }));

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const item = feedItems.find(f => f.id === feedId);
      if (!item) return;

      if (item.is_liked_by_user) {
        await supabase
          .from('feed_likes')
          .delete()
          .eq('feed_id', feedId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('feed_likes')
          .insert({ feed_id: feedId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error liking feed item:', err);
      await loadFeedItems();
    }
  }, [user, feedItems]);

  // ============================================================================
  // JOIN CHALLENGE
  // ============================================================================
  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    try {
      setChallenges(prev => prev.map(c => {
        if (c.id === challengeId) {
          return {
            ...c,
            user_joined: true,
            participants_count: c.participants_count + 1,
            user_progress: 0
          };
        }
        return c;
      }));

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress_percent: 0
        });

      if (error) throw error;

      await createFeedEvent('challenge_joined', undefined, challengeId);
    } catch (err) {
      console.error('Error joining challenge:', err);
      await loadChallenges();
    }
  }, [user]);

  // ============================================================================
  // GENERATE AI CHALLENGES
  // ============================================================================
  const generateAIChallenges = useCallback(async () => {
    if (!user || isGeneratingChallenges) return;

    try {
      setIsGeneratingChallenges(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-ai-challenges`,
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
        await loadChallenges();
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        throw new Error(result.error || 'Failed to generate challenges');
      }
    } catch (err) {
      console.error('Error generating AI challenges:', err);
      setError('Failed to generate challenges');
    } finally {
      setIsGeneratingChallenges(false);
    }
  }, [user, isGeneratingChallenges]);

  // ============================================================================
  // CREATE FEED EVENT
  // ============================================================================
  const createFeedEvent = useCallback(async (
    type: string,
    habitId?: string,
    challengeId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${SUPABASE_URL}/functions/v1/generate-feed-event`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type,
            habit_id: habitId,
            challenge_id: challengeId
          })
        }
      );
    } catch (err) {
      console.error('Error creating feed event:', err);
    }
  }, []);

  // ============================================================================
  // REALTIME SUBSCRIPTION
  // ============================================================================
  useEffect(() => {
    if (!user) return;

    setupRealtimeSubscription();

    return () => {
      cleanupRealtimeSubscription();
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    cleanupRealtimeSubscription();

    realtimeChannelRef.current = supabase
      .channel('community_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'feed_items' 
        },
        () => {
          loadFeedItems();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_likes'
        },
        () => {
          loadFeedItems();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants'
        },
        () => {
          loadChallenges();
        }
      )
      .subscribe();
  };

  const cleanupRealtimeSubscription = () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  return {
    feedItems,
    challenges,
    loading,
    refreshing,
    error,
    isGeneratingChallenges,
    loadData,
    refresh,
    likeFeedItem,
    joinChallenge,
    generateAIChallenges,
    createFeedEvent
  };
};