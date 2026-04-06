# 🚀 Clerk Google OAuth - Setup Guide

## 📌 Quick Overview

Your Clerk Google Sign-In has been **fixed** but requires **3 simple steps** to complete:

1. ✅ **Code Changes** - DONE
2. ⏳ **Clerk Dashboard Setup** - YOU NEED TO DO THIS
3. ⏳ **Google Cloud Console Setup** - YOU NEED TO DO THIS

**Total Time: ~25 minutes**

---

## 🎯 Step 1: Clerk Dashboard Setup (10 minutes)

### Go to: https://dashboard.clerk.com/

### A. Add Redirect URLs

1. Click on your app
2. Go to **Configure** → **Paths**
3. Scroll to **Authorized redirect URLs**
4. Add these two URLs:

```
exp://localhost:8081
com.minhal128.remitgo://oauth-callback
```

### B. Enable Google OAuth

1. Go to **User & Authentication** → **Social Connections**
2. Find **Google** and click **Configure**
3. Toggle **Enable** to ON
4. You'll need Google Client ID and Secret (from Step 2)

---

## 🎯 Step 2: Google Cloud Console Setup (15 minutes)

### Go to: https://console.cloud.google.com/

### A. Get Your SHA-1 Fingerprint

**Option 1: Use the provided script**
```bash
# In your project folder, double-click:
get-sha1-fingerprint.bat
```

**Option 2: Manual command**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Copy the SHA1 value** (looks like: `EF:12:A1:0F:DD:A5:6F:53:...`)

### B. Configure Android OAuth Client

1. Go to **APIs & Services** → **Credentials**
2. Find your **Android OAuth Client** or click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Android** as application type
4. Fill in:
   - **Name:** RemitGo Android
   - **Package name:** `com.minhal128.remitgo`
   - **SHA-1 certificate fingerprint:** [Paste from Step A]
5. Click **CREATE**

### C. Configure Web OAuth Client (for Clerk)

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Web application**
3. Fill in:
   - **Name:** RemitGo Web (Clerk)
   - **Authorized redirect URIs:** 
     ```
     https://flexible-jackal-62.clerk.accounts.dev/v1/oauth_callback
     ```
4. Click **CREATE**
5. **Copy the Client ID and Client Secret**

### D. Add Credentials to Clerk

1. Go back to **Clerk Dashboard**
2. **User & Authentication** → **Social Connections** → **Google**
3. Paste:
   - **Client ID:** [from Step C]
   - **Client Secret:** [from Step C]
4. Click **Save**

---

## 🎯 Step 3: Rebuild Your App

### For Local Development:

```bash
# Clear cache and start
npx expo start -c
```

### For APK Build:

```bash
# Rebuild native code
npx expo prebuild --clean

# Build APK
eas build --platform android --profile preview
```

---

## ✅ Test It!

### Local Development:
1. Open your app
2. Tap **"Continue with Google"**
3. Select a Google account
4. Should return to app and authenticate

### APK:
1. Install APK on device
2. Tap **"Continue with Google"**
3. Select a Google account
4. Should return to app and authenticate

---

## 🎉 Success Indicators

When it's working, you'll see these console logs:

```
🚀 Starting Clerk Google OAuth flow...
✅ Clerk OAuth successful, session created
👤 Clerk user: {...}
📤 Sending user data to backend
✅ Backend authentication successful
🔄 Navigating to: KYCScreen
```

---

## 🐛 Troubleshooting

### "Invalid redirect URI"
→ Check Clerk Dashboard has both redirect URLs added

### "Google Sign-In failed"
→ Verify SHA-1 fingerprint in Google Cloud Console

### APK not working
→ Make sure you added the correct SHA-1 for your release keystore

---

## 📚 More Help

- **Detailed Guide:** `CLERK_GOOGLE_SIGNIN_FIX.md`
- **Quick Start:** `QUICK_START_CLERK_OAUTH.md`
- **Checklist:** `CLERK_OAUTH_CHECKLIST.md`
- **Changes Made:** `CHANGES_SUMMARY.md`

---

## 🎯 Summary

**What's Done:**
- ✅ Fixed scheme inconsistency
- ✅ Added Clerk plugin configuration
- ✅ Updated environment variables
- ✅ Fixed iOS bundle identifier

**What You Need to Do:**
1. Add redirect URLs to Clerk Dashboard
2. Add SHA-1 fingerprint to Google Cloud Console
3. Add Google credentials to Clerk
4. Rebuild app

**Total Time: ~25 minutes**

**After these steps, Google OAuth will work perfectly in both local and APK! 🚀**
