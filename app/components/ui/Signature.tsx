import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  signature?: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureChange, signature }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const pathRef = useRef('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const newPath = `${pathRef.current} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderRelease: () => {
      const newPath = pathRef.current;
      if (!newPath) return;

      const updatedPaths = [...paths, newPath];
      setPaths(updatedPaths);
      onSignatureChange(updatedPaths.join('|'));

      setCurrentPath('');
      pathRef.current = '';
    },
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    onSignatureChange('');
  };

  return (
    <View className="app-background rounded-2xl  mb-6" style={{ elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
      {/* Commitment Text */}
      <View className="px-6 py-2">
        <Text className="text-body text-lg mb-2">
          • I commit to tracking my habits daily 📱
        </Text>
        <Text className="text-body text-lg mb-2">
          • I promise to prioritize my well-being 💪
        </Text>
        <Text className="text-body text-lg mb-2">
          • I will strive for consistency and progress 🏃
        </Text>
        <Text className="text-body text-lg mb-6">
          • I understand that change takes time and effort 💪
        </Text>
        
        <Text className="text-body text-center mb-4">
          Sign using your finger
        </Text>
      </View>

      {/* Signature Canvas */}
      <View 
        className="mx-6 mb-6 border-2 border-dashed border-gray-200 bg-gray-200 dark:border-gray-800 rounded-xl dark:bg-gray-800"
        style={{ height: 150 }}
        {...panResponder.panHandlers}
      >
        <Svg
          height="100%"
          width="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Render completed paths */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="#374151"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {/* Render current drawing path */}
          {currentPath && (
            <Path
              d={currentPath}
              stroke="#374151"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
        
        {/* Placeholder text when no signature */}
        {paths.length === 0 && !currentPath && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 text-base">
              Your signature here
            </Text>
          </View>
        )}
      </View>

      {/* Clear button - only show if there's a signature */}
      {(paths.length > 0 || currentPath) && (
        <View className="px-6 pb-4">
          <Text 
            className="text-blue-600 text-center text-sm underline"
            onPress={clearSignature}
          >
            Clear signature
          </Text>
        </View>
      )}
    </View>
  );
};

export default SignatureCanvas;