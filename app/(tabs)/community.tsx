
// screens/CommunityScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../components/community/SearchBar';
import { TabNavigation } from '../components/community/TabNavigation';
import  LeaderboardCard  from '../components/community/LeaderBoardCard';
import { FeedItemComponent } from '../components/community/FeedItem';
import { ChallengeCard } from '../components/community/ChallengeCard';
import { ThreadCard } from '../components/community/ThreadCard';
import { AIHelpButton } from '../components/community/AIHelpButton';
import { TabType, User, FeedItem, Challenge, Thread } from '@/interfaces/interfaces'; // Adjust the import path as needed

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const leaderboardData: User[] = [
    { id: '1', name: 'Sarah Chen', avatar: '👩‍💼', streak: 45, points: 2340, level: 8 },
    { id: '2', name: 'Mike Johnson', avatar: '👨‍💻', streak: 38, points: 2100, level: 7 },
    { id: '3', name: 'Emma Davis', avatar: '👩‍🎨', streak: 32, points: 1890, level: 6 },
    { id: '4', name: 'David Kim', avatar: '👨‍🔬', streak: 28, points: 1650, level: 6 },
    { id: '5', name: 'Lisa Wang', avatar: '👩‍🏫', streak: 25, points: 1520, level: 5 },
  ];

  const feedData: FeedItem[] = [
    {
      id: '1',
      user: leaderboardData[0],
      type: 'streak',
      habit: 'Morning Meditation',
      timestamp: '2h ago',
      likes: 12,
      isLiked: false,
    },
    {
      id: '2',
      user: leaderboardData[1],
      type: 'completion',
      habit: 'Drink 8 Glasses of Water',
      timestamp: '4h ago',
      likes: 8,
      isLiked: true,
    },
    {
      id: '3',
      user: leaderboardData[2],
      type: 'milestone',
      habit: 'Daily Reading',
      timestamp: '6h ago',
      likes: 15,
      isLiked: false,
    },
  ];

  const challengesData: Challenge[] = [
    {
      id: '1',
      title: '30-Day Water Challenge',
      description: 'Drink 8 glasses of water daily for 30 days',
      participants: 1247,
      duration: '30 days',
      difficulty: 'Easy',
      icon: '💧',
      progress: 65,
    },
    {
      id: '2',
      title: 'No Social Media Week',
      description: 'Stay off social media for 7 consecutive days',
      participants: 892,
      duration: '7 days',
      difficulty: 'Hard',
      icon: '📱',
      progress: 23,
    },
    {
      id: '3',
      title: 'Morning Exercise',
      description: 'Exercise for 20 minutes every morning',
      participants: 2156,
      duration: '21 days',
      difficulty: 'Medium',
      icon: '🏃‍♀️',
    },
  ];

  const discussionsData: Thread[] = [
    {
      id: '1',
      title: 'Tips for staying consistent with morning routines?',
      author: 'Alex Thompson',
      replies: 23,
      timestamp: '1h ago',
      category: 'Morning Habits',
    },
    {
      id: '2',
      title: 'How to overcome habit plateaus?',
      author: 'Jessica Lee',
      replies: 18,
      timestamp: '3h ago',
      category: 'Motivation',
    },
    {
      id: '3',
      title: 'Best apps for habit stacking?',
      author: 'Ryan Miller',
      replies: 31,
      timestamp: '5h ago',
      category: 'Tools & Tips',
    },
  ];

  // Event handlers
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleLike = (itemId: string) => {
    console.log('Liked item:', itemId);
  };

  const handleEncourage = (itemId: string) => {
    console.log('Encouraged item:', itemId);
  };

  const handleJoinChallenge = (challengeId: string) => {
    console.log('Joined challenge:', challengeId);
  };

  const handleContinueChallenge = (challengeId: string) => {
    console.log('Continue challenge:', challengeId);
  };

  const handleThreadPress = (threadId: string) => {
    console.log('Open thread:', threadId);
  };

  const handleAIHelp = () => {
    console.log('Open AI help');
  };

  const handleCreateChallenge = () => {
    console.log('Create new challenge');
  };

  const handleNewPost = () => {
    console.log('Create new post');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView 
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' && (
          <>
            <Text className="text-xl font-bold text-gray-800 mb-4">Community Feed</Text>
            {feedData.map((item) => (
              <FeedItemComponent 
                key={item.id} 
                item={item} 
                onLike={handleLike}
                onEncourage={handleEncourage}
              />
            ))}
          </>
        )}

        {activeTab === 'challenges' && (
          <>
            <Text className="text-xl font-bold text-gray-800 mb-4">Active Challenges</Text>
            {challengesData.map((challenge) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onJoin={handleJoinChallenge}
                onContinue={handleContinueChallenge}
              />
            ))}
            <TouchableOpacity 
              className="bg-blue-500 p-4 rounded-xl items-center mb-4"
              onPress={handleCreateChallenge}
            >
              <Text className="text-white font-semibold text-lg">Create New Challenge</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            <Text className="text-xl font-bold text-gray-800 mb-4">Top Performers</Text>
            {leaderboardData.map((user, index) => (
              <LeaderboardCard key={user.id} user={user} rank={index + 1} />
            ))}
          </>
        )}

        {activeTab === 'discussions' && (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Discussions</Text>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleNewPost}
              >
                <Text className="text-white font-medium">New Post</Text>
              </TouchableOpacity>
            </View>
            {discussionsData.map((thread) => (
              <ThreadCard 
                key={thread.id} 
                thread={thread}
                onPress={handleThreadPress}
              />
            ))}
          </>
        )}
      </ScrollView>

      <AIHelpButton onPress={handleAIHelp} />
    </SafeAreaView>
  );
};

export default Community;