import { View, Text } from "react-native";

const HeatmapCalendar = () => {
    // Generate heatmap data based on selected period
    const generateHeatmapData = () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 27); // Show last 4 weeks

      const weeks = [];
      let currentWeek = [];
      
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 && currentWeek.length > 0) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
        
        const completed = Math.random() > 0.3; // Mock completion data
        currentWeek.push(completed ? 1 : 0);
      }
      
      if (currentWeek.length > 0) {
        // Pad the last week with zeros if needed
        while (currentWeek.length < 7) {
          currentWeek.push(0);
        }
        weeks.push(currentWeek);
      }
      
      return weeks;
    };

    const weeklyHeatmapData = generateHeatmapData();

    return (
      <View className="card p-4 ">
        <Text className="text-lg font-semibold text-body mb-4">Completion Heatmap</Text>
        <View className="flex-row justify-between mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} className="text-xs text-body w-6 text-center">{day}</Text>
          ))}
        </View>
        {weeklyHeatmapData.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row justify-between mb-1">
            {week.map((day, dayIndex) => (
              <View
                key={dayIndex}
                className={`w-6 h-6 rounded-sm ${
                  day ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </View>
        ))}
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-xs text-body">Less</Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                className={`w-3 h-3 rounded-sm mr-1 ${
                  level <= 2 ? 'bg-gray-200 dark:bg-gray-700' : level <= 4 ? 'bg-green-300' : 'bg-green-500'
                }`}
              />
            ))}
          </View>
          <Text className="text-xs text-body">More</Text>
        </View>
      </View>
    );
  };


export default HeatmapCalendar