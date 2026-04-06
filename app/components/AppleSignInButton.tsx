import * as AppleAuthentication from 'expo-apple-authentication';
import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { appleSignInService } from '../utils/appleSignInService';

interface AppleSignInButtonProps {
  onSignInSuccess?: (user: any) => void;
  onSignInError?: (error: string) => void;
  buttonStyle?: 'black' | 'white' | 'white-outline';
  buttonType?: 'sign-in' | 'continue' | 'sign-up';
  cornerRadius?: number;
  style?: any;
  disabled?: boolean;
}

function AppleSignInButton({
  onSignInSuccess,
  onSignInError,
  buttonStyle = 'black',
  buttonType = 'sign-in',
  cornerRadius = 5,
  style,
  disabled = false
}: AppleSignInButtonProps) {

  const handleAppleSignIn = async () => {
    try {
      console.log('🍎 Starting Apple Sign-In...');
      
      const result = await appleSignInService.signIn();
      
      if (result.success && result.user) {
        console.log('✅ Apple Sign-In successful:', result.user);
        
        if (onSignInSuccess) {
          onSignInSuccess(result.user);
        } else {
          Alert.alert("Sign In Successful!", "Welcome to RemitGo!");
        }
      } else {
        console.error('❌ Apple Sign-In failed:', result.error);
        
        if (onSignInError) {
          onSignInError(result.error || 'Apple sign-in failed');
        } else {
          Alert.alert("Sign In Failed", result.error || "An error occurred. Please try again.");
        }
      }
    } catch (error: any) {
      console.error('❌ Apple Sign-In error:', error);
      
      if (onSignInError) {
        onSignInError(error.message || 'Apple sign-in failed');
      } else {
        Alert.alert("Sign In Failed", "An error occurred. Please try again.");
      }
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, style]}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            buttonType === 'sign-in' 
              ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              : buttonType === 'continue'
              ? AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
              : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
          }
          buttonStyle={
            buttonStyle === 'black'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              : buttonStyle === 'white'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
          }
          cornerRadius={cornerRadius}
          style={[styles.appleButton, disabled && styles.disabledButton]}
          onPress={handleAppleSignIn}
        />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        style={[styles.webButton, style, disabled && styles.disabledButton]}
        onPress={handleAppleSignIn}
        disabled={disabled}
      >
        <Image
          source={require('../../assets/images/apple.png')}
          style={styles.appleIcon}
          resizeMode="contain"
        />
        {/* <Text style={styles.webButtonText}>Continue with Apple</Text> */}
      </TouchableOpacity>
    );
  }

  return null;
}

// Fallback component for non-iOS platforms
export function AppleSignInButtonFallback({
  onPress,
  style,
  disabled = false
}: {
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.fallbackButton, style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={require('../../assets/images/apple.png')}
        style={styles.appleIcon}
        resizeMode="contain"
      />
      <Text style={styles.fallbackText}>Continue with Apple</Text>
    </TouchableOpacity>
  );
}

export default AppleSignInButton;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    width: 250,
    height: 50,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  webButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  fallbackText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});