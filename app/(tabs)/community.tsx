// screens/CommunityScreen.tsx - FULLY FIXED VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { FeedItemComponent } from '../components/community/FeedItem';
import { ChallengeCard } from '../components/community/ChallengeCard';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type TabType = 'feed' | 'challenges';

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

const CommunityScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [feedItems, setFeedItems] = useState<EnrichedFeedItem[]>([]);
  const [challenges, setChallenges] = useState<EnrichedChallenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingChallenges, setIsGeneratingChallenges] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

  // Animation values
  const tabUnderlineAnim = useRef(new Animated.Value(0)).current;

  // Realtime subscription
  const feedChannelRef = useRef<any>(null);

  // Track if component is mounted
  const isMounted = useRef(true);

  // ============================================================================
  // INITIAL LOAD - COMPLETELY FIXED
  // ============================================================================
  useEffect(() => {
    isMounted.current = true;
    
    const initializeData = async () => {
      if (user && !initialLoadComplete) {
        console.log('🚀 Initializing Community Screen for user:', user.id);
        await loadData();
        setInitialLoadComplete(true);
        setupRealtimeSubscription();
      }
    };

    initializeData();

    return () => {
      isMounted.current = false;
      cleanupRealtimeSubscription();
    };
  }, [user]);

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  const loadData = async (silent = false) => {
    if (!user) {
      console.log('⚠️ No user, skipping load');
      return;
    }

    try {
      console.log('📊 Loading community data...', { silent });
      
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      // Load data in parallel
      const [feedResult, challengesResult] = await Promise.allSettled([
        loadFeedItems(),
        loadChallenges()
      ]);

      // Check results
      if (feedResult.status === 'rejected') {
        console.error('❌ Feed loading failed:', feedResult.reason);
      } else {
        console.log('✅ Feed loaded successfully');
      }

      if (challengesResult.status === 'rejected') {
        console.error('❌ Challenges loading failed:', challengesResult.reason);
      } else {
        console.log('✅ Challenges loaded successfully');
      }

    } catch (err) {
      console.error('💥 Error loading data:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      if (!silent && isMounted.current) {
        setLoading(false);
      }
    }
  };

  // ============================================================================
  // LOAD FEED ITEMS
  // ============================================================================
  const loadFeedItems = async () => {
    if (!user) return;

    try {
      console.log('🔄 Fetching feed items...');
      
      const { data, error } = await supabase.rpc('get_feed_with_likes', {
        user_id_param: user.id,
        limit_param: 50,
        offset_param: 0
      });

      if (error) {
        console.error('❌ Feed RPC error:', error);
        throw error;
      }

      const feedData = data || [];
      console.log('📰 Feed items received:', feedData.length);
      
      if (isMounted.current) {
        setFeedItems(feedData);
      }

      return feedData;
    } catch (err) {
      console.error('💥 Error in loadFeedItems:', err);
      throw err;
    }
  };

  // ============================================================================
  // LOAD CHALLENGES
  // ============================================================================
  const loadChallenges = async () => {
    if (!user) return;

    try {
      console.log('🔄 Fetching challenges...');
      
      const { data, error } = await supabase.rpc('get_challenges_with_stats', {
        user_id_param: user.id
      });

      if (error) {
        console.error('❌ Challenges RPC error:', error);
        throw error;
      }

      const challengesData = data || [];
      console.log('🏆 Challenges received:', challengesData.length);
      
      if (isMounted.current) {
        setChallenges(challengesData);
      }

      return challengesData;
    } catch (err) {
      console.error('💥 Error in loadChallenges:', err);
      throw err;
    }
  };

  // ============================================================================
  // REALTIME SUBSCRIPTION
  // ============================================================================
  const setupRealtimeSubscription = () => {
    if (!user) return;

    cleanupRealtimeSubscription();

    console.log('🔔 Setting up realtime subscription...');

    feedChannelRef.current = supabase
      .channel('feed_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'feed_items' 
        },
        (payload) => {
          console.log('🆕 New feed item received:', payload);
          if (isMounted.current) {
            loadFeedItems();
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_likes'
        },
        () => {
          console.log('❤️ Feed likes changed');
          if (isMounted.current) {
            loadFeedItems();
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants'
        },
        () => {
          console.log('👥 Challenge participants changed');
          if (isMounted.current) {
            loadChallenges();
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });
  };

  const cleanupRealtimeSubscription = () => {
    if (feedChannelRef.current) {
      console.log('🧹 Cleaning up realtime subscription');
      supabase.removeChannel(feedChannelRef.current);
      feedChannelRef.current = null;
    }
  };

  // ============================================================================
  // PULL TO REFRESH
  // ============================================================================
  const onRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [user]);

  // ============================================================================
  // TAB SWITCHING
  // ============================================================================
  const handleTabSwitch = (tab: TabType) => {
    if (tab === activeTab) return;

    console.log('🔀 Switching tab to:', tab);
    setActiveTab(tab);

    // Animate underline
    Animated.spring(tabUnderlineAnim, {
      toValue: tab === 'feed' ? 0 : 1,
      useNativeDriver: true,
      friction: 8
    }).start();

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // ============================================================================
  // FEED ACTIONS
  // ============================================================================
  const handleLike = async (feedId: string) => {
    if (!user) return;

    try {
      const item = feedItems.find(f => f.id === feedId);
      if (!item) return;

      const wasLiked = item.is_liked_by_user;

      // Optimistic update
      setFeedItems(prev => prev.map(item => {
        if (item.id === feedId) {
          return {
            ...item,
            is_liked_by_user: !wasLiked,
            likes_count: wasLiked ? item.likes_count - 1 : item.likes_count + 1
          };
        }
        return item;
      }));

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (wasLiked) {
        // Unlike
        await supabase
          .from('feed_likes')
          .delete()
          .eq('feed_id', feedId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('feed_likes')
          .insert({ feed_id: feedId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error liking feed item:', err);
      // Revert on error
      await loadFeedItems();
    }
  };

  const handleEncourage = async (feedId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Auto-like when encouraging
    await handleLike(feedId);
  };

  // ============================================================================
  // CHALLENGE ACTIONS
  // ============================================================================
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      // Optimistic update
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

      // Haptic feedback
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

      // Create feed event
      await createFeedEvent('challenge_joined', undefined, challengeId);
    } catch (err) {
      console.error('Error joining challenge:', err);
      await loadChallenges();
    }
  };

  const handleContinueChallenge = (challengeId: string) => {
    // Navigate to challenge detail screen (implement navigation)
    console.log('Continue challenge:', challengeId);
  };

  // ============================================================================
  // GENERATE AI CHALLENGES
  // ============================================================================
  const generateAIChallenges = async () => {
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
  };

  // ============================================================================
  // CREATE FEED EVENT
  // ============================================================================
  const createFeedEvent = async (
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
  };

  // ============================================================================
  // RENDER SKELETON LOADER
  // ============================================================================
  const renderSkeleton = () => (
    <View className="px-4 pt-6">
      {[1, 2, 3].map(i => (
        <View key={i} className="card mb-4">
          <View className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </View>
      ))}
    </View>
  );

  // ============================================================================
  // RENDER ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <SafeAreaView className="flex-1 app-background">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-body text-lg font-semibold mt-4 text-center">
            {error}
          </Text>
          <TouchableOpacity
            className="btn-primary px-6 py-3 rounded-lg mt-6"
            onPress={() => {
              setError(null);
              loadData();
            }}
          >
            <Text className="text-btn-primary-text font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <SafeAreaView className="flex-1 app-background">
      {/* Tab Navigation */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row px-4 py-2">
          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => handleTabSwitch('feed')}
          >
            <Text
              className={`font-semibold text-base ${
                activeTab === 'feed'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              📰 Feed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => handleTabSwitch('challenges')}
          >
            <Text
              className={`font-semibold text-base ${
                activeTab === 'challenges'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              🏆 Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Underline */}
        <Animated.View
          className="h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
          style={{
            width: '50%',
            transform: [{
              translateX: tabUnderlineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200] // Adjust based on screen width
              })
            }]
          }}
        />
      </View>

      {/* Content */}
      {loading ? (
        renderSkeleton()
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
        >
          {activeTab === 'feed' && (
            <View className="px-4 pt-6 pb-20">
              <Text className="text-heading mb-4">Community Wins</Text>
              
              {feedItems.length === 0 ? (
                <View className="card items-center py-8">
                  <Text className="text-4xl mb-3">🌟</Text>
                  <Text className="text-body text-center">
                    No activity yet. Complete a habit to get started!
                  </Text>
                </View>
              ) : (
                feedItems.map(item => (
                  <FeedItemComponent
                    key={item.id}
                    item={item}
                    onLike={handleLike}
                    onEncourage={handleEncourage}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'challenges' && (
            <View className="px-4 pt-6 pb-20">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-heading">Challenges</Text>
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                  onPress={generateAIChallenges}
                  disabled={isGeneratingChallenges}
                >
                  {isGeneratingChallenges ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={16} color="#3b82f6" />
                      <Text className="text-blue-600 dark:text-blue-400 ml-2 font-medium text-sm">
                        AI Generate
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {challenges.length === 0 ? (
                <View className="card items-center py-8">
                  <Text className="text-4xl mb-3">🏆</Text>
                  <Text className="text-body text-center mb-4">
                    No challenges available yet
                  </Text>
                  <TouchableOpacity
                    className="btn-primary px-6 py-3 rounded-lg"
                    onPress={generateAIChallenges}
                    disabled={isGeneratingChallenges}
                  >
                    <Text className="text-btn-primary-text font-semibold">
                      Generate AI Challenges
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                challenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={{
                      id: challenge.id,
                      title: challenge.title,
                      description: challenge.description,
                      participants: challenge.participants_count,
                      duration: `${challenge.duration_days} days`,
                      difficulty: challenge.difficulty,
                      icon: challenge.icon,
                      progress: challenge.user_joined ? challenge.user_progress : undefined
                    }}
                    onJoin={handleJoinChallenge}
                    onContinue={handleContinueChallenge}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CommunityScreen;