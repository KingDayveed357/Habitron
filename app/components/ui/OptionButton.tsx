import { OptionItem } from "@/interfaces/interfaces";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity, Text } from "react-native";


const OptionButton: React.FC<{
  option: OptionItem;
  isSelected: boolean;
  onPress: () => void;
  isMultiple?: boolean;
}> = ({ option, isSelected, onPress, isMultiple = false }) => (
<TouchableOpacity
  onPress={onPress}
  className={`flex-row items-center p-4 mb-3 rounded-xl border-2 transition-all ${
    isSelected 
      ? 'border-indigo-500 dark:bg-gray-800  bg-indigo-50' 
      : 'dark:border-gray-700 border-gray-50 bg-white dark:bg-gray-800 '
  }`}
  style={[
    {
      shadowColor: '#000',
      // shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  ]}
  >
    <Text className="text-2xl mr-3">{option.emoji}</Text>
    <Text className={`flex-1 font-medium text-caption`}>
      {option.label}
    </Text>
    {isMultiple && isSelected && (
    //   <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
      <FontAwesome6 name="checkmark" size={24} color="#6366f1"/>
    )}
  </TouchableOpacity>
);


export default OptionButton