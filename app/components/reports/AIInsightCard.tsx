import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AIInsight } from "@/interfaces/interfaces";

const AIInsightsCard: React.FC<{ insights: AIInsight[] }> = ({ insights }) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'recommendation': return 'border-green-200 bg-green-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'recommendation': return 'text-green-600';
      case 'achievement': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'prediction': return '🔮';
      case 'warning': return '⚠️';
      case 'recommendation': return '💡';
      case 'achievement': return '🏆';
      default: return '📊';
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-lg text-subheading mb-3">AI Insights</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {insights.map((insight, index) => (
            <View 
              key={index}
              className={`border-2 rounded-xl p-4 mr-3 w-80 ${getInsightColor(insight.type)}`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{getIcon(insight.type)}</Text>
                  <Text className="font-semibold text-gray-800 flex-1">{insight.title}</Text>
                </View>
                <View className="bg-white px-2 py-1 rounded-full">
                  <Text className="text-xs text-gray-600">{insight.confidence}%</Text>
                </View>
              </View>
              <Text className="text-gray-700 text-sm mb-3">{insight.message}</Text>
              {insight.action && (
                <TouchableOpacity className="bg-white border border-gray-200 rounded-lg px-3 py-2 self-start">
                  <Text className={`text-sm font-medium ${getIconColor(insight.type)}`}>
                    {insight.action}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AIInsightsCard;