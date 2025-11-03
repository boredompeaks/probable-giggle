// Simple placeholder icon component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AppIcon: React.FC = () => (
  <View style={styles.icon}>
    <Text style={styles.text}>💬</Text>
  </View>
);

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
  },
});