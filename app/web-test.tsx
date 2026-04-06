import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WebBiometricTester from '../components/WebBiometricTester';

const WebTestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebBiometricTester />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default WebTestScreen;

