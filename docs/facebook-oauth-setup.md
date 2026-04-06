# Facebook OAuth Integration Setup Guide

## Overview
This guide covers setting up Facebook OAuth authentication for the RemitGo React Native app and resolving common issues, especially the "This app is not accessible right now" error.

## Current Configuration

### App Configuration
- **Facebook App ID**: `1234567890123456` (configured in `app/constants/oauth.ts`)
- **OAuth Scheme**: `fb1234567890123456` (configured in `app.json`)

### Required Scopes
The app requests the following Facebook permissions:
- `public_profile` - Basic profile information
- `email` - User's email address

## Setup Steps

### 1. Facebook Developer Console Setup

#### Create Facebook App
1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Click **"Create App"** → Select **"Consumer"** or **"Business"**
3. Enter your app name: **"RemitGo"**
4. Add your contact email
5. Create the app

#### Configure App Settings
1. In the **App Dashboard**, go to **Settings** → **Basic**
2. Note down your **App ID** and **App Secret**
3. Add **App Domains**: your website domain (e.g., `remitgo.com`)
4. Set **Privacy Policy URL** and **Terms of Service URL**

### 2. Platform Configuration

#### Add Mobile Platforms
1. In the **App Dashboard**, go to **Settings** → **Basic**
2. Click **"+ Add Platform"**

##### For Android:
- Select **"Android"**
- Package Name: `com.remitgo.app` (or your actual package name)
- Class Name: `com.remitgo.MainActivity`
- **Key Hashes**: Generate using the command below

##### For iOS:
- Select **"iOS"**
- Bundle ID: `com.remitgo.app` (or your actual bundle ID)
- iPhone Store ID: (optional, for App Store apps)

##### For Web (if supporting):
- Select **"Website"**
- Site URL: `https://your-domain.com`

### 3. Generate Android Key Hashes

For development and production, you need to generate key hashes:

#### Development Hash
```bash
# For Windows (using Git Bash or WSL)
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64

# For macOS/Linux
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Default password for debug keystore: `android`

#### Production Hash
```bash
# Replace with your actual keystore details
keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64
```

Add these hashes to your Facebook app under **Android** platform settings.

### 4. Facebook Login Product Setup

1. In **App Dashboard**, go to **Products** → Click **"+ Add Product"**
2. Find **"Facebook Login"** and click **"Set up"**
3. Configure the following settings:

#### Client OAuth Settings
- **Valid OAuth Redirect URIs**:
  ```
  https://auth.expo.io/@your-expo-username/your-app-slug
  ```
  Replace with your actual Expo details.

#### Web OAuth Settings  
- **Valid OAuth Redirect URIs**: Add your website URLs if applicable

### 5. App Review and Permissions

#### Development vs Live Mode
Facebook apps start in **Development Mode** with limited access:

- **Development Mode**: Only developers, testers, and admins can log in
- **Live Mode**: Public access (requires app review for advanced permissions)

#### Add Test Users (For Development)
1. Go to **Roles** → **Test Users**
2. Click **"Add Test Users"**
3. Create test accounts for testing login functionality

#### Add Developers/Admins
1. Go to **Roles** → **Roles**
2. Add team members as **Developers** or **Administrators**
3. They can now log in during development

### 6. Going Live (Production)

#### Basic Permissions
For `public_profile` and `email`, no review is needed. Your app can go live immediately:

1. Go to **Settings** → **Basic**
2. Toggle **"App Mode"** from **Development** to **Live**
3. Ensure all required fields are filled (Privacy Policy, Terms, etc.)

#### Advanced Permissions
If you need additional permissions later, submit for App Review:
1. Go to **App Review** → **Permissions and Features**
2. Request additional permissions as needed
3. Provide detailed use case explanations

## Common Issues and Solutions

### "This app is not accessible right now"

This error occurs when:
1. **App is in Development Mode** and user is not added as Developer/Tester
2. **Missing platform configuration** (Android/iOS not properly set up)
3. **Incorrect key hashes** for Android
4. **Invalid OAuth redirect URIs**

#### Solutions:
1. **Add yourself as Developer**: Go to **Roles** → **Roles** → Add your Facebook account
2. **Verify platform setup**: Ensure Android/iOS platforms are configured with correct package/bundle IDs
3. **Update key hashes**: Regenerate and update Android key hashes
4. **Check redirect URIs**: Ensure Expo OAuth URI is correctly configured
5. **Switch to Live Mode**: If ready for production, switch app mode to Live

### Facebook SDK Errors

#### "Invalid key hash"
- Regenerate key hash using the commands above
- Ensure you're using the correct keystore (debug vs release)
- Add both development and production hashes

#### "App ID not found"
- Verify App ID in `app/constants/oauth.ts`
- Ensure App ID matches Facebook Developer Console

### Network/Authentication Errors

#### CORS Issues (Web)
- Add your domain to **App Domains** in Facebook settings
- Configure **Valid OAuth Redirect URIs** correctly

#### Token Validation Failed
- Verify App Secret is correctly configured on your backend
- Check token expiration and refresh logic

## Code Implementation

### Frontend Error Handling
The app now includes improved error handling for Facebook login issues:

```typescript
// Better error handling for development mode issues
if (errorMsg.includes('app is not accessible')) {
  setSocialError('Facebook login temporarily unavailable. Please try email signup or contact support.');
} else {
  setSocialError('Facebook sign in failed. Please try again.');
}
```

### Backend Verification
Ensure your backend properly validates Facebook tokens:

```javascript
// Verify Facebook access token
const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
```

## Testing Checklist

### Development Testing
- [ ] App ID configured correctly
- [ ] Platform settings (Android/iOS) added
- [ ] Key hashes generated and added
- [ ] Test user or developer account can log in
- [ ] OAuth redirect URIs configured
- [ ] Token validation works on backend

### Production Readiness
- [ ] App switched to Live mode
- [ ] Privacy Policy and Terms of Service URLs added
- [ ] App domains configured
- [ ] Production key hashes added
- [ ] All required app information filled out
- [ ] Basic permissions (public_profile, email) working

## Support and Troubleshooting

### Facebook Developer Resources
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)
- [Platform Setup Guides](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/basic-settings/)

### Debug Tools
- Facebook Debugger: [developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
- Access Token Debugger: Check token validity and permissions

### Contact Support
If you continue experiencing issues:
1. Check Facebook Developer Community forums
2. Submit a support ticket through Facebook Developer Console
3. Review Facebook's status page for platform issues

---

## Next Steps

1. **Immediate**: Add your Facebook account as a Developer/Admin to test login
2. **Short-term**: Add test users for team members to test
3. **Long-term**: Prepare for app review and switch to Live mode when ready for production

This setup should resolve the "app is not accessible" error and provide a robust Facebook OAuth integration for your RemitGo banking app.
