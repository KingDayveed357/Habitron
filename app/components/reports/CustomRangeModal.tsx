// components/reports/CustomRangeModal.tsx

import React from 'react';
import { View, Text, Modal, TouchableOpacity, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';


interface CustomRangeModalProps {
  visible: boolean;
  startDate: Date;
  endDate: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  onClose: () => void;
  onApply: () => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onShowStartPicker: (show: boolean) => void;
  onShowEndPicker: (show: boolean) => void;
}

const CustomRangeModal: React.FC<CustomRangeModalProps> = ({
  visible,
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  onClose,
  onApply,
  onStartDateChange,
  onEndDateChange,
  onShowStartPicker,
  onShowEndPicker,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >

         {/* BlurView Background */}
      <BlurView 
        intensity={100} 
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />
      
      {/* Semi-transparent overlay for better contrast */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      <View className="flex-1 justify-center items-center  bg-opacity-50">
        <View className="bg-white rounded-xl p-6 m-4 w-80">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Select Custom Range</Text>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Start Date</Text>
            <TouchableOpacity
              onPress={() => onShowStartPicker(true)}
              className="border border-gray-300 rounded-lg p-3"
            >
              <Text className="text-gray-800">{startDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">End Date</Text>
            <TouchableOpacity
              onPress={() => onShowEndPicker(true)}
              className="border border-gray-300 rounded-lg p-3"
            >
              <Text className="text-gray-800">{endDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 mr-2"
            >
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onApply}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Apply</Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                onShowStartPicker(false);
                if (selectedDate) {
                  onStartDateChange(selectedDate);
                }
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                onShowEndPicker(false);
                if (selectedDate) {
                  onEndDateChange(selectedDate);
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomRangeModal;