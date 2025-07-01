// hooks/useTheme.ts
import { useColorScheme } from 'react-native';

export default function useTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}
