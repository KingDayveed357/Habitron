import React from 'react';
import { View } from 'react-native';
import MetricCard from './MetricCard';
import { OverallMetrics } from '@/interfaces/interfaces';

interface MetricsOverviewProps {
  overallMetrics: OverallMetrics;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ overallMetrics }) => {
  return (
    <>
      {/* First row of metrics */}
      <View className="flex-row gap-3">
        <MetricCard 
          title="Overall Rate" 
          value={`${overallMetrics.completionRate}%`}
          subtitle="Completion"
          color="text-blue-600"
          trend={overallMetrics.improvement}
        />
        <MetricCard 
          title="Active Streaks" 
          value={`${overallMetrics.activeStreaks}`}
          subtitle={`Of ${overallMetrics.totalHabits} habits`}
          color="text-green-600"
        />
      </View>

      {/* Second row of metrics */}
      <View className="flex-row gap-3 mb-4">
        <MetricCard 
          title="Consistency" 
          value={`${overallMetrics.consistencyScore}`}
          subtitle="Score"
          color="text-purple-600"
          trend={15}
        />
        <MetricCard 
          title="Momentum" 
          value={`${overallMetrics.momentum}`}
          subtitle="Current"
          color="text-orange-600"
        />
      </View>
    </>
  );
};

export default MetricsOverview;