# 🚀 Quick Start - Clerk Google OAuth

## ⚡ Immediate Next Steps

### 1️⃣ Get Your SHA-1 Fingerprint (5 minutes)

**Run this command:**
```bash
# Double-click this file in your project:
get-sha1-fingerprint.bat
```

**Or manually:**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA1** value (looks like: `EF:12:A1:0F:DD:A5:6F:53:...`)

---

### 2️⃣ Update Google Cloud Console (10 minutes)

**Go to:** https://console.cloud.google.com/

**Navigate to:** APIs & Services → Credentials

**Find your Android OAuth Client** or create a new one:
- **Application type:** Android
- **Package name:** `com.minhal128.remitgo`
- **SHA-1 certificate fingerprint:** [Paste from step 1]

**Click Save**

---

### 3️⃣ Update Clerk Dashboard (5 minutes)

**Go to:** https://dashboard.clerk.com/

**Navigate to:** Configure → Paths

**Add these redirect URLs:**

**For Development:**
```
exp://localhost:8081
```

**For Production APK:**
```
com.minhal128.remitgo://oauth-callback
```

**Enable Google OAuth:**
1. Go to: User & Authentication → Social Connections
2. Enable **Google**
3. Add your Google Client ID and Secret from Google Cloud Console

---

### 4️⃣ Rebuild Your App (5 minutes)

**Clear everything and rebuild:**
```bash
# Clear cache
npx expo start -c

# For development
npx expo run:android

# For APK build
eas build --platform android --profile preview
```

---

## ✅ Test It!

### Local Development Test:
1. Run: `npx expo start`
2. Open app on device/emulator
3. Tap "Continue with Google"
4. Should see Google account selection
5. After selecting account, should return to app
6. Check console for: `✅ Backend authentication successful`

### APK Test:
1. Install APK on device
2. Tap "Continue with Google"
3. Select Google account
4. Should return to app and authenticate
5. Verify navigation to KYC or ThumbEnable screen

---

## 🐛 Quick Troubleshooting

### "Invalid redirect URI"
→ Check Clerk Dashboard has `com.minhal128.remitgo://oauth-callback`

### "Google Sign-In failed"
→ Verify SHA-1 fingerprint in Google Cloud Console

### "Screen does not exist"
→ Already fixed! If still occurs, check console logs

### APK not working
→ Make sure you added **release keystore SHA-1** to Google Cloud Console

---

## 📞 Need Help?

Check the detailed guide: `CLERK_GOOGLE_SIGNIN_FIX.md`

---

**Total Setup Time: ~25 minutes**

**After setup, Google OAuth will work in both local development and APK builds! 🎉**
