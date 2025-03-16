import { Text } from 'react-native';
import { useColorScheme } from 'react-native';

export function ThemedText({ style, children, ...props }) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
} 