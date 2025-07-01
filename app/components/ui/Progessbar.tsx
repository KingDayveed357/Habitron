import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const ProgressBar: React.FC<{
  current: number;
  total: number;
  onBack: () => void;
}> = ({ current, total, onBack }) => {
  const progress = (current / total) * 100;

  return (
    <View className="flex-row items-center justify-between px-5 mt-4 mb-6">
      {/* Back Button */}
       {current > 1 ? (
        <TouchableOpacity
          onPress={onBack}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
      ) : (
        <View className="w-8" /> 
      )}

      {/* Progress Bar */}
      <View className="flex-1 mx-4">
        <View className="h-1 w-full dark:bg-gray-800  bg-indigo-50 rounded-full overflow-hidden">
          <View
            className="h-1 bg-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Slide Text */}
      <Text className="text-gray-500 text-sm font-medium">
        {current}/{total}
      </Text>
    </View>
  );
};

export default ProgressBar;
