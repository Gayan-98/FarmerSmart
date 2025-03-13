import { BlurView } from 'expo-blur';
import { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors.js';
import { useColorScheme } from '@/hooks/useColorScheme.js';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function useBottomTabOverflow() {
  return Platform.select({
    ios: 88,
    default: 24,
  });
}

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const intensity = useSharedValue(100);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: intensity.value / 100,
  }));

  const onStart = useCallback(() => {
    intensity.value = withSpring(100);
  }, []);

  const onEnd = useCallback(() => {
    intensity.value = withSpring(0);
  }, []);

  if (Platform.OS === 'ios') {
    return (
      <AnimatedBlurView
        intensity={100}
        style={[StyleSheet.absoluteFill, animatedStyle]}
        onStart={onStart}
        onEnd={onEnd}
      />
    );
  }

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      ]}
    />
  );
} 