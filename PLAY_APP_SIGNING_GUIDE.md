# Quick Fix - Play App Signing Without Password

## Problem
- Don't remember keystore password
- Can't use the old keystore
- Need to upload new builds to Google Play

## Solution: Google Play App Signing

Google Play will handle the final signing with the correct certificate. You just need a NEW upload keystore.

---

## Step-by-Step Instructions

### 1. Enable Play App Signing (Do This First!)

1. Go to: https://play.google.com/console
2. Select your app: **Remitgo**
3. Navigate to: **Release** → **Setup** → **App Integrity**
4. Click **"App signing"** in the left menu
5. If you see **"Upgrade to Google Play App Signing"** → Click it
   - Choose: **"Let Google generate and manage my app signing key"**
   - Click **"Continue"**
   - Accept the terms
   - Click **"Confirm"**

### 2. Generate NEW Upload Keystore in EAS

Run these commands:

```powershell
cd H:\Development\remitFlutter\Remit-Frontend
eas credentials
```

**Then follow these selections:**
1. Select platform: **Android**
2. Which build profile: **production** ⚠️ (NOT development!)
3. Select: **Keystore: Manage everything needed to build your project**
4. Select: **Set up a new Keystore**
5. Select: **Generate new Keystore** ✅
6. Confirm: **Yes, generate a new keystore**

### 3. Set as Default (Important!)

After generating:
1. Select: **Update default Build Credentials configuration**
2. Select the keystore you just generated (it will have a new ID)

### 4. Build with the New Keystore

```powershell
eas build --profile production --platform android --clear-cache
```

Wait for the build to complete and download the AAB file.

### 5. Upload to Google Play Console

#### Option A: Internal Testing First (Recommended)

1. Go to **Google Play Console**
2. Navigate to: **Testing** → **Internal testing**
3. Click **"Create new release"**
4. Upload your AAB file
5. Fill in release notes
6. Click **"Review release"** → **"Start rollout to Internal testing"**

Google Play will automatically **re-sign** your app with the correct certificate!

#### Option B: Direct to Production (If you're confident)

1. Go to **Google Play Console**
2. Navigate to: **Release** → **Production**
3. Click **"Create new release"**
4. Upload your AAB file
5. Follow the prompts

---

## Why This Works

**With Play App Signing:**
- ✅ You upload with ANY keystore (your new one)
- ✅ Google Play re-signs it with the CORRECT certificate
- ✅ Users get the app signed with the expected certificate
- ✅ Updates work perfectly
- ✅ No certificate mismatch errors

**What happens behind the scenes:**
```
Your AAB (signed with new keystore)
         ↓
Google Play Console
         ↓
Google re-signs with correct certificate
         ↓
Users download (signed with original certificate) ✅
```

---

## Full Command Sequence

Copy and paste these one by one:

```powershell
# 1. Open credentials manager
cd H:\Development\remitFlutter\Remit-Frontend
eas credentials

# Select: Android → production → Keystore → Set up new → Generate new

# 2. Build with new keystore
eas build --profile production --platform android --clear-cache

# 3. Wait for build to complete, then upload AAB to Play Console
```

---

## Verification Checklist

After uploading to Google Play:

- [ ] No certificate mismatch error ✅
- [ ] Upload completes successfully ✅
- [ ] App appears in Internal Testing (or Production) ✅
- [ ] Version code is incremented ✅

---

## Common Questions

**Q: Will this break existing user installations?**
A: NO! Play App Signing ensures the final APK has the correct certificate.

**Q: Do I need the old password anymore?**
A: NO! Once Play App Signing is enabled, you never need the old keystore again.

**Q: Can I use this for future updates?**
A: YES! Always use the NEW keystore you just generated for all future builds.

**Q: What about the .der file I downloaded?**
A: You don't need it anymore. Play App Signing handles everything.

---

## Next Steps After Success

1. ✅ Save your new keystore credentials (EAS manages them automatically)
2. ✅ Always use `production` profile for Play Store builds
3. ✅ Delete old keystore files to avoid confusion
4. ✅ Update your team about the new process

---

**Created:** October 18, 2025
**Status:** Ready to generate new keystore and upload
**Time to Complete:** ~15 minutes
