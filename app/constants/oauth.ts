// OAuth Configuration for Mobile App
// PRODUCTION READY - Uses environment variables for secrets

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
    CALLBACK_URL: 'https://adequate-panther-64.clerk.accounts.dev/v1/oauth_callback',
    
    // Production redirect URLs:
    // Android: com.minhal128.Frontend://oauth2redirect
    // iOS: com.minhal128.Frontend://oauth2redirect
    // Web: http://localhost:8081/auth/callback (development)
    // Web: https://remitgo-frontend.vercel.app/auth/callback (production)
    // Backend: https://remitgobackend.vercel.app
  },
  
  // Facebook OAuth Configuration
  FACEBOOK: {
    CLIENT_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
    APP_SECRET: process.env.EXPO_PUBLIC_FACEBOOK_APP_SECRET || '',
    APP_NAME: 'RemitGo',
    CALLBACK_URL: 'https://remitgobackend.vercel.app/auth/facebook/callback',
    
    // Production redirect URIs:
    // Web: http://localhost:8081/auth/callback (development)
    // Web: https://remitgo-frontend.vercel.app/auth/callback (production)
    // Mobile: com.minhal128.Frontend://oauth2redirect
    // Backend: https://remitgobackend.vercel.app
  },
  
  // Apple Sign-In Configuration (iOS only)
  APPLE: {
    // Apple Sign-In doesn't require client IDs in the frontend
    // It uses the app's bundle identifier automatically
    // Bundle ID: com.minhal128.Frontend
  }
};

// Environment-specific configuration
export const getOAuthConfig = () => {
  if (__DEV__) {
    // Development environment (Expo Go, development builds)
    return {
      GOOGLE: {
        ...OAUTH_CONFIG.GOOGLE,
        REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
        BACKEND_URL: 'https://remitgobackend.vercel.app'
      },
      FACEBOOK: {
        ...OAUTH_CONFIG.FACEBOOK,
        REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
        BACKEND_URL: 'https://remitgobackend.vercel.app'
      }
    };
  } else {
    // Production environment (APK builds)
    return {
      GOOGLE: {
        ...OAUTH_CONFIG.GOOGLE,
        REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
        BACKEND_URL: 'https://remitgobackend.vercel.app'
      },
      FACEBOOK: {
        ...OAUTH_CONFIG.FACEBOOK,
        REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
        BACKEND_URL: 'https://remitgobackend.vercel.app'
      }
    };
  }
};

// OAuth Redirect URIs for different platforms
export const OAUTH_REDIRECT_URIS = {
  ANDROID: 'com.minhal128.Frontend://oauth2redirect',
  IOS: 'com.minhal128.Frontend://oauth2redirect',
  WEB_DEV: 'http://localhost:8081/auth/callback',
  WEB_PROD: 'https://remitgo-frontend.vercel.app/auth/callback',
  BACKEND: 'https://remitgobackend.vercel.app'
};

// OAuth Scopes
export const OAUTH_SCOPES = {
  GOOGLE: ['openid', 'email', 'profile'],
  FACEBOOK: ['email', 'public_profile'],
  APPLE: ['email', 'name']
};

// Default export to prevent Expo Router from treating this as a route
export default function OAuthConstants() {
  return null;
}
