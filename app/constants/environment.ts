import { Platform } from 'react-native';

// Environment configuration for different build types
export const ENV = {
  DEVELOPMENT: {
    // For mobile testing, use your local IP address
    // Change this to your computer's local IP (shown when you start the backend server)
    BACKEND_URL: 'http://10.48.15.21:5000',
    GOOGLE_REDIRECT_URI: 'http://localhost:8081',
    FACEBOOK_REDIRECT_URI: 'http://localhost:8081',
    OAUTH_ENDPOINTS: {
      GOOGLE: '/auth/google',
      FACEBOOK: '/auth/facebook'
    }
  },
  PRODUCTION: {
    BACKEND_URL: 'https://remitgobackend.vercel.app',
    GOOGLE_REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
    FACEBOOK_REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
    OAUTH_ENDPOINTS: {
      GOOGLE: '/auth/google/code',
      FACEBOOK: '/auth/facebook/code'
    }
  }
};

// Helper functions
export const getEnvironmentConfig = () => {
  return __DEV__ ? ENV.DEVELOPMENT : ENV.PRODUCTION;
};

export const getBackendUrl = () => {
  return getEnvironmentConfig().BACKEND_URL;
};

export const getOAuthEndpoints = () => {
  return getEnvironmentConfig().OAUTH_ENDPOINTS;
};

export const isDevelopment = () => {
  return __DEV__;
};

export const isProduction = () => {
  return !__DEV__;
};

export const isWeb = () => {
  return Platform.OS === 'web';
};

export const isMobile = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Default export to prevent Expo Router from treating this as a route
export default function EnvironmentConstants() {
  return null;
}
