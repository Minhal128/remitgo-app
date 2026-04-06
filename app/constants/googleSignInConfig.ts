export const GOOGLE_SIGN_IN_CONFIG = {
  // Web Client ID (from Google Cloud Console - Project: remitgo-9e714)
  WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  
  // Web Client Secret (from Google Cloud Console - Project: remitgo-9e714)
  WEB_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET || '',
  
  // iOS Client ID (from Google Cloud Console - Project: remitgo-9e714)
  // Note: You need to create an iOS client ID in the remitgo-9e714 project
  IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  
  // Android Client ID (from google-services.json - Project: remitgo-9e714)
  ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  
  // Scopes for user data
  SCOPES: ['openid', 'email', 'profile'],
  
  // Offline access for refresh tokens
  OFFLINE_ACCESS: true,
  
  // Force code for refresh token
  FORCE_CODE_FOR_REFRESH_TOKEN: true,
  
  // Hosted domain (optional - restrict to specific domain)
  HOSTED_DOMAIN: undefined,
  
  // Login hint (optional - pre-fill email)
  LOGIN_HINT: undefined,
  
  // Prompt for consent
  PROMPT: 'select_account'
};

export const FACEBOOK_SIGN_IN_CONFIG = {
  // Facebook App ID
  APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
  
  // Facebook Client Token
  CLIENT_TOKEN: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || '',
  
  // App Display Name
  DISPLAY_NAME: 'RemitGo',
  
  // Permissions
  PERMISSIONS: ['public_profile', 'email'],
  
  // Default Audience
  DEFAULT_AUDIENCE: 'everyone'
};

// Default export to prevent Expo Router from treating this as a route
export default function GoogleSignInConfig() {
  return null;
}
