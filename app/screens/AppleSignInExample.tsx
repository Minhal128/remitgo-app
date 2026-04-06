import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppleSignInButton, { AppleSignInButtonFallback } from '../components/AppleSignInButton';
import { appleSignInService } from '../utils/appleSignInService';

export default function AppleSignInExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignInSuccess = (userData: any) => {
    console.log('✅ Sign-in successful:', userData);
    setUser(userData);
    setIsSignedIn(true);
    setIsLoading(false);
  };

  const handleSignInError = (error: string) => {
    console.error('❌ Sign-in error:', error);
    setIsLoading(false);
    Alert.alert('Sign In Failed', error);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const success = await appleSignInService.signOut();
      
      if (success) {
        setUser(null);
        setIsSignedIn(false);
        Alert.alert('Success', 'Signed out successfully');
      } else {
        Alert.alert('Error', 'Failed to sign out');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSignInStatus = async () => {
    try {
      setIsLoading(true);
      const signedIn = await appleSignInService.isSignedIn();
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        const result = await appleSignInService.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } else {
        setUser(null);
      }
      
      Alert.alert('Status', `Signed in: ${signedIn ? 'Yes' : 'No'}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await appleSignInService.signIn();
      if (result.success && result.user) {
        handleSignInSuccess(result.user);
      } else {
        handleSignInError(result.error || 'Apple sign-in failed');
      }
    } catch (error: any) {
      handleSignInError(error.message || 'Apple sign-in failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Apple Sign-In Example</Text>
        
        <Text style={styles.subtitle}>
          Platform: {Platform.OS} {Platform.OS === 'ios' ? '🍎' : '📱'}
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {isSignedIn ? '✅ Signed In' : '❌ Not Signed In'}
          </Text>
          
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userInfoTitle}>User Information:</Text>
              <Text style={styles.userInfoText}>ID: {user.id}</Text>
              <Text style={styles.userInfoText}>Email: {user.email || 'Not provided'}</Text>
              <Text style={styles.userInfoText}>Name: {user.firstName} {user.lastName}</Text>
              <Text style={styles.userInfoText}>Provider: {user.socialProvider}</Text>
              <Text style={styles.userInfoText}>KYC Status: {user.kycStatus}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {Platform.OS === 'ios' ? (
            <AppleSignInButton
              onSignInSuccess={handleSignInSuccess}
              onSignInError={handleSignInError}
              buttonStyle="black"
              buttonType="sign-in"
              disabled={isLoading}
            />
          ) : (
            <AppleSignInButtonFallback
              onPress={handleAppleSignIn}
              disabled={isLoading}
            />
          )}
        </View>

        <View style={styles.actionButtons}>
          <AppleSignInButton
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
            buttonStyle="white-outline"
            buttonType="continue"
            disabled={isLoading}
            style={styles.actionButton}
          />
          
          <AppleSignInButton
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
            buttonStyle="white"
            buttonType="sign-up"
            disabled={isLoading}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.utilityButtons}>
          <AppleSignInButton
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
            buttonStyle="black"
            buttonType="sign-in"
            disabled={isLoading}
            style={styles.utilityButton}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Implementation Notes:</Text>
          <Text style={styles.infoText}>
            • Apple Sign-In is only available on iOS devices
          </Text>
          <Text style={styles.infoText}>
            • Firebase authentication is integrated for both web and mobile
          </Text>
          <Text style={styles.infoText}>
            • User data is stored locally using AsyncStorage
          </Text>
          <Text style={styles.infoText}>
            • Supports different button styles and types
          </Text>
          <Text style={styles.infoText}>
            • Includes fallback component for non-iOS platforms
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
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
    marginBottom: 20,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  userInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  userInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  userInfoText: {
    fontSize: 12,
    marginBottom: 2,
    color: '#666',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    width: 120,
    height: 40,
  },
  utilityButtons: {
    alignItems: 'center',
    marginBottom: 20,
  },
  utilityButton: {
    width: 200,
    height: 45,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});
