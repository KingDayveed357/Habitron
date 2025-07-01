import { User, FeedItem, Challenge, Thread } from '@/interfaces/interfaces';

  export const leaderboardData: User[] = [
    { id: '1', name: 'Sarah Chen', avatar: '👩‍💼', streak: 45, points: 2340, level: 8 },
    { id: '2', name: 'Mike Johnson', avatar: '👨‍💻', streak: 38, points: 2100, level: 7 },
    { id: '3', name: 'Emma Davis', avatar: '👩‍🎨', streak: 32, points: 1890, level: 6 },
    { id: '4', name: 'David Kim', avatar: '👨‍🔬', streak: 28, points: 1650, level: 6 },
    { id: '5', name: 'Lisa Wang', avatar: '👩‍🏫', streak: 25, points: 1520, level: 5 },
  ];

  export const feedData: FeedItem[] = [
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

  export const challengesData: Challenge[] = [
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

  export const discussionsData: Thread[] = [
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