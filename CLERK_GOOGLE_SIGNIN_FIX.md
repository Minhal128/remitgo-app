# 🔧 Clerk Google Sign-In Fix - Complete Setup Guide

## ✅ Issues Fixed

### 1. **Scheme Mismatch**
- **Problem**: `.env` had `com.minhal128.Frontend` but `app.json` had `com.minhal128.remitgo`
- **Solution**: Updated all schemes to use `com.minhal128.remitgo` consistently

### 2. **Missing Clerk Plugin**
- **Problem**: No `@clerk/clerk-expo` plugin configured in `app.json`
- **Solution**: Added Clerk plugin with proper redirect URL configuration

### 3. **iOS Bundle Identifier Mismatch**
- **Problem**: `google-services.json` had old iOS bundle `com.minhal128.Frontend`
- **Solution**: Updated to `com.minhal128.remitgo` to match current package

### 4. **Missing Environment Variables**
- **Problem**: No Clerk publishable key in `.env`
- **Solution**: Added `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## 🚀 What Was Changed

### 1. **app.json**
```json
{
  "expo": {
    "scheme": "com.minhal128.remitgo",
    "plugins": [
      // ... other plugins
      [
        "@clerk/clerk-expo/plugin",
        {
          "redirectUrl": "com.minhal128.remitgo://oauth-callback"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          },
          "android": {
            "usesCleartextTraffic": true  // Added for local development
          }
        }
      ]
    ]
  }
}
```

### 2. **.env**
```env
# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmxleGlibGUtamFja2FsLTYyLmNsZXJrLmFjY291bnRzLmRldiQ

# App Configuration
EXPO_PUBLIC_APP_SCHEME=com.minhal128.remitgo
EXPO_PUBLIC_REDIRECT_URI=com.minhal128.remitgo://oauth-callback
```

### 3. **google-services.json**
```json
{
  "ios_info": {
    "bundle_id": "com.minhal128.remitgo"  // Updated from com.minhal128.Frontend
  }
}
```

---

## 📋 Clerk Dashboard Setup (CRITICAL)

### Step 1: Configure OAuth Redirect URLs

Go to your Clerk Dashboard → Configure → Paths and add:

**For Development:**
```
exp://localhost:8081
exp://192.168.x.x:8081  (your local IP)
```

**For Production (APK/App Store):**
```
com.minhal128.remitgo://oauth-callback
```

### Step 2: Enable Google OAuth Provider

1. Go to **User & Authentication** → **Social Connections**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

### Step 3: Configure Allowed Domains

Add your backend domain:
```
https://remitgobackend.vercel.app
```

---

## 🔑 Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Client IDs

You need **THREE** client IDs:

#### 1. **Web Client ID** (for Clerk)
- Application type: **Web application**
- Authorized redirect URIs:
  ```
  https://flexible-jackal-62.clerk.accounts.dev/v1/oauth_callback
  ```

#### 2. **Android Client ID**
- Application type: **Android**
- Package name: `com.minhal128.remitgo`
- SHA-1 certificate fingerprint: (Get from your keystore)
  ```bash
  # For debug builds
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # For release builds
  keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
  ```

#### 3. **iOS Client ID**
- Application type: **iOS**
- Bundle ID: `com.minhal128.remitgo`

### Step 2: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Add test users (your email addresses)
3. Add scopes:
   - `openid`
   - `email`
   - `profile`

---

## 🛠️ Setup Instructions

### For Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Clear cache and rebuild:**
   ```bash
   npx expo start -c
   ```

3. **Run on device/emulator:**
   ```bash
   # Android
   npx expo run:android
   
   # iOS
   npx expo run:ios
   ```

### For APK Build

1. **Prebuild native code:**
   ```bash
   npx expo prebuild --clean
   ```

2. **Build APK:**
   ```bash
   # Using EAS Build (recommended)
   eas build --platform android --profile preview
   
   # Or local build
   cd android && ./gradlew assembleRelease
   ```

3. **Install APK on device:**
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

---

## 🧪 Testing Checklist

### Local Development Testing

- [ ] Run `npx expo start -c` to clear cache
- [ ] Open app in Expo Go or development build
- [ ] Tap "Continue with Google" button
- [ ] Google OAuth popup should appear
- [ ] After authentication, should return to app
- [ ] Check console logs for success messages
- [ ] Verify user is redirected to KYC or ThumbEnable screen

### APK Testing

- [ ] Build APK with `eas build` or local build
- [ ] Install APK on physical device
- [ ] Tap "Continue with Google" button
- [ ] Google account selection should appear
- [ ] After authentication, should return to app
- [ ] Verify backend authentication succeeds
- [ ] Check user is redirected correctly

---

## 🐛 Troubleshooting

### Issue 1: "Invalid redirect URI"

**Symptoms:**
- OAuth flow fails with redirect URI error
- User stuck on Google sign-in page

**Solution:**
1. Verify redirect URI in Clerk Dashboard matches exactly:
   - Development: `exp://localhost:8081`
   - Production: `com.minhal128.remitgo://oauth-callback`
