# Upload Google Play Certificate to EAS - Step by Step

## Current Situation

You have:
- ✅ `androidcert.der` - Certificate from Google Play (public key only)
- ✅ `@minhal128__frontend.bak.jks` - A backup keystore file

You need:
- The **original keystore (.jks) file** that matches Google Play's expected SHA1: `05:23:C7:9F:34:E8:6F:5F:DE:C6:CD:9A:ED:FA:AC:C3:B0:A2:85:C8`

## Problem

The `.der` file you downloaded from Google Play is just a **certificate** (public key). EAS Build needs the complete **keystore** (.jks file) which includes the private key.

## Solution: Two Options

---

### Option 1: Find the Original Keystore File (BEST)

The `.der` file alone is NOT enough. You need to find the **original `.jks` keystore file**.

**Where to look:**

1. Check if `@minhal128__frontend.bak.jks` is the original:
   ```powershell
   keytool -list -v -keystore "@minhal128__frontend.bak.jks"
   ```
   - Enter the password when prompted
   - Look for the SHA1 fingerprint
   - If it matches `05:23:C7:9F:34:E8:6F:5F:DE:C6:CD:9A:ED:FA:AC:C3:B0:A2:85:C8`, **this is it!**

2. Check android directory:
   ```powershell
   Get-ChildItem -Path ".\android" -Recurse -Filter "*.jks"
   ```

3. Search entire project:
   ```powershell
   Get-ChildItem -Path "." -Recurse -Filter "*.jks" -ErrorAction SilentlyContinue
   ```

**If you find the original `.jks` file:**

1. **Upload to EAS:**
   ```powershell
   eas credentials
   ```
   - Select: **Android**
   - Select: **production** (not development!)
   - Select: **Keystore: Manage everything needed to build your project**
   - Select: **Set up a new Keystore**
   - Select: **Upload an existing Keystore**
   - Enter the path to your `.jks` file
   - Enter the keystore password
   - Enter the key alias
   - Enter the key password

2. **Set as default:**
   - Select: **Update default Build Credentials configuration**
   - Select the keystore you just uploaded

3. **Rebuild:**
   ```powershell
   eas build --profile production --platform android --clear-cache
   ```

---

### Option 2: Use Google Play App Signing (EASIER)

If you **cannot find** the original `.jks` file:

#### Step 1: Verify Play App Signing is Enabled

1. Go to **Google Play Console**
2. Navigate to: **Your App** → **Release** → **Setup** → **App Integrity**
3. Click **"App signing"** in the left menu
4. Check if it says **"App signing by Google Play is enabled"**

#### Step 2: Create a New Keystore in EAS

If Play App Signing is enabled, you can create a NEW keystore:

```powershell
eas credentials
```
- Select: **Android**
- Select: **production**
- Select: **Keystore: Manage everything needed to build your project**
- Select: **Set up a new Keystore**
- Select: **Generate new Keystore**
- Confirm the generation

#### Step 3: Build with New Keystore

```powershell
eas build --profile production --platform android
```

#### Step 4: Upload to Internal Testing Track

1. Go to **Google Play Console**
2. Navigate to: **Testing** → **Internal testing**
3. Click **"Create new release"**
4. Upload your AAB file
5. Click **"Review release"** → **"Start rollout to Internal testing"**

Google Play will automatically **re-sign** your app with the correct certificate!

#### Step 5: Promote to Production

Once internal testing works:
1. Go to **Testing** → **Internal testing**
2. Click **"Promote release"** → **"Production"**
3. Follow the prompts

---

## Quick Check: Is the Backup File the Right One?

Run this command to check if your backup keystore is the original:

```powershell
cd H:\Development\remitFlutter\Remit-Frontend
keytool -list -v -keystore "@minhal128__frontend.bak.jks"
```

**What to look for:**
- Certificate fingerprints (SHA1):
- If SHA1 = `05:23:C7:9F:34:E8:6F:5F:DE:C6:CD:9A:ED:FA:AC:C3:B0:A2:85:C8` → **THIS IS THE ONE!**
- If SHA1 = something else → Not the original

**If it IS the original:**
- Note the password you entered
- Note the "Alias name" shown
- Upload this file to EAS using Option 1 above

---

## Common Keystore Passwords

If you don't remember the password, try these common ones:
- `android`
- `123456`
- `password`
- `remitgo`
- Your app name
- Your company name

---

## Summary Commands

**Check your backup keystore:**
```powershell
keytool -list -v -keystore "@minhal128__frontend.bak.jks"
```

**Find all keystore files:**
```powershell
Get-ChildItem -Path "." -Recurse -Filter "*.jks" -ErrorAction SilentlyContinue
```

**Upload to EAS (if you have the correct .jks):**
```powershell
eas credentials
# Select Android → production → Keystore → Set up new → Upload existing
```

**Build with correct keystore:**
```powershell
eas build --profile production --platform android --clear-cache
```

---

**Next Step:** Run the keytool command to check if your backup .jks file is the original!
