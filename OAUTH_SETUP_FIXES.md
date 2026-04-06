# OAuth Setup Fixes Required

## Facebook App Configuration Issues

### Problem
Your Facebook app shows "App not active: This app is not accessible right now" because it's in development mode.

### Solutions

#### Option 1: Set Facebook App to Live (Recommended for Production)
1. Go to [Facebook Developers Console](https://developers.facebook.com/apps/)
2. Select your app (ID: 1588070905086816)
3. Go to **App Review** → **Permissions and Features**
4. Request review for `public_profile` and `email` permissions
5. Once approved, toggle **App Mode** from "Development" to "Live"

#### Option 2: Add Test Users (Quick Fix for Development)
1. Go to **Roles** → **Test Users**
2. Add test users or use your personal Facebook account
3. Test users can use the app even in development mode

#### Option 3: Use Different Facebook App
Create a new Facebook app specifically for development:
1. Create new app at [Facebook Developers](https://developers.facebook.com/apps/)
2. Set it to "Development" mode
3. Add your Facebook account as a test user
4. Update the App ID in your `.env` file

## Google OAuth Configuration

### Current Issues
- Redirect URI might not be properly configured in Google Console
- Need to verify OAuth consent screen setup

### Required Google Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create new one
3. Enable **Google+ API** and **Google OAuth2 API**
4. Go to **APIs & Services** → **Credentials**
5. Edit your OAuth 2.0 Client ID
6. Add these redirect URIs:
   ```
   com.minhal128.Frontend://oauth2redirect
   https://auth.expo.io/@your-expo-username/your-app-slug
   exp://localhost:8081/--/oauth2redirect
   ```
7. Go to **OAuth consent screen**
8. Add your email to test users if app is in testing mode

## Environment Variables Check

Your current `.env` file:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=228960495612-aa7g0vk5l4s2vc6navoa1ll2qhsf9hpm.apps.googleusercontent.com
EXPO_PUBLIC_FACEBOOK_APP_ID=1588070905086816
EXPO_PUBLIC_REDIRECT_URI=com.minhal128.Frontend://oauth2redirect
```

## Testing Steps

1. **For Facebook**: Either set app to Live or add yourself as test user
2. **For Google**: Verify redirect URIs in Google Console
3. **Restart Expo**: `npx expo start --clear`
4. **Test on device**: Use physical device for best results

## Quick Development Fix

For immediate testing, I recommend:
1. Add yourself as Facebook test user (fastest)
2. Verify Google Console redirect URIs
3. Test with the updated configuration
