# Google Play Certificate Fix Guide

## Problem
Google Play Console shows certificate mismatch error:
```
Expected SHA1: 05:23:C7:9F:34:E8:6F:5F:DE:C6:CD:9A:ED:FA:AC:C3:B0:A2:85:C8
Uploaded SHA1: EF:12:A1:0F:DD:A5:6F:53:F2:5B:A0:93:9F:12:2A:50:2B:66:08:6D
```

## Root Cause
- EAS Build generated a **new keystore** (6 days ago)
- Google Play expects the **old keystore** from the original upload
- These are two different certificates

## Solution Steps

### Option 1: Find and Upload Original Keystore (BEST)

If you have the original keystore file:

1. **Locate your original keystore:**
   - Look for files like: `my-release-key.jks`, `android.jks`, `upload-keystore.jks`
   - Check these locations:
     - `android/app/` directory
     - Your backup drives
     - Previous developer's computer
     - Email attachments (if shared)

2. **Upload to EAS:**
   ```powershell
   cd Remit-Frontend
   eas credentials
   ```
   
   Then:
   - Select: **Android**
   - Select: **production**
   - Select: **Keystore: Manage everything needed to build your project**
   - Select: **Remove Keystore: Delete current Keystore**
   - Select: **Set up a new Keystore**
   - Select: **Upload an existing Keystore**
   - Provide path to `.jks` file
   - Enter passwords and alias

3. **Rebuild and upload:**
   ```powershell
   eas build --profile production --platform android
   ```

### Option 2: Use Google Play App Signing (RECOMMENDED)

If you **DON'T have** the original keystore:

#### A. Enroll in Play App Signing:

1. **Go to Google Play Console**
2. Navigate to: **Your App > Release > Setup > App Integrity**
3. Click **"App signing"** in the left menu
4. If you see **"Upgrade"** or **"Enroll"** button, click it
5. Follow the enrollment process

#### B. Then upload via Internal Testing:

1. In Google Play Console: **Testing > Internal testing**
2. Click **"Create new release"**
3. Upload your current AAB file (the one with new certificate)
4. Click **"Review release"** → **"Start rollout to Internal testing"**

Google Play will automatically re-sign it with the correct certificate!

### Option 3: Create New App (LAST RESORT)

⚠️ **Only if the app has NO users yet:**

1. **Delete** the existing app from Google Play Console (if still in draft)
2. **Create** a new app listing
3. Upload the new AAB with the new certificate
4. This will be a fresh start with the new certificate

## Current Certificate Info

**Your EAS Keystore (Current):**
- SHA1: `EF:12:A1:0F:DD:A5:6F:53:F2:5B:A0:93:9F:12:2A:50:2B:66:08:6D`
- SHA256: `DD:49:44:8E:46:93:D4:9A:EF:FF:36:92:9C:F2:AF:A7:A2:D5:B7:A0:AD:FC:CD:27:BD:67:1C:2E:9E:1A:65:FD`
- Type: JKS
- Key Alias: `ec56068c1eddc18d08c4bf1473925dcc`
- Updated: 6 days ago

**Google Play Expected:**
- SHA1: `05:23:C7:9F:34:E8:6F:5F:DE:C6:CD:9A:ED:FA:AC:C3:B0:A2:85:C8`

## Why This Happened

This is **NOT related to Clerk** - it's about Android app signing.

When you first uploaded to Google Play, you used one certificate. Then EAS Build created a new certificate (6 days ago). Google Play requires **all updates** to use the **same certificate** as the original upload.

## Quick Fix Flowchart

```
Do you have the original .jks keystore file?
│
├─ YES → Upload it to EAS → Rebuild → Upload ✅
│
└─ NO → Is the app already published with users?
    │
    ├─ YES → Use Play App Signing (Option 2) ✅
    │
    └─ NO → Delete app & start fresh (Option 3) ✅
```

## Testing Your Fix

After implementing the fix:

1. **Build with correct certificate:**
   ```powershell
   eas build --profile production --platform android
   ```

2. **Download the AAB**

3. **Upload to Google Play Console**

4. **Verify success:**
   - No certificate mismatch error
   - Upload completes successfully
   - Version code incremented

## Notes for Clerk Integration

**Good news:** This certificate issue is **completely separate** from Clerk authentication.

- ✅ Clerk doesn't use SHA1 certificates
- ✅ Clerk uses its own API keys (pk_test_...)
- ✅ Your Clerk OAuth will work regardless of signing certificate
- ✅ This is purely an Android APK/AAB signing issue

Once you fix the certificate, your Google OAuth with Clerk will continue to work perfectly!

---

**Created:** October 18, 2025
**Issue:** Google Play certificate mismatch
**Status:** Awaiting user action to upload correct keystore
