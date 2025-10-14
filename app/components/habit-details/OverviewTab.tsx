// ==========================================
// components/habit-details/OverviewTab.tsx
// ==========================================
import React, { memo } from 'react';
import { View } from 'react-native';
import { HabitWithCompletion } from '@/types/habit';
import { ProgressCard } from './ProgressCard';
// import { QuickStatsCard } from './QuickStatsCard';
import { HabitDetailsCard } from './Card';

interface OverviewTabProps {
  habit: HabitWithCompletion;
  todayProgress: number;
  isUpdatingProgress: boolean;
  statistics: any;
  onProgressUpdate: (increment: number) => void;
}

export const OverviewTab = memo<OverviewTabProps>(({ 
  habit, 
  todayProgress, 
  isUpdatingProgress, 
  statistics,
  onProgressUpdate 
}) => (
  <View className="px-4">
    <ProgressCard
      habit={habit}
      todayProgress={todayProgress}
      isUpdating={isUpdatingProgress}
      onProgressUpdate={onProgressUpdate}
    />
    
    {/* <QuickStatsCard statistics={statistics} /> */}
    
    <HabitDetailsCard habit={habit} />
  </View>
));

OverviewTab.displayName = 'OverviewTab';