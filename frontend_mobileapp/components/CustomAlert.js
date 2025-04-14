import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useEffect, useRef, useState } from 'react';

const { width } = Dimensions.get('window');

export const showNotification = (type, message, duration = 3000) => {
  global.showAlert(type, message, duration);
};

export default function CustomAlert() {
  const translateY = useRef(new Animated.Value(-100)).current;
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    global.showAlert = (type, message, duration) => {
      setAlertConfig({ type, message });
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.delay(duration),
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start(() => setAlertConfig(null));
    };
  }, []);

  if (!alertConfig) return null;

  const getAlertStyle = () => {
    switch (alertConfig.type) {
      case 'success':
        return { backgroundColor: '#4CAF50' };
      case 'error':
        return { backgroundColor: '#F44336' };
      default:
        return { backgroundColor: '#FF9800' };
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      getAlertStyle(),
      { transform: [{ translateY }] }
    ]}>
      <MaterialIcons 
        name={alertConfig.type === 'success' ? 'check-circle' : 'error'} 
        size={24} 
        color="white" 
      />
      <ThemedText style={styles.message}>{alertConfig.message}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 