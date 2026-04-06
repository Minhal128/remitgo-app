import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import biometricAuthService from '../utils/biometricAuth';

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onFallback: () => void;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onCancel,
  onFallback,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('biometric');

  useEffect(() => {
    if (visible) {
      getBiometricType();
      // Auto-trigger authentication after a short delay
      const timer = setTimeout(() => {
        handleAuthenticate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getBiometricType = async () => {
    try {
      const config = await biometricAuthService.getBiometricConfig();
      if (config) {
        setBiometricType(config.type);
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
    }
  };

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;

    try {
      setIsAuthenticating(true);
      
      const result = await biometricAuthService.authenticate();
      
      if (result.success) {
        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Call success callback
        onSuccess();
      } else {
        if (result.error === 'Authentication cancelled') {
          // User cancelled, do nothing
          return;
        } else {
          // Authentication failed
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            'Authentication Failed',
            'Biometric authentication failed. Please try again or use your passcode.',
            [
              { text: 'Try Again', onPress: () => handleAuthenticate() },
              { text: 'Use Passcode', onPress: onFallback },
              { text: 'Cancel', onPress: onCancel },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Authentication Error',
        'An error occurred during authentication. Please try again.',
        [
          { text: 'Try Again', onPress: () => handleAuthenticate() },
          { text: 'Use Passcode', onPress: onFallback },
          { text: 'Cancel', onPress: onCancel },
        ]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'fingerprint':
        return '👆';
      case 'face':
        return '👁️';
      case 'iris':
        return '👁️';
      default:
        return '🔐';
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case 'fingerprint':
        return 'Place your finger on the sensor';
      case 'face':
        return 'Look at the camera';
      case 'iris':
        return 'Look at the iris scanner';
      default:
        return 'Authenticate with biometrics';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getBiometricIcon()}</Text>
          </View>
          
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Please authenticate to access your account
          </Text>
          
          <Text style={styles.instruction}>
            {getBiometricText()}
          </Text>
          
          {isAuthenticating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#234881" />
              <Text style={styles.loadingText}>Authenticating...</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={onFallback}
              disabled={isAuthenticating}
            >
              <Text style={styles.fallbackButtonText}>Use Passcode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isAuthenticating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#234881',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#234881',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  fallbackButton: {
    backgroundColor: '#234881',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BiometricPrompt;