2. Make sure there are no trailing slashes
3. Check scheme in `app.json` matches

### Issue 2: "Google Sign-In failed"

**Symptoms:**
- Error message after tapping Google button
- Console shows OAuth error

**Solution:**
1. Check Clerk publishable key is correct in `.env`
2. Verify Google OAuth is enabled in Clerk Dashboard
3. Ensure Google Client ID and Secret are configured in Clerk
4. Check network connectivity

### Issue 3: "Screen does not exist" after OAuth

**Symptoms:**
- OAuth succeeds but shows error screen
- User not redirected properly

**Solution:**
- This should be fixed with the current implementation
- If still occurs, check `router.replace()` calls in signin/signup screens
- Verify KYC status is being saved correctly

### Issue 4: APK OAuth not working

**Symptoms:**
- Works in development but not in APK
- Google sign-in fails in production build

**Solution:**
1. Verify SHA-1 fingerprint in Google Cloud Console
2. Check package name matches: `com.minhal128.remitgo`
3. Ensure redirect URI is added to Clerk Dashboard
4. Rebuild APK after changes: `eas build --platform android --profile preview`

### Issue 5: "User stays in browser"

**Symptoms:**
- Browser opens but doesn't return to app
- OAuth flow completes but app doesn't respond

**Solution:**
1. Verify `@clerk/clerk-expo/plugin` is in `app.json`
2. Run `npx expo prebuild --clean` to regenerate native code
3. Rebuild app completely
4. Check deep linking is configured correctly

---

## 📱 How It Works Now

### Complete OAuth Flow:

1. **User taps "Continue with Google"**
   ```
   🚀 Starting Clerk Google OAuth flow...
   ```

2. **Clerk opens Google OAuth**
   - Uses native browser or in-app browser
   - User selects Google account
   - User grants permissions

3. **Google redirects back to app**
   - Uses deep link: `com.minhal128.remitgo://oauth-callback`
   - Clerk handles the callback automatically

4. **Clerk creates session**
   ```
   ✅ Clerk OAuth successful, session created
   ```

5. **App retrieves user data**
   ```
   👤 Clerk user: { id, email, name, ... }
   ```

6. **Backend authentication**
   ```
   📤 Sending user data to backend
   ✅ Backend authentication successful
   ```

7. **Navigation**
   ```
   🔄 Navigating to: KYCScreen (or ThumbEnableScreen)
   ```

---

## 🔒 Security Notes

1. **Never commit sensitive keys:**
   - Keep `.env` in `.gitignore`
   - Use environment variables for production

2. **Use different keys for dev/prod:**
   - Development: `pk_test_...`
   - Production: `pk_live_...`

3. **Rotate keys regularly:**
   - Update Clerk publishable key
   - Update Google OAuth credentials

4. **Validate tokens on backend:**
   - Always verify Clerk session tokens
   - Don't trust client-side data

---

## 📚 Additional Resources

- [Clerk Expo Documentation](https://clerk.com/docs/quickstarts/expo)
- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/oauth)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Expo Deep Linking](https://docs.expo.dev/guides/deep-linking/)

---

## ✅ Summary

**What's Fixed:**
- ✅ Scheme consistency across all files
- ✅ Clerk plugin properly configured
- ✅ iOS bundle identifier updated
- ✅ Environment variables added
- ✅ Android cleartext traffic enabled for local dev

**What You Need to Do:**

1. **Update Clerk Dashboard:**
   - Add redirect URLs
   - Enable Google OAuth
   - Add Google credentials

2. **Update Google Cloud Console:**
   - Add SHA-1 fingerprints
   - Verify package name
   - Add redirect URIs

3. **Rebuild App:**
   ```bash
   npx expo prebuild --clean
   npx expo run:android  # or eas build
   ```

4. **Test:**
   - Test in development
   - Test in APK
   - Verify both local and production work

---

**Your Clerk Google Sign-In should now work in both local development and APK builds! 🎉**

If you encounter any issues, refer to the troubleshooting section above or check the console logs for detailed error messages.
