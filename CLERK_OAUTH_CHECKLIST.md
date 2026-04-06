# ✅ Clerk OAuth Setup Checklist

Use this checklist to ensure everything is configured correctly for Clerk Google OAuth to work in both local development and APK builds.

---

## 📱 Local Files Configuration

### ✅ app.json
- [ ] Scheme is `com.minhal128.remitgo`
- [ ] Android package is `com.minhal128.remitgo`
- [ ] iOS bundleIdentifier is `com.minhal128.remitgo`
- [ ] `@clerk/clerk-expo/plugin` is added with redirectUrl
- [ ] `expo-build-properties` has `usesCleartextTraffic: true` for Android

### ✅ .env
- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] `EXPO_PUBLIC_APP_SCHEME` is `com.minhal128.remitgo`
- [ ] `EXPO_PUBLIC_REDIRECT_URI` is `com.minhal128.remitgo://oauth-callback`
- [ ] `EXPO_PUBLIC_API_BASE_URL` points to your backend

### ✅ google-services.json
- [ ] Android package_name is `com.minhal128.remitgo`
- [ ] iOS bundle_id is `com.minhal128.remitgo`
- [ ] OAuth client IDs are present

---

## 🔑 Google Cloud Console

### ✅ OAuth 2.0 Client IDs

**Web Client (for Clerk):**
- [ ] Created with type "Web application"
- [ ] Authorized redirect URI: `https://flexible-jackal-62.clerk.accounts.dev/v1/oauth_callback`

**Android Client:**
- [ ] Created with type "Android"
- [ ] Package name: `com.minhal128.remitgo`
- [ ] SHA-1 fingerprint (debug): Added
- [ ] SHA-1 fingerprint (release): Added (for APK)

**iOS Client:**
- [ ] Created with type "iOS"
- [ ] Bundle ID: `com.minhal128.remitgo`

### ✅ OAuth Consent Screen
- [ ] App name set
- [ ] User support email set
- [ ] Developer contact email set
- [ ] Scopes added: `openid`, `email`, `profile`
- [ ] Test users added (if in testing mode)

---

## 🔐 Clerk Dashboard

### ✅ Social Connections
- [ ] Google OAuth is enabled
- [ ] Google Client ID is added
- [ ] Google Client Secret is added

### ✅ Paths Configuration
- [ ] Development redirect URL added: `exp://localhost:8081`
- [ ] Production redirect URL added: `com.minhal128.remitgo://oauth-callback`

### ✅ API Keys
- [ ] Publishable key copied to `.env`
- [ ] Using correct key (test vs live)

---

## 🛠️ Build Configuration

### ✅ Dependencies
- [ ] `@clerk/clerk-expo` is installed
- [ ] `expo-web-browser` is installed
- [ ] `expo-secure-store` is installed
- [ ] All dependencies are up to date

### ✅ Native Code
- [ ] Run `npx expo prebuild --clean` after config changes
- [ ] Android native code regenerated
- [ ] iOS native code regenerated (if applicable)

---

## 🧪 Testing

### ✅ Local Development
- [ ] Run `npx expo start -c` to clear cache
- [ ] App opens without errors
- [ ] "Continue with Google" button is visible
- [ ] Tapping button opens Google OAuth
- [ ] Can select Google account
- [ ] Returns to app after selection
- [ ] Console shows: `✅ Clerk OAuth successful, session created`
- [ ] Console shows: `✅ Backend authentication successful`
- [ ] User is redirected to KYC or ThumbEnable screen

### ✅ APK Build
- [ ] Build APK with `eas build --platform android --profile preview`
- [ ] Install APK on physical device
- [ ] App opens without errors
- [ ] "Continue with Google" button works
- [ ] Google account selection appears
- [ ] Returns to app after authentication
- [ ] Backend authentication succeeds
- [ ] User is redirected correctly

---

## 🔍 Verification Commands

### Check SHA-1 Fingerprint:
```bash
# Debug keystore
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# Or use the provided script
get-sha1-fingerprint.bat
```

### Check Package Name:
```bash
# In app.json
"android": {
  "package": "com.minhal128.remitgo"
}
```

### Check Clerk Key:
```bash
# In .env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚨 Common Issues Checklist

If OAuth is not working, check these:

### Issue: "Invalid redirect URI"
- [ ] Redirect URI in Clerk Dashboard matches exactly
- [ ] No trailing slashes in redirect URI
- [ ] Scheme in app.json matches redirect URI

### Issue: "Google Sign-In failed"
- [ ] SHA-1 fingerprint is correct in Google Cloud Console
- [ ] Using correct keystore (debug vs release)
- [ ] Package name matches everywhere

### Issue: "Screen does not exist"
- [ ] Using `router.replace()` not `router.push()`
- [ ] Screen routes are defined in `_layout.tsx`
- [ ] Navigation logic is correct

### Issue: Works in dev but not APK
- [ ] Release keystore SHA-1 added to Google Cloud Console
- [ ] Production redirect URI added to Clerk Dashboard
- [ ] APK signed with correct keystore
- [ ] Rebuilt APK after config changes

---

## 📊 Success Indicators

When everything is working correctly, you should see:

### Console Logs:
```
🚀 Starting Clerk Google OAuth flow...
✅ Clerk OAuth successful, session created
👤 Clerk user: {...}
📤 Sending user data to backend
✅ Backend authentication successful
🔄 Navigating to: KYCScreen
```

### User Experience:
1. User taps "Continue with Google"
2. Google account selection appears (native UI)
3. User selects account
4. Returns to app immediately
5. Loading indicator shows briefly
6. User is redirected to next screen

---

## 🎯 Final Verification

Before considering the setup complete:

- [ ] Tested on at least 2 different devices
- [ ] Tested with different Google accounts
- [ ] Tested in both development and production builds
- [ ] Verified backend receives user data correctly
- [ ] Verified user can complete full flow (OAuth → KYC → App)
- [ ] No errors in console logs
- [ ] No warnings about missing configuration

---

## 📝 Notes

**Date Completed:** _______________

**Tested By:** _______________

**Devices Tested:**
- [ ] Android Emulator
- [ ] Physical Android Device (Model: _______________)
- [ ] iOS Simulator (if applicable)
- [ ] Physical iOS Device (if applicable)

**Build Versions Tested:**
- [ ] Development Build
- [ ] Preview APK
- [ ] Production APK

---

**If all items are checked, your Clerk Google OAuth is fully configured and working! 🎉**

For detailed troubleshooting, see: `CLERK_GOOGLE_SIGNIN_FIX.md`
For quick setup, see: `QUICK_START_CLERK_OAUTH.md`
