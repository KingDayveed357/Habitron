import { View, Text } from "react-native"
import { PeriodData } from "@/interfaces/interfaces"

interface PerformanceSummaryProps{
    periodData: PeriodData
}

const PerformanceSummary = ({ periodData }: PerformanceSummaryProps) => {

return(
<View className="card p-4 mb-6 ">
<Text className="text-lg font-semibold text-body mb-4">Period Summary</Text>
<View className="space-y-2">
  <Text className="text-sm text-body">
    Period: {periodData.periodLabel}
  </Text>
  <Text className="text-sm text-body">
    Total Days Tracked: {periodData.totalDays}
  </Text>
  <Text className="text-sm text-body">
    Overall Completion: {periodData.overallMetrics.completionRate}%
  </Text>
  <Text className="text-sm text-body">
    Active Streaks: {periodData.overallMetrics.activeStreaks}/{periodData.overallMetrics.totalHabits}
  </Text>
</View>
</View>
)}


export default PerformanceSummary