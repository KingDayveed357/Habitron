import { TouchableOpacity } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="absolute left-4 top-12 z-10 p-2"
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
     <FontAwesome6 name="arrow-left" size={20} color="#333" />
  </TouchableOpacity>
);

export default BackButton