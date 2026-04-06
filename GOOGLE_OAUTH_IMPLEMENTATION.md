# Google OAuth Implementation for RemitGo

This document outlines the complete Google OAuth implementation for the RemitGo mobile application.

## 🚀 Overview

The Google OAuth implementation provides secure authentication for users through Google accounts, with support for both native Google Sign-In and web-based OAuth flows.

## 📱 Configuration

### App Configuration (`app.json`)

```json
{
  "expo": {
    "scheme": "com.minhal128.Frontend",
    "android": {
      "package": "com.minhal128.Frontend"
    },
    "ios": {
      "bundleIdentifier": "com.minhal128.Frontend"
    },
    "plugins": [
      "expo-google-sign-in"
    ],
    "extra": {
      "googleSignIn": {
        "androidClientId": "228960495612-aa7g0vk5l4s2vc6navoa1ll2qhsf9hpm.apps.googleusercontent.com"
      }
    }
  }
}
```

### OAuth Constants (`app/constants/oauth.ts`)

```typescript
export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: '228960495612-aa7g0vk5l4s2vc6navoa1ll2qhsf9hpm.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: '228960495612-aa7g0vk5l4s2vc6navoa1ll2qhsf9hpm.apps.googleusercontent.com',
    REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
    BACKEND_URL: 'https://remitgobackend.vercel.app'
  }
};
```

## 🔑 Google Cloud Console Setup

### 1. OAuth 2.0 Client IDs

- **Android Client ID**: `228960495612-aa7g0vk5l4s2vc6navoa1ll2qhsf9hpm.apps.googleusercontent.com`
- **Package Name**: `com.minhal128.Frontend`
- **SHA-1 Certificate Fingerprint**: [Add your app's SHA-1 fingerprint]

### 2. Authorized Redirect URIs

Add these redirect URIs to your Google Cloud Console:

```
com.minhal128.Frontend://oauth2redirect
https://remitgobackend.vercel.app/auth/google/callback
```

### 3. Scopes

The following OAuth scopes are requested:
- `openid` - OpenID Connect authentication
- `email` - User's email address
- `profile` - User's basic profile information

## 🏗️ Architecture

### Frontend OAuth Service

The OAuth service (`app/utils/oauthService.ts`) implements a hybrid approach:

1. **Native Google Sign-In** (Primary)
   - Uses `expo-google-sign-in` for native Android/iOS integration
   - Provides better user experience and security
   - Falls back to web-based OAuth if native fails

2. **Web-based OAuth** (Fallback)
   - Uses `expo-web-browser` for web-based authentication
   - Handles authorization code flow
   - Compatible with all platforms

### Backend Integration

The backend provides multiple OAuth endpoints:

- **`POST /auth/google/mobile`** - Mobile OAuth with access token
- **`POST /auth/google`** - Web OAuth with authorization code
- **`POST /auth/google/code`** - Mobile OAuth with authorization code

## 📋 Implementation Details

### 1. Native Google Sign-In

```typescript
// Initialize Google Sign-In
await Google.initAsync({
  clientId: OAUTH_CONFIG.GOOGLE.ANDROID_CLIENT_ID,
  scopes: ['profile', 'email'],
});

// Sign in
const result = await Google.signInAsync();
if (result.type === 'success') {
  const { accessToken } = result;
  // Send to backend for verification
}
```

### 2. Web-based OAuth

```typescript
// Build OAuth URL
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent('openid email profile')}&` +
  `access_type=offline&` +
  `prompt=consent`;

// Open OAuth session
const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);
```

### 3. Backend Token Verification

```typescript
// Verify Google access token
const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
const userData = await response.json();

// Create or update user
let user = await User.findOne({ googleId: userData.id });
if (!user) {
  user = new User({
    googleId: userData.id,
    email: userData.email,
    firstName: userData.given_name,
    lastName: userData.family_name,
    profilePicture: userData.picture,
    socialProvider: 'google'
  });
}
```

## 🚦 CORS Configuration

The backend CORS configuration includes the OAuth redirect URI:

```javascript
const allowedOrigins = [
  'https://remitgo-frontend.vercel.app',
  'https://remitgobackend.vercel.app',
  'com.minhal128.Frontend://oauth2redirect'
];
```

## 📱 Usage in Components

### Sign In Component

```typescript
import oauthService from '../utils/oauthService';

const handleGoogleSignIn = async () => {
  setSocialLoading('google');
  setSocialError(null);
  
  try {
    const result = await oauthService.signInWithGoogle();
    
    if (result.success && result.token && result.user) {
      // Store user data
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      
      // Navigate based on KYC status
      if (result.user.kycStatus === 'verified') {
        router.push('/screens/ThumbEnableScreen');
      } else {
        router.push('/screens/KYCScreen');
      }
    } else {
      setSocialError(result.error || 'Google sign in failed');
    }
  } catch (error) {
    setSocialError('Google sign in failed. Please try again.');
  } finally {
    setSocialLoading(null);
  }
};
```

## 🧪 Testing

### Test Script

Run the test script to verify the configuration:

```bash
cd Remit-Frontend
node test-google-oauth.js
```

### Manual Testing

1. **Development Build**
   - Test with Expo Go or development build
   - Verify OAuth flow works correctly

2. **Production Build**
   - Build APK/IPA with `expo build`
   - Test on physical device
   - Verify native Google Sign-In works

## 🔒 Security Considerations

1. **Client Secret**: Never expose client secrets in mobile apps
2. **Token Validation**: Always verify tokens on the backend
3. **HTTPS**: Use HTTPS for all OAuth communications
4. **State Parameter**: Consider adding state parameter for CSRF protection

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Verify redirect URI in Google Cloud Console
   - Check app scheme configuration

2. **"Client ID not found"**
   - Verify client ID in OAuth constants
   - Check Google Cloud Console configuration

3. **"CORS error"**
   - Verify redirect URI is in backend CORS allowed origins
   - Check backend CORS configuration

4. **"Native sign in failed"**
   - Verify SHA-1 fingerprint in Google Cloud Console
   - Check package name configuration

### Debug Steps

1. Check console logs for OAuth errors
2. Verify network requests in browser dev tools
3. Test backend endpoints independently
4. Verify Google Cloud Console configuration

## 📚 Dependencies

### Required Packages

```json
{
  "expo-google-sign-in": "~12.0.0",
  "expo-auth-session": "~6.2.1",
  "expo-web-browser": "~14.2.0"
}
```

### Installation

```bash
expo install expo-google-sign-in
```

## 🚀 Deployment

### Vercel Backend

The backend is configured for Vercel deployment with:
- CORS configuration for mobile app redirects
- Environment variables for Google OAuth
- Proper OAuth endpoint handling

### Mobile App

1. Update `app.json` with correct configuration
2. Build production APK/IPA
3. Test OAuth flow on production build
4. Verify backend integration

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review console logs and error messages
3. Verify Google Cloud Console configuration
4. Test with the provided test script

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Status**: ✅ Implementation Complete


