# Fixing google-services.json Missing Error

## Problem
Your EAS build is failing because the `google-services.json` file is missing. This file is required for Google services (Firebase, Google Sign-In) on Android.

## Solution Options

### Option 1: Create google-services.json file (Recommended)

1. **Get the file from Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create one)
   - Go to Project Settings (gear icon)
   - In "Your apps" section, click "Add app" → Android
   - Use package name: `com.minhal128.Frontend`
   - Download the `google-services.json` file

2. **Place the file:**
   - Put the downloaded `google-services.json` in `android/app/` directory
   - Make sure it's not tracked by git (add to .gitignore if needed)

3. **Run the build:**
   ```bash
   eas build --profile development --platform android
   ```

### Option 2: Use EAS Environment Variables (Automated)

1. **Get your google-services.json content:**
   - Download the file from Firebase Console as above
   - Copy the entire content of the file

2. **Set the environment variable:**
   ```bash
   eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "PASTE_YOUR_JSON_CONTENT_HERE"
   ```

3. **Update the placeholder in eas.json:**
   - Replace `"GOOGLE_SERVICES_JSON_CONTENT"` with the actual secret name in eas.json
   - The prebuild script will automatically create the file during build

4. **Run the build:**
   ```bash
   eas build --profile development --platform android
   ```

## How It Works

The `eas.json` now includes:
- `prebuildCommand: "node prebuild.js"` - Runs before each build
- `GOOGLE_SERVICES_JSON` environment variable - Contains your JSON content

The `prebuild.js` script automatically:
1. Reads the environment variable
2. Creates the `android/app/google-services.json` file
3. Ensures the build has the required file

## Files Created/Modified

- `eas.json` - Added environment variable and prebuildCommand
- `prebuild.js` - Script that creates google-services.json from env var
- `google-services-template.json` - Template showing required structure

## Next Steps

1. Choose either Option 1 or Option 2 above
2. Follow the steps for your chosen option
3. Run the build command again

The build should now succeed with the google-services.json file properly configured.
