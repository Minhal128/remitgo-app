# Facebook OAuth Setup Guide

## Current Issue: "This app is not accessible right now"

This error occurs when the Facebook app is not properly configured or is still in development mode. Here's how to fix it:

## Step-by-Step Facebook App Configuration

### 1. Facebook Developer Console Setup

1. **Go to Facebook Developers Console**: https://developers.facebook.com/
2. **Create or Access Your App**:
   - App ID: `728481893329363`
   - App Name: `RemitGo`

### 2. Configure Facebook Login Product

1. **Add Facebook Login**:
   - Go to your app dashboard
   - Click "+ Add a Product"
   - Select "Facebook Login" → "Set Up"

2. **Configure Valid OAuth Redirect URIs**:
   ```
   Web:
   - https://auth.expo.io/@minhal128/Frontend
   - http://localhost:8081/
   - http://localhost:8082/
   - http://localhost:3000/
   
   Mobile:
   - fb728481893329363://authorize
   - exp://127.0.0.1:8081
   - exp://localhost:8081
   ```

### 3. App Platform Configuration

#### For Android:
1. Go to **Settings** → **Basic**
2. Click **"+ Add Platform"** → **Android**
3. Configure:
   - **Package Name**: `com.minhal128.Frontend`
   - **Class Name**: `com.minhal128.Frontend.MainActivity`
   - **Key Hashes**: (Generate using steps below)

#### For iOS:
1. Go to **Settings** → **Basic**
2. Click **"+ Add Platform"** → **iOS**
3. Configure:
   - **Bundle ID**: `com.minhal128.Frontend`
   - **iPhone Store ID**: (Leave empty for now)

#### For Web:
1. Go to **Settings** → **Basic**
2. Click **"+ Add Platform"** → **Website**
3. Configure:
   - **Site URL**: `http://localhost:8081/`

### 4. Generate Android Key Hash

For development (debug keystore):
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Password: `android`

For Windows users:
```bash
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore | openssl sha1 -binary | openssl base64
```

### 5. App Review and Permissions

#### Basic Permissions (Always Available):
- `public_profile`
- `email`

#### For Production (Requires Review):
If you need additional permissions like `user_friends`, you'll need to submit for review.

### 6. Make App Live (Important!)

**This is likely the main issue causing your error:**

1. Go to **App Review** → **Permissions and Features**
2. Make sure your app has the necessary permissions
3. Go to **App Review** → **Requests**
4. If you're ready for production, submit for review
5. **OR** for development/testing:
   - Go to **Roles** → **Roles**
   - Add test users or developers
   - Only these users can log in during development

### 7. Development vs Production Mode

#### Development Mode (Current Issue):
- Only developers and test users can log in
- Other users see "This app is not accessible right now"
- **Solution**: Add users as "App Testers" or make app live

#### Add Test Users:
1. Go to **Roles** → **Roles**
2. Click **"Add Testers"**
3. Add email addresses of users who should be able to test
4. They'll receive an invitation to test the app

### 8. Quick Fix for Immediate Testing

**Option A: Add Yourself as Developer**
1. Go to **Roles** → **Roles**
2. Add your Facebook account as **Developer** or **Tester**
3. Try login again

**Option B: Use Facebook Test User**
1. Go to **Roles** → **Test Users**
2. Click **"Add test users"**
3. Create test accounts
4. Use these for testing OAuth

### 9. App Configuration Check

Verify in **Settings** → **Basic**:
- ✅ **App ID**: `728481893329363`
- ✅ **App Secret**: (Should be configured in backend)
- ✅ **Display Name**: `RemitGo`
- ✅ **App Domain**: `localhost` (for development)
- ✅ **Privacy Policy URL**: (Add when going live)
- ✅ **Terms of Service URL**: (Add when going live)

### 10. Backend Configuration

Ensure your backend has:
```env
FACEBOOK_APP_ID=728481893329363
FACEBOOK_APP_SECRET=your_app_secret_here
```

### 11. Common Issues and Solutions

#### Issue: "URL not allowed by application configuration"
**Solution**: Add the redirect URL to Facebook Login settings

#### Issue: "This app is not accessible"  
**Solution**: Add test users or make app live

#### Issue: "Invalid app_id parameter"
**Solution**: Check that app ID matches in all configurations

#### Issue: "App not setup for Facebook login"
**Solution**: Ensure Facebook Login product is added and configured

### 12. Testing Steps

1. **Clear browser cache** and app data
2. **Restart Expo development server**:
   ```bash
   npm start -- --clear
   ```
3. **Test with different users**:
   - Developer account (should work)
   - Test user (should work)  
   - Regular user (might not work in dev mode)

### 13. Production Checklist

Before making the app live:
- [ ] Add Privacy Policy URL
- [ ] Add Terms of Service URL
- [ ] Configure proper App Domain
- [ ] Test all OAuth flows
- [ ] Submit for App Review if needed
- [ ] Switch to Live mode

## Current Configuration Status

✅ **App ID**: `728481893329363`  
✅ **App.json**: Updated with Facebook scheme  
✅ **OAuth Config**: Updated with correct App ID  
⚠️ **Facebook App Status**: Likely in Development Mode  
❌ **Test Users**: Need to be added  

## Next Steps to Fix the Issue

1. **Immediate Fix**: Add your Facebook account as a Developer/Tester in the Facebook app
2. **Short-term**: Add test users for your team
3. **Long-term**: Complete app review process for public access

The error you're seeing is almost certainly because the Facebook app is in development mode and your account is not added as a developer or tester.
