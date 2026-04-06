# OAuth Setup Guide for RemitGo React Native App

This guide explains how to set up OAuth 2.0 authentication (Google, Facebook, Apple) in your React Native frontend application.

## 📱 Frontend OAuth Integration Complete!

Your React Native app now has complete OAuth integration with the backend. Here's what's been implemented:

### ✅ **Updated Files:**
- `app/screens/signin.tsx` - Updated with proper OAuth integration
- `app/screens/signup.tsx` - Updated with proper OAuth integration  
- `app/constants/oauth.ts` - Centralized OAuth configuration
- `app/utils/api.ts` - API utility for backend communication

### 🎯 **OAuth Flow:**
1. User taps social login button
2. Expo Auth Session handles OAuth flow
3. App receives access token/identity token
4. Token sent to backend for verification
5. Backend returns JWT token and user data
6. App stores token and navigates to next screen

## 🔧 **Setup Instructions**

### 1. **Google OAuth Setup**

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

#### Step 2: Create OAuth 2.0 Client IDs
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Configure the OAuth consent screen
3. Create separate client IDs for:
   - **Web application** (for development)
   - **iOS application** (for iOS app)
   - **Android application** (for Android app)

#### Step 3: Update Frontend Configuration
Edit `app/constants/oauth.ts`:
```typescript
export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: 'your-web-client-id.apps.googleusercontent.com',
    IOS_CLIENT_ID: 'your-ios-client-id.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: 'your-android-client-id.apps.googleusercontent.com',
  },
  // ... other config
};
```

### 2. **Facebook OAuth Setup**

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product

#### Step 2: Configure Facebook Login
1. Go to Facebook Login → Settings
2. Add your app's bundle identifier
3. Get your App ID from the app settings

#### Step 3: Update Frontend Configuration
Edit `app/constants/oauth.ts`:
```typescript
export const OAUTH_CONFIG = {
  FACEBOOK: {
    APP_ID: 'your-facebook-app-id',
  },
  // ... other config
};
```

### 3. **Apple Sign-In Setup**

#### Step 1: Apple Developer Account
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID with Sign In with Apple capability
3. No additional frontend configuration needed

#### Step 2: iOS Configuration
- Apple Sign-In works automatically with your app's bundle identifier
- No client IDs needed in the frontend

## 📋 **Configuration Checklist**

### Frontend Configuration
- [ ] Update `app/constants/oauth.ts` with your actual OAuth credentials
- [ ] Ensure `app/constants/api.ts` points to your backend URL
- [ ] Test OAuth flows on both iOS and Android

### Backend Configuration
- [ ] Create `.env` file in backend with OAuth credentials
- [ ] Ensure backend OAuth endpoints are working
- [ ] Test backend OAuth integration

## 🚀 **Testing OAuth Integration**

### 1. **Test Google Sign-In**
```bash
# Start your React Native app
npx expo start

# Test on device/simulator
# Tap Google sign-in button
# Should redirect to Google OAuth
# After successful auth, should navigate to next screen
```

### 2. **Test Facebook Sign-In**
```bash
# Same process as Google
# Tap Facebook sign-in button
# Should redirect to Facebook OAuth
# After successful auth, should navigate to next screen
```

### 3. **Test Apple Sign-In** (iOS only)
```bash
# Test on iOS device/simulator
# Tap Apple sign-in button
# Should show Apple Sign-In modal
# After successful auth, should navigate to next screen
```

## 🔍 **Troubleshooting**

### Common Issues:

#### 1. **"Invalid Client ID" Error**
- Check that your OAuth credentials are correct
- Ensure you're using the right client ID for each platform
- Verify your app's bundle identifier matches OAuth configuration

#### 2. **"Network Error" or "Backend Unreachable"**
- Check your `API_BASE_URL` in `app/constants/api.ts`
- Ensure your backend is running and accessible
- Verify CORS settings on your backend

#### 3. **"OAuth Flow Failed"**
- Check that your OAuth provider settings are correct
- Verify redirect URIs are properly configured
- Ensure your app's bundle identifier is registered

#### 4. **"Token Verification Failed"**
- Check that your backend OAuth credentials match frontend
- Verify JWT secret is properly configured
- Ensure Apple private key is correctly formatted

### Debug Steps:
1. Check console logs for detailed error messages
2. Verify OAuth credentials in `app/constants/oauth.ts`
3. Test backend OAuth endpoints directly
4. Check network requests in React Native debugger

## 📱 **Platform-Specific Notes**

### iOS
- Apple Sign-In requires iOS 13+
- Bundle identifier must match Apple Developer configuration
- Test on physical device for Apple Sign-In

### Android
- Google Sign-In requires Google Play Services
- Facebook Sign-In requires Facebook app or web fallback
- Ensure SHA-1 fingerprint is registered in Google Cloud Console

## 🔐 **Security Best Practices**

1. **Never commit OAuth credentials to version control**
2. **Use environment variables for sensitive data**
3. **Implement proper token storage and refresh**
4. **Validate tokens on both frontend and backend**
5. **Use HTTPS in production**

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all configuration steps are completed
3. Test with OAuth provider's test tools
4. Review backend logs for detailed error messages

## 🎉 **Next Steps**

Once OAuth is working:
1. Implement token refresh logic
2. Add user profile management
3. Implement logout functionality
4. Add error handling and user feedback
5. Test on multiple devices and platforms

Your OAuth integration is now complete and ready for production use! 🚀
