// Example React Native Component using Server-Side OAuth
// Save this as: Remit-Frontend/components/GoogleSignInButton.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import ServerOAuthService from '../services/ServerOAuthService';

const GoogleSignInButton = ({ onSignInSuccess, onSignInError }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      console.log('🔐 Starting Google Sign-In...');
      
      const result = await ServerOAuthService.signInWithGoogle();
      
      if (result.success) {
        console.log('✅ Sign-in successful:', result);
        
        // Show success message
        Alert.alert(
          'Success!',
          `Welcome ${result.user.name || result.user.email}!`,
          [{ text: 'OK' }]
        );
        
        // Call success callback
        if (onSignInSuccess) {
          onSignInSuccess(result);
        }
        
      } else {
        console.error('❌ Sign-in failed:', result.error);
        
        // Don't show alert if user cancelled
        if (!result.cancelled) {
          Alert.alert(
            'Sign-In Failed',
            result.error || 'Authentication failed. Please try again.',
            [{ text: 'OK' }]
          );
        }
        
        // Call error callback
        if (onSignInError) {
          onSignInError(result.error);
        }
      }
      
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      
      if (onSignInError) {
        onSignInError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.buttonIcon}>🔐</Text>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;