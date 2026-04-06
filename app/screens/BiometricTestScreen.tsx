import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import BiometricTester from '../components/BiometricTester';

const BiometricTestScreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <BiometricTester />
    </SafeAreaView>
  );
};

export default BiometricTestScreen;


