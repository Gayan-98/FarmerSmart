import React from 'react';
import { View, StyleSheet } from 'react-native';
import PestMap from '../../src/components/PestMap';

export default function PestMapScreen() {
  return (
    <View style={styles.container}>
      <PestMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 