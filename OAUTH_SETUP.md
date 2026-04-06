# OAuth Setup Guide for RemitGo

This guide will help you set up OAuth authentication with Google and Facebook for your React Native app.

## Prerequisites

1. **Google Cloud Console Account**: For Google OAuth
2. **Facebook Developer Account**: For Facebook Login
3. **Expo CLI**: For building and running the app

## 🔧 Installation

The required packages are already installed:
- `@react-native-google-signin/google-signin@latest`
- `react-native-fbsdk-next`

## 📱 Google OAuth Setup

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google Sign-In API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

Create **3 OAuth Client IDs**:

#### Android Client ID
- **Application type**: Android
- **Package name**: `com.minhal128.Frontend`
- **SHA-1 certificate fingerprint**: Get from your keystore

#### iOS Client ID  
- **Application type**: iOS
- **Bundle ID**: `com.minhal128.Frontend`

#### Web Client ID
- **Application type**: Web application
- **Authorized redirect URIs**: 
  - `https://remitgobackend.vercel.app/auth/google/callback`
  - `com.minhal128.Frontend://oauth2redirect`

### 2. Update app.json

Replace `YOUR_GOOGLE_CLIENT_ID_HERE` in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID"
        }
      ]
    ]
  }
}
```

**Note**: The `iosUrlScheme` should be your iOS Client ID reversed. For example:
- Client ID: `123456-abc.apps.googleusercontent.com`
- URL Scheme: `com.googleusercontent.apps.123456-abc`

## 📘 Facebook OAuth Setup

### 1. Facebook Developer Console

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add **Facebook Login** product
4. Configure the following settings:

#### Valid OAuth Redirect URIs
```
https://remitgobackend.vercel.app/auth/facebook/callback
com.minhal128.Frontend://oauth2redirect
```

#### Android Settings
- **Package Name**: `com.minhal128.Frontend`
- **Class Name**: `com.minhal128.Frontend.MainActivity`
- **Key Hashes**: Generate from your keystore

#### iOS Settings
- **Bundle ID**: `com.minhal128.Frontend`

### 2. Update Configuration

Update `app\constants\oauth.ts`:
```typescript
FACEBOOK: {
  CLIENT_ID: 'YOUR_FACEBOOK_APP_ID', // Replace with your actual App ID
  // ... rest of config
}
```

## 🔐 Environment Variables

Create `.env` file in the root directory:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env
```

Update the values in `.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

## 🏗️ Building the App

### Development Build

```bash
# Install dependencies
npm install

# Create development build
npx expo prebuild --clean

# Run on Android
npx expo run:android

# Run on iOS  
npx expo run:ios
```

### Production Build

```bash
# Build APK
eas build --platform android --profile production

# Build IOS
eas build --platform ios --profile production
```

## 🧪 Testing OAuth

### Test Google Sign-In
1. Tap the Google sign-in button
2. Complete Google authentication
3. Verify user data is received and stored
4. Check navigation to appropriate screen

### Test Facebook Login
1. Tap the Facebook sign-in button  
2. Complete Facebook authentication
3. Verify user data is received and stored
4. Check navigation to appropriate screen

## 🔧 Backend Integration

Your backend already has the following endpoints configured:
- `POST /auth/google-mobile` - For Google access token authentication
- `POST /auth/facebook-mobile` - For Facebook access token authentication
- `POST /auth/google-mobile-code` - For Google authorization code flow
- `POST /auth/facebook-mobile-code` - For Facebook authorization code flow

## 📱 Platform-Specific Notes

### Android
- Ensure your SHA-1 fingerprint is added to Google Console
- Add Facebook key hash to Facebook Console
- Test on physical device for best results

### iOS
- Ensure Bundle ID matches in all configurations
- Test on physical device for production builds
- Apple Sign-In is automatically available on iOS

## 🐛 Troubleshooting

### Google Sign-In Issues
- **"SIGN_IN_CANCELLED"**: User cancelled the sign-in
- **"PLAY_SERVICES_NOT_AVAILABLE"**: Update Google Play Services
- **"SIGN_IN_REQUIRED"**: User needs to sign in again

### Facebook Login Issues
- **Invalid key hash**: Regenerate and update in Facebook Console
- **App not live**: Make sure your Facebook app is live for production

### General Issues
- Clear app data and try again
- Check network connectivity
- Verify all credentials are correct
- Check backend logs for authentication errors

## 📋 Checklist

- [ ] Google Cloud Console project created
- [ ] Google OAuth credentials configured (Android, iOS, Web)
- [ ] Facebook Developer app created
- [ ] Facebook Login product added and configured
- [ ] Environment variables set
- [ ] app.json updated with correct URL schemes
- [ ] Development build created
- [ ] OAuth buttons tested on device
- [ ] Backend integration verified
- [ ] Production build tested

## 🔗 Useful Links

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Expo OAuth Guide](https://docs.expo.dev/guides/authentication/)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [React Native FBSDK](https://github.com/thebergamo/react-native-fbsdk-next)
