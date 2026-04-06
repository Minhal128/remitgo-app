import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Theme colors matching the app's design
const THEME_BLUE = '#1e3a8a';
const THEME_BLUE_LIGHT = '#3b82f6';
const BACKGROUND_COLOR = '#f8fafc';
const TEXT_PRIMARY = '#1e293b';
const TEXT_SECONDARY = '#64748b';
const SUCCESS_COLOR = '#059669';

interface KYCPendingScreenProps {
  kycId?: string;
  onVerificationComplete?: (status: 'verified' | 'rejected', reason?: string) => void;
}

const KYCPendingScreen: React.FC<KYCPendingScreenProps> = ({ 
  kycId, 
  onVerificationComplete 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const spinValue = new Animated.Value(0);

  // Animation for the spinner
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Check KYC status periodically
  useEffect(() => {
    if (!kycId) return;

    const checkKYCStatus = async () => {
      try {
        setIsChecking(true);
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`https://remitgobackend.vercel.app/kyc/status/${kycId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.success) {
          if (result.kycStatus === 'verified') {
            // KYC verification completed successfully
            await handleVerificationSuccess();
            return;
          } else if (result.kycStatus === 'rejected') {
            // KYC verification failed
            await handleVerificationFailure(result.reason || 'Verification failed');
            return;
          }
          // Still pending, continue checking
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setIsChecking(false);
        setCheckCount(prev => prev + 1);
      }
    };

    // Check immediately then every 30 seconds
    checkKYCStatus();
    const interval = setInterval(checkKYCStatus, 30000);

    return () => clearInterval(interval);
  },[kycId]);

  const handleVerificationSuccess = async () => {
    try {
      // Update user's KYC status in storage
      await AsyncStorage.setItem('isKYCVerified', 'true');
      await AsyncStorage.setItem('kycVerifiedAt', new Date().toISOString());
      
      // Show success message
      Alert.alert(
        'Verification Successful!',
        'Your KYC verification has been completed successfully. You now have access to all RemitGo features.',
        [
          {
            text: 'Continue',
            onPress: () => {
              onVerificationComplete?.('verified');
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling verification success:', error);
    }
  };

  const handleVerificationFailure = async (reason: string) => {
    try {
      // Show failure message
      Alert.alert(
        'Verification Failed',
        reason || 'We encountered an issue with your KYC verification. Please review your documents and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              onVerificationComplete?.('rejected', reason);
              router.replace('/screens/KYCScreen');
            }
          },
          {
            text: 'Go Home',
            onPress: () => {
              onVerificationComplete?.('rejected', reason);
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling verification failure:', error);
    }
  };

  const handleGoHome = () => {
    Alert.alert(
      'Leave KYC Verification?',
      'Your verification will continue in the background. You\'ll be notified when it\'s complete.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Go Home',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout?',
      'Your KYC verification will continue in the background. You\'ll be notified when it\'s complete.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/screens/signin');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={BACKGROUND_COLOR} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoHome}
        >
          <Feather name="arrow-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Spinner */}
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <Feather name="loader" size={48} color={THEME_BLUE} />
          </Animated.View>
        </View>

        {/* Status Text */}
        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>
          Your KYC verification is pending due to high system load.
        </Text>
        <Text style={styles.description}>
          We'll notify you once the process is complete. This usually takes a few minutes.
        </Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((checkCount * 10), 90)}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {checkCount > 0 ? `Checking status... (${checkCount})` : 'Initializing...'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Continue to App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/screens/KYCScreen')}
          >
            <Text style={styles.secondaryButtonText}>Submit New KYC</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={16} color={TEXT_SECONDARY} />
            <Text style={styles.infoText}>Usually takes 2-5 minutes</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="bell" size={16} color={TEXT_SECONDARY} />
            <Text style={styles.infoText}>You'll receive a notification</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="shield" size={16} color={TEXT_SECONDARY} />
            <Text style={styles.infoText}>Your data is secure</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  spinnerContainer: {
    marginBottom: 32,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_BLUE,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: THEME_BLUE,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: THEME_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_BLUE,
  },
  secondaryButtonText: {
    color: THEME_BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    width: '100%',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});

export default KYCPendingScreen;
