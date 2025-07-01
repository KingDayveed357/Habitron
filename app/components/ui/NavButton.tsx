import { Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { NavigationButtonProps } from '@/interfaces/interfaces';

const NavigationButton: React.FC<NavigationButtonProps> = ({
  path,
  color, 
  text,
  fullWidth,
  textColor,
  className = '', // default empty string if not passed
}) => {
  return (
    <Link href={path} asChild>
      <TouchableOpacity
        className={`mx-5 mb-4 rounded-xl py-5   ${color} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
        activeOpacity={0.7}
      >
        <Text className={`${textColor}  text-center font-semibold`}>{text}</Text>
      </TouchableOpacity>
    </Link>
  );
};

export default NavigationButton;
