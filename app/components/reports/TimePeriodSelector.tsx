import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TimePeriod, PeriodOption, PeriodData } from '@/interfaces/interfaces';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  periodOptions: PeriodOption[];
  periodData: PeriodData;
  onPeriodSelect: (period: TimePeriod) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  periodOptions,
  periodData,
  onPeriodSelect,
}) => {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
          try {
            onPeriodSelect(option.key as TimePeriod);
          } catch (err) {
            console.log('Error in onPeriodSelect:', err);
          }
}}

            className={`py-2 px-4 rounded-full mr-2 ${
              selectedPeriod === option.key 
                ? 'bg-blue-600 shadow-sm' 
                : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm font-medium ${
              selectedPeriod === option.key ? 'text-white' : 'text-gray-600'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text className="text-center text-gray-500 text-sm mt-2">
        {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

export default TimePeriodSelector;