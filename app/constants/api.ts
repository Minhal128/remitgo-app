// API configuration with environment support
import { getEnvironmentConfig } from './environment';

const getApiBaseUrl = () => {
  try {
    // Check for environment variable first
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // Use environment-specific configuration
    const envConfig = getEnvironmentConfig();
    return envConfig.BACKEND_URL;
  } catch (error) {
    console.warn('Error getting API base URL:', error);
    // Fallback to production backend for development
    return __DEV__ ? 'https://remitgobackend.vercel.app' : 'https://remitgobackend.vercel.app';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Get OAuth endpoints for current environment
export const getOAuthEndpoints = () => {
  const envConfig = getEnvironmentConfig();
  return envConfig.OAUTH_ENDPOINTS;
};

// Default export to prevent Expo Router from treating this as a route
export default function ApiConstants() {
  return null;
}
