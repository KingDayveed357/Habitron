// import React from 'react';
// import { View, Text, TouchableOpacity, ScrollView } from "react-native";
// import { AIInsight } from "@/interfaces/interfaces";

// const AIInsightsCard: React.FC<{ insights: AIInsight[] }> = ({ insights }) => {
//   const getInsightColor = (type: string) => {
//     switch (type) {
//       case 'prediction': return 'border-blue-200 bg-blue-50';
//       case 'warning': return 'border-orange-200 bg-orange-50';
//       case 'recommendation': return 'border-green-200 bg-green-50';
//       case 'achievement': return 'border-purple-200 bg-purple-50';
//       default: return 'border-gray-200 bg-gray-50';
//     }
//   };

//   const getIconColor = (type: string) => {
//     switch (type) {
//       case 'prediction': return 'text-blue-600';
//       case 'warning': return 'text-orange-600';
//       case 'recommendation': return 'text-green-600';
//       case 'achievement': return 'text-purple-600';
//       default: return 'text-gray-600';
//     }
//   };

//   const getIcon = (type: string) => {
//     switch (type) {
//       case 'prediction': return '🔮';
//       case 'warning': return '⚠️';
//       case 'recommendation': return '💡';
//       case 'achievement': return '🏆';
//       default: return '📊';
//     }
//   };

//   return (
//     <View className="mb-4">
//       <Text className="text-lg text-subheading mb-3">AI Insights</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View className="flex-row">
//           {insights.map((insight, index) => (
//             <View 
//               key={index}
//               className={`border-2 rounded-xl p-4 mr-3 w-80 ${getInsightColor(insight.type)}`}
//             >
//               <View className="flex-row items-center justify-between mb-2">
//                 <View className="flex-row items-center">
//                   <Text className="text-xl mr-2">{getIcon(insight.type)}</Text>
//                   <Text className="font-semibold text-gray-800 flex-1">{insight.title}</Text>
//                 </View>
//                 <View className="bg-white px-2 py-1 rounded-full">
//                   <Text className="text-xs text-gray-600">{insight.confidence}%</Text>
//                 </View>
//               </View>
//               <Text className="text-gray-700 text-sm mb-3">{insight.message}</Text>
//               {insight.action && (
//                 <TouchableOpacity className="bg-white border border-gray-200 rounded-lg px-3 py-2 self-start">
//                   <Text className={`text-sm font-medium ${getIconColor(insight.type)}`}>
//                     {insight.action}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default AIInsightsCard;


import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AIInsight } from "@/services/AIServices/insights";

interface AIInsightsCardProps {
  insights: AIInsight[];
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insights }) => {
  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'warning': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800';
      case 'tip': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'achievement': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
      case 'motivation': return 'border-pink-200 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getIconColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-orange-600 dark:text-orange-400';
      case 'tip': return 'text-green-600 dark:text-green-400';
      case 'achievement': return 'text-purple-600 dark:text-purple-400';
      case 'motivation': return 'text-pink-600 dark:text-pink-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBadge = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
          <Text className="text-xs text-red-600 dark:text-red-400 font-medium">High Priority</Text>
        </View>;
      case 'medium':
        return <View className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
          <Text className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Medium</Text>
        </View>;
      case 'low':
        return <View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">Low</Text>
        </View>;
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <View className="card p-4">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          No insights available for this period
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row">
        {insights.map((insight) => (
          <View 
            key={insight.id}
            className={`border-2 rounded-xl p-4 mr-3 w-80 ${getInsightColor(insight.type)}`}
          >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <Text className="text-2xl mr-2">{insight.icon}</Text>
                <Text className="font-semibold text-gray-800 dark:text-white flex-1 flex-wrap">
                  {insight.title}
                </Text>
              </View>
              {getPriorityBadge(insight.priority)}
            </View>

            {/* Description */}
            <Text className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-5">
              {insight.description}
            </Text>

            {/* Action Button */}
            {insight.actionable && insight.action && (
              <TouchableOpacity 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 self-start mt-2"
                onPress={() => {
                  console.log('Action pressed:', insight.action);
                  // Handle action based on type
                }}
              >
                <Text className={`text-sm font-medium ${getIconColor(insight.type)}`}>
                  {insight.action.label}
                </Text>
              </TouchableOpacity>
            )}

            {/* Type badge */}
            <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {insight.type}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default AIInsightsCard;