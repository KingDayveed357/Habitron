// interfaces/interfaces.d.ts
export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  effectiveTheme: "light" | "dark"; // The actual theme being used
}


export interface NavigationButtonProps {
  path: LinkProps['href']; 
  backgroundColor?: string;
  textColor?: string;
  text: string;
  fullWidth?: boolean;
  className?: string;
  color: string;
}

export interface Slide {
  id: string;
  title: string;
  description: string;
  image: any;
}

export interface OnboardingItemProps {
  item: {
    title: string;
    description: string;
    image: any;
  };
}

export interface OptionItem {
  id: string;
  label: string;
  emoji: string;
  selected?: boolean;
}

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  type: 'single' | 'multiple' | 'time' | 'input' | 'contract';
  options?: OptionItem[];
  maxSelections?: number;
  context?: string
}


export interface HabitDataProps {
  id: string;
  name: string;
  icon: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  consistencyScore: number;
  momentum: number;
  optimalTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  weeklyPattern: number[];
  monthlyTrend: number[];
  correlationScore: number;
  dailyData: { date: string; completed: boolean }[];

  frequency?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    count: number;
    expected: number;  // Expected completions for period
    actual: number;    // Actual completions
    days?: number[];   // For specific days
  };
}

export interface AIInsight {
  type: 'prediction' | 'warning' | 'recommendation' | 'achievement';
  title: string;
  message: string;
  confidence: number;
  action?: string;
}

export interface TimelineData {
  date: string;
  habits: { [key: string]: boolean };
  mood: number;
  energy: number;
  weather: string;
}

export type TimePeriod = 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom';

export interface OverallMetrics {
  totalHabits: number;
  activeStreaks: number;
  completionRate: number;
  consistencyScore: number;
  momentum: number;
  improvement: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface PeriodData {
  habits: (HabitData & { periodDailyData?: any[] })[];
  overallMetrics: OverallMetrics;
  periodLabel: string;
  totalDays: number;
}
export interface PeriodOption {
  key: TimePeriod;
  label: string;
}


export interface User {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  points: number;
  level: number;
}

export interface FeedItem {
  id: string;
  user: User;
  type: 'completion' | 'streak' | 'milestone';
  habit: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
  progress?: number;
}

export interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  timestamp: string;
  category: string;
}

export interface HabitLog {
  id: string
  habitId: string
  completedAt: string
  count: number
  note?: string
}

export interface UserStats {
  totalHabits: number
  activeHabits: number
  completedToday: number
  completionRate: number
  activeStreak: number
  longestStreak: number
  totalCompletions: number
}


// Community and Feed related interfaces
export interface FeedItem {
  id: string;
  user_id: string;
  type: 'completion' | 'milestone' | 'streak' | 'challenge_joined' | 'challenge_completed' | 'habit_created' | 'habit_revived';
  habit_id: string | null;
  challenge_id: string | null;
  metadata: FeedItemMetadata;
  created_at: string;
  updated_at: string;
}

export interface FeedItemMetadata {
  habit_title?: string;
  habit_icon?: string;
  habit_category?: string;
  challenge_title?: string;
  challenge_icon?: string;
  challenge_difficulty?: 'Easy' | 'Medium' | 'Hard';
  challenge_duration?: number;
  total_completions?: number;
  streak_days?: number;
  completed_count?: number;
  days_since_last?: number;
  [key: string]: any;
}

export interface EnrichedFeedItem extends FeedItem {
  likes_count: number;
  is_liked_by_user: boolean;
  user_name: string;
  user_avatar: string | null;
  user_streak: number;
}

export interface Challenge {
  id: string;
  created_by: 'ai' | 'user';
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_days: number;
  icon: string;
  ai_metadata: AIMetadata;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMetadata {
  reasoning?: string;
  generated_at?: string;
  personalization_factors?: string[];
  confidence_score?: number;
  [key: string]: any;
}

export interface EnrichedChallenge extends Challenge {
  participants_count: number;
  user_progress: number;
  user_joined: boolean;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress_percent: number;
  joined_at: string;
  completed_at: string | null;
}

export interface FeedLike {
  id: string;
  feed_id: string;
  user_id: string;
  created_at: string;
}

// Props for components

export interface FeedItemComponentProps {
  item: EnrichedFeedItem;
  onLike?: (itemId: string) => void;
  onEncourage?: (itemId: string) => void;
  onComment?: (itemId: string) => void;
}

export interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    participants: number;
    duration: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: string;
    progress?: number;
  };
  onJoin?: (challengeId: string) => void;
  onContinue?: (challengeId: string) => void;
}

// API Response types

export interface GetFeedWithLikesResponse {
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

export interface GetChallengesWithStatsResponse {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_days: number;
  icon: string;
  created_by: 'ai' | 'user';
  participants_count: number;
  user_progress: number;
  user_joined: boolean;
}

// Edge Function payloads

export interface GenerateAIChallengesRequest {
  // Empty - uses user context from auth
}

export interface GenerateAIChallengesResponse {
  success: boolean;
  challenges: Challenge[];
  count: number;
  error?: string;
}

export interface GenerateFeedEventRequest {
  type: 'completion' | 'milestone' | 'streak' | 'challenge_joined' | 'challenge_completed' | 'habit_created' | 'habit_revived';
  habit_id?: string;
  challenge_id?: string;
  metadata?: Record<string, any>;
}

export interface GenerateFeedEventResponse {
  success: boolean;
  posted: boolean;
  feed_item?: FeedItem;
  message?: string;
  error?: string;
}

// Internal types for AI generation

export interface UserHabitData {
  activeHabits: any[];
  streakData: Array<{
    habitId: string;
    title: string;
    currentStreak: number;
    completions: number;
  }>;
  missedHabits: any[];
  completionHistory: any[];
  userGoal: any;
  preferredDifficulty: string;
}

export interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_days: number;
  icon: string;
  reasoning: string;
}

// Realtime subscription types

export interface FeedRealtimePayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'feed_items' | 'feed_likes' | 'challenge_participants';
  schema: 'public';
  old: any;
  new: any;
}

// Filter and sorting options

export type FeedSortOption = 'recent' | 'popular' | 'following';
export type FeedFilterType = 'all' | 'completion' | 'milestone' | 'streak' | 'challenge';

export interface FeedFilters {
  sort: FeedSortOption;
  type?: FeedFilterType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChallengeFilters {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: '7' | '14' | '21' | '30' | '60' | '90';
  joined?: boolean;
}

// Statistics and analytics

export interface CommunityStats {
  total_feed_items: number;
  total_challenges: number;
  active_participants: number;
  average_likes_per_post: number;
  most_popular_challenge: Challenge | null;
  trending_habits: Array<{
    habit_id: string;
    title: string;
    mention_count: number;
  }>;
}

export interface UserCommunityStats {
  posts_created: number;
  likes_received: number;
  challenges_joined: number;
  challenges_completed: number;
  encouragements_sent: number;
  encouragements_received: number;
}

// Update your existing interfaces.ts to include these
// Or merge with existing community-related interfaces


export type TabType = 'feed' | 'challenges' | 'leaderboard' | 'discussions';