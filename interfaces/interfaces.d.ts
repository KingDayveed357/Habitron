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


export type TabType = 'feed' | 'challenges' | 'leaderboard' | 'discussions';