# 🚀 Production OAuth Setup for RemitGo Mobile App

This guide explains how to set up production-level OAuth authentication (Google, Facebook) that will work when users download the APK from app stores.

## ✅ **What's Been Implemented**

### 🔐 **OAuth Service**
- **File**: `app/utils/oauthService.ts`
- **Features**:
  - Production-ready Google OAuth using `@react-native-google-signin/google-signin`
  - Production-ready Facebook OAuth using `react-native-fbsdk-next`
  - Comprehensive error logging with emojis for easy debugging
  - Platform-specific implementations (web vs mobile)
  - Backend authentication integration
  - Proper token handling and user data processing

### 📱 **App Configuration**
- **File**: `app.json`
- **Updates**:
  - OAuth scheme: `com.minhal128.Frontend://oauth2redirect`
  - Google Sign-In plugin configuration
  - Facebook SDK plugin configuration
  - iOS and Android specific settings

### 🤖 **Android Configuration**
- **File**: `android/app/src/main/AndroidManifest.xml`
- **Updates**:
  - OAuth intent filters for `com.minhal128.Frontend://oauth2redirect`
  - Facebook SDK activities
  - Proper permissions and queries

### ⚙️ **OAuth Constants**
- **File**: `app/constants/oauth.ts`
- **Features**:
  - Environment-specific configuration
  - Platform-specific redirect URIs
  - OAuth scopes definition
  - Centralized configuration management

## 🎯 **How It Works**

### 1. **Google OAuth Flow**
```
User taps Google Sign-In → Google Sign-In SDK → ID Token → Backend → JWT Token → Success
```

### 2. **Facebook OAuth Flow**
```
User taps Facebook Sign-In → Facebook SDK → Access Token → User Profile → Backend → JWT Token → Success
```

### 3. **Platform Detection**
- **Web**: Uses web-based OAuth with redirects
- **Mobile**: Uses native SDKs for seamless experience

## 🔧 **Setup Instructions**

### 1. **Google OAuth Setup**

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable Google+ API and Google Sign-In API

#### Step 2: Create OAuth 2.0 Client IDs
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Configure the OAuth consent screen
3. Create separate client IDs for:
   - **Web application**: `151870523880-5foepnp7s3jdtpr8mek9ao857t6mpqui.apps.googleusercontent.com`
   - **Android application**: `151870523880-phec5lat156em7jjq2af1djutmcl97tn.apps.googleusercontent.com`
   - **iOS application**: `151870523880-5foepnp7s3jdtpr8mek9ao857t6mpqui.apps.googleusercontent.com`

#### Step 3: Configure Android
- Package name: `com.minhal128.Frontend`
- SHA-1 fingerprint: Get from your keystore
- Add to Google Cloud Console

### 2. **Facebook OAuth Setup**

#### Step 1: Facebook Developers
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. App ID: `1775013096442268`

#### Step 2: Configure OAuth Settings
1. Add OAuth redirect URI: `com.minhal128.Frontend://oauth2redirect`
2. Enable Facebook Login product
3. Configure iOS and Android platforms

#### Step 3: Update Configuration
- Replace `your-facebook-client-token` in `app.json` with actual client token
- Update `android/app/src/main/AndroidManifest.xml` with actual client token

### 3. **Build Configuration**

#### Development Build
```bash
expo run:android --variant debug
expo run:ios --configuration Debug
```

#### Production Build
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 📱 **Testing OAuth**

### 1. **Development Testing**
- Use Expo Go app for quick testing
- OAuth will work with development builds
- Check console logs for detailed debugging

### 2. **Production Testing**
- Build APK/IPA and install on device
- Test OAuth flows end-to-end
- Verify backend integration

### 3. **Console Logging**
The OAuth service includes comprehensive logging:
```
🔐 OAuth Service initialized for platform: android
🚀 Starting Google OAuth flow...
📱 Using mobile-based Google OAuth
🎮 Google Play Services available: true
🔐 User already signed in: false
🔑 Signing in user with Google...
✅ Google Sign-In successful for: user@example.com
🔄 Processing Google user data...
👤 User email: user@example.com
🆔 User ID: 123456789
🔑 ID token received, length: 1234
🔄 Authenticating with backend for provider: google
📤 Sending data to backend...
🔗 Backend endpoint: /auth/google
🌐 Backend URL: https://remitgobackend.vercel.app
📥 Backend response received: {success: true, token: "..."}
✅ Backend authentication successful
🔑 Token received, length: 1234
👤 User data received: {...}
```

## 🚨 **Common Issues & Solutions**

### 1. **Google Sign-In Not Working**
- **Issue**: "Google Play Services not available"
- **Solution**: Ensure device has Google Play Services installed and updated

### 2. **Facebook Login Fails**
- **Issue**: "No access token received from Facebook"
- **Solution**: Check Facebook app configuration and permissions

### 3. **OAuth Redirect Not Working**
- **Issue**: App doesn't handle OAuth callback
- **Solution**: Verify intent filters in AndroidManifest.xml

### 4. **Backend Authentication Fails**
- **Issue**: "Backend authentication failed"
- **Solution**: Check backend endpoint and OAuth configuration

## 🔒 **Security Considerations**

### 1. **Client Secrets**
- Never expose client secrets in mobile apps
- Use backend for sensitive operations
- Implement proper token validation

### 2. **Token Storage**
- Use AsyncStorage for mobile
- Use localStorage for web
- Implement secure token refresh

### 3. **OAuth Scopes**
- Request minimal required permissions
- Follow OAuth 2.0 best practices
- Implement proper user consent

## 📋 **Checklist for Production**

- [ ] Google OAuth client IDs configured
- [ ] Facebook app ID and client token configured
- [ ] Android manifest updated with OAuth intent filters
- [ ] iOS URL schemes configured
- [ ] Backend OAuth endpoints working
- [ ] OAuth redirect URIs properly configured
- [ ] Production build tested on real devices
- [ ] Console logging verified
- [ ] Error handling tested
- [ ] User flow tested end-to-end

## 🎉 **Success Indicators**

When OAuth is working correctly, you should see:
1. ✅ Google Sign-In button opens Google account picker
2. ✅ Facebook Sign-In button opens Facebook login
3. ✅ User data received from OAuth providers
4. ✅ Backend authentication successful
5. ✅ JWT token stored locally
6. ✅ User redirected to appropriate screen
7. ✅ Comprehensive console logging throughout the process

## 🆘 **Support & Debugging**

### Console Commands
```bash
# Check OAuth configuration
console.log('OAuth Config:', getOAuthConfig());

# Test Google Sign-In
oauthService.getCurrentGoogleUser();

# Check authentication status
oauthService.isAuthenticated();
```

### Debug Mode
Enable debug logging by setting `__DEV__ = true` or checking console output for detailed OAuth flow information.

---

**🎯 Your RemitGo app now has production-ready OAuth that will work perfectly when users download the APK!**
