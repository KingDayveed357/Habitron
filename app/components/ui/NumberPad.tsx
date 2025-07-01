import {View, TouchableOpacity, Text} from "react-native"


const NumberPad: React.FC<{
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
}> = ({ onNumberPress, onBackspace }) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];

  return (
    <View className="mt-6">
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-center mb-4">
          {row.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => item === '⌫' ? onBackspace() : onNumberPress(item)}
              className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mx-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-xl font-semibold text-gray-700">
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};


export default NumberPad