import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';

interface OAuthButtonsProps {
  onGooglePress: () => void;
  onFacebookPress: () => void;
  loading: 'google' | 'facebook' | null;
  disabled?: boolean;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onGooglePress,
  onFacebookPress,
  loading,
  disabled = false
}) => {
  return (
    <View style={styles.container}>
      {/* OR Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialButtonsContainer}>
        {/* Google Sign-In Button */}
        <TouchableOpacity 
          style={[styles.socialButton, disabled && styles.disabledButton]} 
          onPress={onGooglePress} 
          disabled={disabled || loading !== null}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          {loading === 'google' && (
            <ActivityIndicator 
              size="small" 
              color="#234881" 
              style={styles.loadingIndicator} 
            />
          )}
        </TouchableOpacity>

        {/* Facebook Login Button */}
        <TouchableOpacity 
          style={[styles.socialButton, disabled && styles.disabledButton]} 
          onPress={onFacebookPress} 
          disabled={disabled || loading !== null}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/facebook.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          {loading === 'facebook' && (
            <ActivityIndicator 
              size="small" 
              color="#234881" 
              style={styles.loadingIndicator} 
            />
          )}
        </TouchableOpacity>

        {/* Apple Sign-In Button (iOS only) */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            style={[styles.socialButton, styles.appleButton, disabled && styles.disabledButton]} 
            disabled={disabled || loading !== null}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/apple.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Social Login Text */}
      <Text style={styles.socialText}>
        Sign in with your social account for quick access
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
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
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 2,
      },
    }),
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 8,
    top: 10,
  },
  socialText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OAuthButtons;
