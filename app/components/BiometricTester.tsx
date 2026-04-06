import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import biometricAuthService from '../utils/biometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BiometricTester: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    checkStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (user) {
        setUserData({ ...JSON.parse(user), token: token ? 'Present' : 'Missing' });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkStatus = async () => {
    try {
      setLoading(true);
      const debugStatus = await biometricAuthService.debugBiometricStatus();
      setStatus(debugStatus);
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Error', 'Failed to check biometric status');
    } finally {
      setLoading(false);
    }
  };

  const testSetup = async () => {
    try {
      setLoading(true);
      const result = await biometricAuthService.setupBiometric();
      
      if (result.success) {
        Alert.alert('Success', 'Biometric setup completed successfully!');
        await checkStatus(); // Refresh status
      } else {
        Alert.alert('Setup Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Error', 'Setup failed with error');
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    try {
      setLoading(true);
      const result = await biometricAuthService.authenticate();
      
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication successful!');
      } else {
        Alert.alert('Authentication Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed with error');
    } finally {
      setLoading(false);
    }
  };

  const resetConfiguration = async () => {
    try {
      setLoading(true);
      await biometricAuthService.resetBiometricConfig();
      Alert.alert('Success', 'Biometric configuration reset successfully!');
      await checkStatus(); // Refresh status
    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', 'Failed to reset configuration');
    } finally {
      setLoading(false);
    }
  };

  const checkDeviceSupport = async () => {
    try {
      setLoading(true);
      const isSupported = await biometricAuthService.isSupported();
      const isAvailable = await biometricAuthService.isBiometricAvailable();
      
      Alert.alert(
        'Device Support',
        `Hardware Support: ${isSupported ? 'Yes' : 'No'}\nBiometric Available: ${isAvailable ? 'Yes' : 'No'}`
      );
    } catch (error) {
      console.error('Support check error:', error);
      Alert.alert('Error', 'Failed to check device support');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#234881" />
        <Text style={styles.loadingText}>Testing...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🔐 Biometric Authentication Tester</Text>
      
      {/* User Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 User Information</Text>
        {userData ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>ID: {userData._id || userData.id || 'Unknown'}</Text>
            <Text style={styles.infoText}>Email: {userData.email || 'Unknown'}</Text>
            <Text style={styles.infoText}>Token: {userData.token || 'Unknown'}</Text>
          </View>
        ) : (
          <Text style={styles.errorText}>No user data found</Text>
        )}
      </View>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Current Status</Text>
        {status ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Hardware Support: {status.hasHardware ? '✅' : '❌'}</Text>
            <Text style={styles.infoText}>Biometric Enrolled: {status.isEnrolled ? '✅' : '❌'}</Text>
            <Text style={styles.infoText}>Device Supported: {status.isSupported ? '✅' : '❌'}</Text>
            <Text style={styles.infoText}>Biometric Enabled: {status.isEnabled ? '✅' : '❌'}</Text>
            <Text style={styles.infoText}>Device Registered: {status.deviceRegistered ? '✅' : '❌'}</Text>
            {status.config && (
              <>
                <Text style={styles.infoText}>Type: {status.config.type}</Text>
                <Text style={styles.infoText}>Setup Date: {status.config.setupDate}</Text>
                <Text style={styles.infoText}>User ID: {status.config.userId}</Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.errorText}>Status not available</Text>
        )}
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Test Functions</Text>
        
        <TouchableOpacity style={styles.testButton} onPress={checkDeviceSupport}>
          <Text style={styles.buttonText}>Check Device Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testSetup}>
          <Text style={styles.buttonText}>Test Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testAuthentication}>
          <Text style={styles.buttonText}>Test Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={resetConfiguration}>
          <Text style={styles.buttonText}>Reset Configuration</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={checkStatus}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Testing Instructions</Text>
        <Text style={styles.instructionText}>
          1. First check device support to ensure biometrics are available{'\n'}
          2. Test setup to configure biometric authentication{'\n'}
          3. Test authentication to verify the setup works{'\n'}
          4. Use reset if you need to start over{'\n'}
          5. Refresh status to see current state
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#234881',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#234881',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#38a169',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default BiometricTester;


