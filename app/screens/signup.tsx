import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ActivityIndicator,
    Image,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { apiFetch } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useClerk } from '@clerk/clerk-expo';
import { appleSignInService } from '../utils/appleSignInService';
import { facebookSignInService } from '../utils/facebookSignInService';
import ClerkOAuthService from '../../services/ClerkOAuthService';
import { KYCStorage } from '../utils/kycStorage';
import webOAuthService from '../utils/webOAuthService';

WebBrowser.maybeCompleteAuthSession();

const RemitGoSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showUserExistsModal, setShowUserExistsModal] = useState(false);
  const router = useRouter();
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | 'apple' | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const clerk = useClerk();

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
        console.log('� Signing out existing user to force account selection...');
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

  // Social login handler (legacy - keeping for compatibility)
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple', token: string | undefined, userData?: any) => {
    if (!token) {
      setSocialLoading(null);
      setSocialError('No token received.');
      return;
    }
    setSocialLoading(provider);
    setSocialError(null);
    try {
      let requestBody: any = {};
      
      if (provider === 'apple') {
        requestBody = {
          identityToken: token,
          user: userData
        };
      } else if (provider === 'google') {
        // For Google OAuth, send the authorization code and redirect URI
        // The backend will handle the token exchange with Google
        requestBody = {
          code: token,
          redirectUri: Platform.OS === 'web' ? 'https://remitgobackend.vercel.app' : 
                      __DEV__ ? 'exp://192.168.1.7:8081' : 
                      'com.minhal128.Frontend://oauth2redirect'
        };
      } else {
        requestBody = {
          accessToken: token
        };
      }

      const data = await apiFetch(`/auth/${provider}`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (data.success && data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        // Cache KYC status from backend for social login users
        const isVerified = data.user.kycStatus === 'verified' || data.user.isKYCVerified === true;
        await KYCStorage.saveKYCStatus(
          data.user._id,
          isVerified,
          data.user.kycStatus || 'unverified',
          data.user.kycVerifiedAt
        );
        
        setSocialLoading(null);
        
        // For social login (which can be sign-up or sign-in), check if this is a new user
        // If they have isKYCVerified=true, they can skip KYC
        if (isVerified) {
          router.push('/screens/ThumbEnableScreen');
        } else {
          // New social user needs to complete KYC
          router.push('/screens/KYCScreen');
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      setSocialLoading(null);
      // Social login failed
      setSocialError('Social sign in failed. Please try again.');
      }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string; general?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors;
  };

  const handleSignUp = async () => {
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
        }),
      });
      setLoading(false);
      
      // Store user data and token if provided (for future API calls during KYC)
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user || {}));
      }
      
      // After successful signup, redirect to KYC screen immediately
      // This is a new user, so they must complete KYC before proceeding
      router.push('/screens/KYCScreen');
    } catch (err: any) {
      setLoading(false);
      if (err.name === 'AbortError') {
        setErrors({ general: 'The server is taking too long to respond. Please try again later.' });
        return;
      }
      let errorMsg = 'Signup failed. Please try again.';
      try {
        const parsed = JSON.parse(err.message);
        
        // Handle service unavailable errors specifically
        if (parsed.message === 'Service temporarily unavailable' || parsed.error === 'Database connection not established') {
          errorMsg = 'Our service is temporarily unavailable. Please try again in a few moments.';
          // If there's a retryAfter value, use it to provide more specific info
          if (parsed.retryAfter) {
            errorMsg = `Our service is temporarily unavailable. Please try again in ${parsed.retryAfter} seconds.`;
          }
        } else if (parsed.message === 'User already exists') {
          setShowUserExistsModal(true);
          return;
        } else if (parsed.message) {
          errorMsg = parsed.message;
        }
      } catch {
        if (err.message && err.message.includes('User already exists')) {
          setShowUserExistsModal(true);
          return;
        } else if (err.message && (err.message.includes('Service temporarily unavailable') || err.message.includes('Database connection'))) {
          errorMsg = 'Our service is temporarily unavailable. Please try again in a few moments.';
        } else if (err.message) {
          errorMsg = err.message;
        }
      }
      setErrors({ general: errorMsg });
    }
  };

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Create a RemitGo profile</Text>

        {/* Email Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
            placeholderTextColor="#C7C7CD"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Password"
              placeholderTextColor="#C7C7CD"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.passwordHint}>Password must be at least 8 characters</Text>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#C7C7CD"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <Feather
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        </View>

        {/* General Error */}
        {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

        {/* User Exists Modal */}
        <Modal
          visible={showUserExistsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUserExistsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="warning" size={48} color="#FFA726" style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Account Already Exists</Text>
              <Text style={styles.modalMessage}>An account with this email already exists. Please log in instead.</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowUserExistsModal(false);
                  router.push('/screens/signin');
                }}
              >
                <Text style={styles.modalButtonText}>Log in instead</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowUserExistsModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          By using RemitGo, you agree to our{' '}
          <Text style={styles.linkText} onPress={() => handleLink('https://your-esign-disclosure-url.com')}>E-sign Disclosure</Text> and{' '}
          <Text style={styles.linkText} onPress={() => handleLink('https://your-consent-notice-url.com')}>Consent Notice</Text>,{' '}
          <Text style={styles.linkText} onPress={() => handleLink('https://your-privacy-policy-url.com')}>Privacy Policy</Text>, and{' '}
          <Text style={styles.linkText} onPress={() => handleLink('https://your-user-agreement-url.com')}>User Agreement</Text>.
        </Text>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.signUpButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} disabled={socialLoading !== null}>
            <Image
              source={require('../../assets/images/google.png')}
              style={styles.socialIcon}
              resizeMode="cover"
            />
            {socialLoading === 'google' && <ActivityIndicator size="small" color="#234881" style={{ position: 'absolute', right: 8, top: 10 }} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignIn} disabled={socialLoading !== null}>
            <Image
              source={require('../../assets/images/facebook.png')}
              style={styles.socialIcon}
              resizeMode="cover"
            />
            {socialLoading === 'facebook' && <ActivityIndicator size="small" color="#234881" style={{ position: 'absolute', right: 8, top: 10 }} />}
          </TouchableOpacity>

          {/* Apple Sign-In Button */}
          <TouchableOpacity
            style={[styles.appleButton, socialLoading === 'apple' && { opacity: 0.5 }]}
            onPress={handleAppleSignIn}
            disabled={socialLoading !== null}
          >
            <Image
              source={require('../../assets/images/apple.png')}
              style={styles.socialIcon}
              resizeMode="cover"
            />
            {/* <Text style={styles.appleButtonText}>Continue with Apple</Text> */}
            {socialLoading === 'apple' && <ActivityIndicator size="small" color="#234881" style={{ position: 'absolute', right: 8, top: 10 }} />}
          </TouchableOpacity>
        </View>

        {/* Apple Sign-In Restriction Message removed for Android */}

        {socialError ? <Text style={styles.errorText}>{socialError}</Text> : null}
      </ScrollView>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 40,
  },inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#FFFFFF',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 48,
  },passwordHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    height: 48,
    backgroundColor: '#234881',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 16,
  },socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    minHeight: 48,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  appleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -64 }],
    width: 128,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: 320,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelText: {
    color: '#234881',
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  // appleRestrictionText removed
});

export default RemitGoSignup;