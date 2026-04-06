import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import biometricAuthService from '../utils/biometricAuth';

const { width, height } = Dimensions.get('window');
const thumb = require('../../assets/images/thumb.png');

const Biometric: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [setupStep, setSetupStep] = useState<'checking' | 'ready' | 'setup' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const [scaleValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));
  const [progressValue] = useState(new Animated.Value(0));
  
  const router = useRouter();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      setIsLoading(true);
      setSetupStep('checking');
      
      // Check if device supports biometrics
      const isSupported = await biometricAuthService.isSupported();
      setIsBiometricSupported(isSupported);
      
      // Always show the ready state with biometric setup option
      // This allows users to attempt setup even if device support is uncertain
      setSetupStep('ready');
      
      // Log the support status for debugging
      console.log('Biometric support check:', {
        isSupported,
        setupStep: 'ready'
      });
      
    } catch (error) {
      console.error('Error checking biometric support:', error);
      // Even if there's an error, show the ready state
      setSetupStep('ready');
      setIsBiometricSupported(false);
    } finally {
      setIsLoading(false);
    }
  };

  const animateSuccess = () => {
    scaleValue.setValue(0);
    fadeValue.setValue(0);
    progressValue.setValue(0);

    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 1700,
        useNativeDriver: false,
      }).start();
    });
  };

  const generateRecoveryCode = (): string => {
    // Generate a simple recovery code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAlreadyEnabled = () => {
    // Navigate to wallet or show success message
    // Don't show popup, just navigate
    router.push('/screens/WalletScreen');
  };

  const handleResetBiometric = async () => {
    try {
      Alert.alert(
        'Reset Biometric',
        'This will remove your current biometric configuration. You\'ll need to set it up again. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            onPress: async () => {
              try {
                await biometricAuthService.resetBiometricConfig();
                // Don't show alarming popup, just refresh the screen
                checkBiometricSupport();
              } catch (error) {
                // Don't show alarming popup, just log the error
                console.error('Reset failed:', error);
              }
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      setIsLoading(true);
      setSetupStep('setup');
      
      // Check if already enabled first
      const isEnabled = await biometricAuthService.isBiometricEnabled();
      if (isEnabled) {
        setSetupStep('ready');
        handleAlreadyEnabled();
        return;
      }
      
      // Setup biometric authentication
      const result = await biometricAuthService.setupBiometric();
      
      if (result.success) {
        // Generate recovery code
        const recoveryCode = generateRecoveryCode();
        setRecoveryCode(recoveryCode);
        setShowRecovery(true);
        
        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        if (result.error === 'Setup cancelled') {
          // User cancelled, go back to ready state
          setSetupStep('ready');
          return;
        } else if (result.error && result.error.includes('already enabled')) {
          // Biometric already enabled, show success instead of error
          setSetupStep('ready');
          handleAlreadyEnabled();
          return;
        } else {
          setSetupStep('error');
          setErrorMessage(result.error || 'Failed to setup biometric authentication. Please try again.');
          
          // Only show alert for actual errors, not for "already enabled"
          if (!result.error?.includes('already enabled')) {
            // Don't show alarming popup, just set the error state
            console.log('Setup failed:', result.error);
          }
        }
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      setSetupStep('error');
      setErrorMessage('An error occurred during setup. Please try again.');
      
      // Don't show alarming popup, just log the error
      console.log('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryCodeConfirm = async () => {
    try {
      // Store recovery code securely
      await biometricAuthService.getBiometricConfig();
      
      // Show success
      setShowRecovery(false);
      setShowSuccess(true);
      animateSuccess();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Auto-proceed after showing success
      setTimeout(() => {
        setShowSuccess(false);
        // Navigate directly to WalletScreen
        router.push('/screens/WalletScreen');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving recovery code:', error);
      Alert.alert('Error', 'Failed to save recovery code. Please try again.');
    }
  };

  const handleNotNow = () => {
    // Navigate to wallet screen
    router.push('/screens/WalletScreen');
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    setShowRecovery(false);
  };

  const getBiometricTypeText = () => {
    if (isBiometricSupported) {
      return biometricAuthService.getBiometricTypeText();
    }
    return 'biometric';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image source={thumb} style={styles.thumb} resizeMode="contain" />
        
        {/* Main Content */}
        {setupStep === 'checking' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#234881" />
            <Text style={styles.loadingText}>Checking biometric support...</Text>
          </View>
        )}

        {setupStep === 'ready' && (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Enable Biometric Authentication</Text>
            <Text style={styles.subtitle}>
              Use your fingerprint or face to sign in securely
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleEnableBiometric}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Setting up...' : 'Enable Biometric'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNotNow}>
              <Text style={styles.notNow}>Not Now</Text>
            </TouchableOpacity>

            {/* Device Support Info */}
            {!isBiometricSupported && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  • Ensure biometrics are enabled in your device settings{'\n'}
                  • Check if your device has fingerprint or face recognition{'\n'}
                  • You can still attempt setup - the system will guide you
                </Text>
              </View>
            )}
          </View>
        )}

        {setupStep === 'setup' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#234881" />
            <Text style={styles.loadingText}>Setting up biometric authentication...</Text>
          </View>
        )}

        {setupStep === 'error' && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Setup Issue</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'There was an issue with the setup. Please try again.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkBiometricSupport}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNotNow}>
              <Text style={styles.notNow}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View 
              style={[
                styles.checkContainer,
                {
                  transform: [{ scale: scaleValue }],
                  opacity: fadeValue,
                }
              ]}
            >
              <Text style={styles.checkEmoji}>✅</Text>
            </Animated.View>
            
            <Text style={styles.successTitle}>Biometric Enabled!</Text>
            <Text style={styles.successSubtitle}>
              You can now use {getBiometricTypeText()} authentication to sign in quickly and securely.
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recovery Code Modal */}
      <Modal
        visible={showRecovery}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Recovery Code</Text>
            <Text style={styles.modalSubtitle}>
              Please save this recovery code in a secure location. You'll need it if you lose access to your device.
            </Text>
            
            <View style={styles.recoveryCodeContainer}>
              <Text style={styles.recoveryCode}>{recoveryCode}</Text>
            </View>
            
            <Text style={styles.recoveryWarning}>
              ⚠️ Keep this code safe and don't share it with anyone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleRecoveryCodeConfirm}
              >
                <Text style={styles.confirmButtonText}>I've Saved It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  thumb: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#222',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#234881',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notNow: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  // Error state styles
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#f56565',
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e53e3e',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#234881',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
        elevation: 5,
      },
    }),
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#234881',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  recoveryCodeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#234881',
    marginBottom: 16,
  },
  recoveryCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#234881',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  recoveryWarning: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#234881',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#27ae60',
  },
  checkEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#234881',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 2,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  infoContainer: {
    backgroundColor: '#f0f9eb',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'left',
  },
});

export default Biometric; 