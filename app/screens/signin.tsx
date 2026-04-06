import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { useOAuth, useClerk } from '@clerk/clerk-expo';
import { appleSignInService } from '../utils/appleSignInService';
import { facebookSignInService } from '../utils/facebookSignInService';
import ClerkOAuthService from '../../services/ClerkOAuthService';
import { KYCStorage } from '../utils/kycStorage';
import { apiFetch } from '../utils/api';
import webOAuthService from '../utils/webOAuthService';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | 'apple' | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const router = useRouter();
  const clerk = useClerk();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response || response.success !== true || !response.token || !response.user) {
        const message = response?.message || 'Invalid email or password';
        Alert.alert('Sign in failed', message);
        return;
      }

      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      const isVerified = response.user.kycStatus === 'verified' || response.user.isKYCVerified === true;
      await KYCStorage.saveKYCStatus(
        response.user.id,
        isVerified,
        response.user.kycStatus || 'unverified',
        response.user.kycVerifiedAt
      );

      router.push(isVerified ? '/screens/ThumbEnableScreen' : '/screens/KYCScreen');
    } catch (error: any) {
      const message = error?.message ? String(error.message) : 'Sign in failed';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth using Clerk - with account selection prompt
  const { startOAuthFlow } = useOAuth({ 
    strategy: 'oauth_google'
  });
  
  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    setSocialError(null);
    
    try {
      console.log('🚀 Starting Clerk Google OAuth flow...');
      
      // Sign out first to force account selection
      if (clerk.user) {
        console.log('🔄 Signing out existing user to force account selection...');
        await clerk.signOut();
        // Wait a moment for sign out to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const { createdSessionId, setActive } = await startOAuthFlow();
      
      if (createdSessionId) {
        console.log('✅ Clerk OAuth successful, session created');
        
        // Set the active session
        await setActive!({ session: createdSessionId });
        
        // Give Clerk a moment to update the user state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch the current user from Clerk
        const clerkUser = clerk.user;
        
        console.log('👤 Clerk user:', clerkUser);
        
        if (clerkUser) {
          console.log('📤 Sending user data to backend');
          
          // Authenticate with backend
          const result = await ClerkOAuthService.authenticateWithClerk(clerkUser, createdSessionId);
          
          if (result.success && result.user) {
            console.log('✅ Backend authentication successful');
            
            // Cache KYC status from backend
            const isVerified = result.user.kycStatus === 'verified' || result.user.isKYCVerified === true;
            await KYCStorage.saveKYCStatus(
              result.user.id || result.user._id,
              isVerified,
              result.user.kycStatus || 'unverified',
              result.user.kycVerifiedAt
            );
            
            setSocialLoading(null);
            
            // Navigate based on KYC status
            console.log('🔄 Navigating to:', isVerified ? 'ThumbEnableScreen' : 'KYCScreen');
            if (isVerified) {
              router.replace('/screens/ThumbEnableScreen');
            } else {
              router.replace('/screens/KYCScreen');
            }
          } else {
            setSocialLoading(null);
            setSocialError(result.error || 'Authentication failed');
            Alert.alert('Authentication Error', result.error || 'Failed to authenticate with server');
          }
        } else {
          setSocialLoading(null);
          setSocialError('Failed to retrieve user data from Clerk');
          Alert.alert('Error', 'Failed to retrieve user data. Please try again.');
        }
      } else {
        setSocialLoading(null);
        console.log('ℹ️ OAuth flow cancelled by user');
      }
    } catch (error: any) {
      setSocialLoading(null);
      console.error('❌ Clerk OAuth error:', error);
      setSocialError(error.message || 'Google sign in failed. Please try again.');
      Alert.alert('Sign In Error', error.message || 'Google sign in failed. Please try again.');
    }
  };

  // Facebook OAuth using platform-specific service
  const handleFacebookSignIn = async () => {
    setSocialLoading('facebook');
    setSocialError(null);
    
    try {
      let result;
      if (Platform.OS === 'web') {
        // Use web OAuth service for web platform
        result = await webOAuthService.signInWithFacebook();
      } else {
        // Use native Facebook Sign-In for mobile platforms
        result = await facebookSignInService.signIn();
      }
      
      if (result.success && result.user) {
        // Store user data
        await AsyncStorage.setItem('token', 'facebook-token');
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        
        // Cache KYC status from backend for social login users
        const isVerified = result.user.kycStatus === 'verified' || result.user.isKYCVerified === true;
        await KYCStorage.saveKYCStatus(
          result.user.id,
          isVerified,
          result.user.kycStatus || 'unverified',
          result.user.kycVerifiedAt
        );
        
        setSocialLoading(null);
        
        // For social login (which can be sign-up or sign-in), check if this is a new user
        if (isVerified) {
          router.push('/screens/ThumbEnableScreen');
        } else {
          // New social user needs to complete KYC
          router.push('/screens/KYCScreen');
        }
      } else {
        setSocialLoading(null);
        setSocialError(result.error || 'Facebook sign in failed');
      }
    } catch (error) {
      setSocialLoading(null);
      setSocialError('Facebook sign in failed. Please try again.');
    }
  };

  // Apple OAuth using platform-specific service
  const handleAppleSignIn = async () => {
    // Check if running on Android
    if (Platform.OS === 'android') {
      Alert.alert(
        'Apple Sign-In Not Available',
        'Apple Sign-In is only available on iOS and web devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSocialLoading('apple');
    setSocialError(null);
    
    try {
      const result = await appleSignInService.signIn();
      
      if (result.success && result.user) {
        // Store user data
        await AsyncStorage.setItem('token', 'apple-token');
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        
        // Cache KYC status from backend for social login users
        const isVerified = result.user.kycStatus === 'verified';
        await KYCStorage.saveKYCStatus(
          result.user.id,
          isVerified,
          (result.user.kycStatus as 'verified' | 'unverified' | 'pending' | 'rejected') || 'unverified',
          undefined
        );
        
        setSocialLoading(null);
        
        // For social login (which can be sign-up or sign-in), check if this is a new user
        if (isVerified) {
          router.push('/screens/ThumbEnableScreen');
        } else {
          // New social user needs to complete KYC
          router.push('/screens/KYCScreen');
        }
      } else {
        setSocialLoading(null);
        setSocialError(result.error || 'Apple sign in failed');
      }
    } catch (error: any) {
      setSocialLoading(null);
      setSocialError(error.message || 'Apple sign in failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setShowModal(true);
  };

  const handleSignUp = () => {
    Alert.alert('Sign Up', 'Navigate to sign up screen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image 
              source={require('../../assets/images/logo.jpg')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.remitgoText}>REMITGO</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sign in to RemitGo profile</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#C7C7CD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordRequirement}>
              Password must be at least 8 characters
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By using RemitGo, you agree to our{' '}
            <Text style={styles.linkText}>E-sign Disclosure and Consent Notice</Text>,{' '}
            <Text style={styles.linkText}>Privacy Policy</Text> and{' '}
            <Text style={styles.linkText}>User Agreement</Text>.
          </Text>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign In Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, socialLoading !== null && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={socialLoading !== null}
            >
              <Image 
                source={require('../../assets/images/google.png')} 
                style={styles.socialIcon}
                resizeMode="contain"
              />
              {socialLoading === 'google' && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, socialLoading !== null && styles.disabledButton]}
              onPress={handleFacebookSignIn}
              disabled={socialLoading !== null}
            >
              <Image 
                source={require('../../assets/images/facebook.png')} 
                style={styles.socialIcon}
                resizeMode="contain"
              />
              {socialLoading === 'facebook' && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, socialLoading !== null && styles.disabledButton]}
              onPress={handleAppleSignIn}
              disabled={socialLoading !== null}
            >
              <Image 
                source={require('../../assets/images/apple.png')} 
                style={styles.socialIcon}
                resizeMode="contain"
              />
              {socialLoading === 'apple' && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Apple Sign-In Restriction Message removed for Android */}

          {/* Social Error Message */}
          {socialError && (
            <Text style={styles.socialErrorText}>{socialError}</Text>
          )}

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalText}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowModal(false);
                  Alert.alert('Success', 'Password reset email sent!');
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>
                  Send Reset Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    alignItems: 'center',
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  remitgoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  passwordRequirement: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  signInButton: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  linkText: {
    color: '#1e40af',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
  },
  // appleRestrictionText removed
  socialErrorText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonPrimary: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonPrimaryText: {
    color: '#fff',
  },
});

export default SignInScreen;