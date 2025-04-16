import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the PestMap component dynamically based on platform
// For web, use the regular import; for native, use the .native version
const PestMap = Platform.select({
  web: () => require('../../src/components/PestMap').default,
  default: () => require('../../src/components/PestMap.native').default,
})();

export default function PestMapScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PestMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 