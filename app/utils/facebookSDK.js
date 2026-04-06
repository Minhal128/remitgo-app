import { Platform } from 'react-native';
import { OAUTH_CONFIG } from '../constants/oauth';

// Platform-specific imports
let Settings = null;

if (Platform.OS !== 'web') {
  try {
    const FacebookModule = require('react-native-fbsdk-next');
    Settings = FacebookModule.Settings;
  } catch (error) {
    console.log('Facebook SDK native module not available');
  }
}

// Initialize Facebook SDK
export const initializeFacebookSDK = () => {
  try {
    // Only initialize on mobile platforms
    if (Platform.OS === 'web') {
      console.log('Facebook SDK initialization skipped on web platform');
      return;
    }

    if (!Settings) {
      console.log('Facebook SDK not available, skipping initialization');
      return;
    }

    // Set Facebook App ID
    Settings.setAppID(OAUTH_CONFIG.FACEBOOK.CLIENT_ID);
    
    // Set App Name
    Settings.setAppName(OAUTH_CONFIG.FACEBOOK.APP_NAME);
    
    // Initialize Facebook SDK
    Settings.initializeSDK();
    
    console.log('Facebook SDK initialized successfully');
  } catch (error) {
    console.error('Facebook SDK initialization error:', error);
  }
};

export default initializeFacebookSDK;
