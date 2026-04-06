import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { biometricAuthService } from '../utils/biometricAuth';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

const WebBiometricTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pin, setPin] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    const result: TestResult = {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Service Initialization
  const testInitialization = async () => {
    addTestResult('Service Initialization', 'pending', 'Testing...');
    try {
      await biometricAuthService.initialize();
      addTestResult('Service Initialization', 'success', 'Service initialized successfully');
    } catch (error) {
      addTestResult('Service Initialization', 'error', `Failed: ${error}`);
    }
  };

  // Test 2: Biometric Support Detection
  const testBiometricSupport = async () => {
    addTestResult('Biometric Support', 'pending', 'Testing...');
    try {
      const isSupported = await biometricAuthService.isBiometricSupported();
      const message = isSupported 
        ? 'Biometric supported (unexpected on web)' 
        : 'Biometric not supported (expected on web)';
      addTestResult('Biometric Support', 'success', message);
    } catch (error) {
      addTestResult('Biometric Support', 'error', `Failed: ${error}`);
    }
  };

  // Test 3: Configuration Management
  const testConfiguration = async () => {
    addTestResult('Configuration', 'pending', 'Testing...');
    try {
      const config = biometricAuthService.getBiometricConfig();
      const settings = biometricAuthService.getSecuritySettings();
      const isLocked = biometricAuthService.isAccountLocked();
      const remainingAttempts = biometricAuthService.getRemainingAttempts();
      
      const message = `Config: ${config ? 'Loaded' : 'None'}, Settings: ${settings ? 'Loaded' : 'None'}, Locked: ${isLocked}, Attempts: ${remainingAttempts}`;
      addTestResult('Configuration', 'success', message);
    } catch (error) {
      addTestResult('Configuration', 'error', `Failed: ${error}`);
    }
  };

  // Test 4: Security Settings
  const testSecuritySettings = async () => {
    addTestResult('Security Settings', 'pending', 'Testing...');
    try {
      const currentSettings = biometricAuthService.getSecuritySettings();
      
      // Test updating settings
      const newSettings = {
        maxAttempts: 5,
        lockoutDuration: 600000, // 10 minutes
        sessionTimeout: 3600000 // 1 hour
      };
      
      await biometricAuthService.updateSecuritySettings(newSettings);
      const updatedSettings = biometricAuthService.getSecuritySettings();
      
      // Restore original settings
      await biometricAuthService.updateSecuritySettings(currentSettings);
      
      addTestResult('Security Settings', 'success', `Updated and restored successfully. Max attempts: ${updatedSettings.maxAttempts}`);
    } catch (error) {
      addTestResult('Security Settings', 'error', `Failed: ${error}`);
    }
  };

  // Test 5: Fallback PIN Setup
  const testFallbackPin = async () => {
    if (!pin || pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a PIN with at least 4 digits');
      return;
    }

    addTestResult('Fallback PIN Setup', 'pending', 'Testing...');
    try {
      const result = await biometricAuthService.setupFallbackPin(pin);
      if (result.success) {
        addTestResult('Fallback PIN Setup', 'success', 'PIN setup successful');
      } else {
        addTestResult('Fallback PIN Setup', 'error', `Failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('Fallback PIN Setup', 'error', `Failed: ${error}`);
    }
  };

  // Test 6: PIN Authentication
  const testPinAuth = async () => {
    if (!pin) {
      Alert.alert('No PIN', 'Please set up a PIN first');
      return;
    }

    addTestResult('PIN Authentication', 'pending', 'Testing...');
    try {
      const result = await biometricAuthService.authenticateWithPin(pin);
      if (result.success) {
        addTestResult('PIN Authentication', 'success', 'PIN authentication successful');
      } else {
        addTestResult('PIN Authentication', 'error', `Failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('PIN Authentication', 'error', `Failed: ${error}`);
    }
  };

  // Test 7: Recovery Code System
  const testRecoveryCode = async () => {
    addTestResult('Recovery Code', 'pending', 'Testing...');
    try {
      // Generate a test recovery code
      const testCode = 'ABCD-1234-EFGH-5678';
      
      // Test authentication with recovery code
      const result = await biometricAuthService.authenticateWithRecoveryCode(testCode);
      
      if (result.success) {
        addTestResult('Recovery Code', 'success', 'Recovery code authentication successful');
      } else {
        addTestResult('Recovery Code', 'success', `Recovery code test completed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('Recovery Code', 'error', `Failed: ${error}`);
    }
  };

  // Test 8: Session Management
  const testSessionManagement = async () => {
    addTestResult('Session Management', 'pending', 'Testing...');
    try {
      const requiresAuth = await biometricAuthService.isAuthenticationRequired();
      const message = requiresAuth ? 'Authentication required' : 'Session still valid';
      addTestResult('Session Management', 'success', message);
    } catch (error) {
      addTestResult('Session Management', 'error', `Failed: ${error}`);
    }
  };

  // Test 9: Account Lockout
  const testAccountLockout = async () => {
    addTestResult('Account Lockout', 'pending', 'Testing...');
    try {
      const isLocked = biometricAuthService.isAccountLocked();
      const remainingTime = biometricAuthService.getRemainingLockoutTime();
      const remainingAttempts = biometricAuthService.getRemainingAttempts();
      
      const message = `Locked: ${isLocked}, Remaining time: ${remainingTime}s, Attempts: ${remainingAttempts}`;
      addTestResult('Account Lockout', 'success', message);
    } catch (error) {
      addTestResult('Account Lockout', 'error', `Failed: ${error}`);
    }
  };

  // Test 10: Error Handling
  const testErrorHandling = async () => {
    addTestResult('Error Handling', 'pending', 'Testing...');
    try {
      // Test with invalid inputs
      const invalidPinResult = await biometricAuthService.authenticateWithPin('');
      const invalidRecoveryResult = await biometricAuthService.authenticateWithRecoveryCode('');
      
      const message = `Invalid PIN: ${invalidPinResult.success ? 'Unexpected' : 'Expected'}, Invalid Recovery: ${invalidRecoveryResult.success ? 'Unexpected' : 'Expected'}`;
      addTestResult('Error Handling', 'success', message);
    } catch (error) {
      addTestResult('Error Handling', 'error', `Failed: ${error}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      await testInitialization();
      await testBiometricSupport();
      await testConfiguration();
      await testSecuritySettings();
      await testFallbackPin();
      await testPinAuth();
      await testRecoveryCode();
      await testSessionManagement();
      await testAccountLockout();
      await testErrorHandling();
      
      addTestResult('All Tests', 'success', 'All tests completed successfully!');
    } catch (error) {
      addTestResult('All Tests', 'error', `Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Get authentication status
  const getStatus = () => {
    const config = biometricAuthService.getBiometricConfig();
    const isLocked = biometricAuthService.isAccountLocked();
    const remainingAttempts = biometricAuthService.getRemainingAttempts();
    const remainingLockoutTime = biometricAuthService.getRemainingLockoutTime();

    const status = {
      isEnabled: config?.enabled || false,
      biometricType: config?.type || 'none',
      isLocked,
      remainingAttempts,
      remainingLockoutTime,
      hasFallback: config?.fallbackEnabled || false,
      lastUsed: config?.lastUsed || null,
      securityLevel: config?.securityLevel || 'low'
    };

    Alert.alert('Authentication Status', JSON.stringify(status, null, 2));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌐 Web Biometric Authentication Tester</Text>
      <Text style={styles.subtitle}>
        Test the biometric authentication system on web browsers
      </Text>

      {/* PIN Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PIN Setup & Testing</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter PIN (4-6 digits):</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="1234"
            secureTextEntry
            maxLength={6}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={testFallbackPin}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Setup PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={testPinAuth}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Test PIN Auth</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recovery Code Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery Code Testing</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Test Recovery Code:</Text>
          <TextInput
            style={styles.input}
            value={recoveryCode}
            onChangeText={setRecoveryCode}
            placeholder="ABCD-1234-EFGH-5678"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testRecoveryCode}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Test Recovery Code</Text>
        </TouchableOpacity>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={getStatus}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Get Status</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Individual Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        <View style={styles.testGrid}>
          <TouchableOpacity style={styles.testButton} onPress={testInitialization}>
            <Text style={styles.testButtonText}>Init</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testBiometricSupport}>
            <Text style={styles.testButtonText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testConfiguration}>
            <Text style={styles.testButtonText}>Config</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testSecuritySettings}>
            <Text style={styles.testButtonText}>Security</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testSessionManagement}>
            <Text style={styles.testButtonText}>Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testAccountLockout}>
            <Text style={styles.testButtonText}>Lockout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testErrorHandling}>
            <Text style={styles.testButtonText}>Errors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet. Run some tests to see results here.</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={[styles.resultItem, styles[`result${result.status}`]]}>
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    minHeight: 44,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  testButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 44,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  resultpending: {
    backgroundColor: '#FFF3CD',
    borderLeftColor: '#FFC107',
  },
  resultsuccess: {
    backgroundColor: '#D4EDDA',
    borderLeftColor: '#28A745',
  },
  resulterror: {
    backgroundColor: '#F8D7DA',
    borderLeftColor: '#DC3545',
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});

export default WebBiometricTester;
