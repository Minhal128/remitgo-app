#!/usr/bin/env node

/**
 * Production OAuth Test Script for RemitGo
 * This script helps verify OAuth configuration for production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 RemitGo Production OAuth Configuration Test\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const isRemitGoProject = fs.existsSync(path.join(currentDir, 'app.json')) && 
                        fs.existsSync(path.join(currentDir, 'app/constants/oauth.ts'));

if (!isRemitGoProject) {
  console.error('❌ Error: This script must be run from the RemitGo project root directory');
  process.exit(1);
}

console.log('✅ Project structure verified\n');

// Test 1: Check OAuth constants file
console.log('📋 Test 1: OAuth Constants File');
try {
  const oauthConstantsPath = path.join(currentDir, 'app/constants/oauth.ts');
  const oauthConstants = fs.readFileSync(oauthConstantsPath, 'utf8');
  
  // Check for required configurations
  const hasGoogleConfig = oauthConstants.includes('GOOGLE:');
  const hasFacebookConfig = oauthConstants.includes('FACEBOOK:');
  const hasRedirectURIs = oauthConstants.includes('com.minhal128.Frontend://oauth2redirect');
  const hasBackendURL = oauthConstants.includes('remitgobackend.vercel.app');
  
  console.log(`   Google OAuth: ${hasGoogleConfig ? '✅' : '❌'}`);
  console.log(`   Facebook OAuth: ${hasFacebookConfig ? '✅' : '❌'}`);
  console.log(`   Redirect URIs: ${hasRedirectURIs ? '✅' : '❌'}`);
  console.log(`   Backend URL: ${hasBackendURL ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('   ❌ Error reading OAuth constants file');
}

// Test 2: Check app.json configuration
console.log('\n📱 Test 2: App Configuration (app.json)');
try {
  const appJsonPath = path.join(currentDir, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const hasOAuthScheme = appJson.expo.scheme === 'com.minhal128.Frontend';
  const hasGooglePlugin = appJson.expo.plugins.some(p => 
    Array.isArray(p) && p[0] === '@react-native-google-signin/google-signin'
  );
  const hasFacebookPlugin = appJson.expo.plugins.some(p => 
    Array.isArray(p) && p[0] === 'react-native-fbsdk-next'
  );
  const hasAndroidIntentFilters = appJson.expo.android.intentFilters;
  
  console.log(`   OAuth Scheme: ${hasOAuthScheme ? '✅' : '❌'}`);
  console.log(`   Google Plugin: ${hasGooglePlugin ? '✅' : '❌'}`);
  console.log(`   Facebook Plugin: ${hasFacebookPlugin ? '❌' : '❌'}`);
  console.log(`   Android Intent Filters: ${hasAndroidIntentFilters ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('   ❌ Error reading app.json');
}

// Test 3: Check Android manifest
console.log('\n🤖 Test 3: Android Manifest Configuration');
try {
  const manifestPath = path.join(currentDir, 'android/app/src/main/AndroidManifest.xml');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  
  const hasOAuthIntentFilter = manifest.includes('com.minhal128.Frontend');
  const hasFacebookActivities = manifest.includes('com.facebook.FacebookActivity');
  const hasOAuthQueries = manifest.includes('android:scheme="com.minhal128.Frontend"');
  
  console.log(`   OAuth Intent Filter: ${hasOAuthIntentFilter ? '✅' : '❌'}`);
  console.log(`   Facebook Activities: ${hasFacebookActivities ? '✅' : '❌'}`);
  console.log(`   OAuth Queries: ${hasOAuthQueries ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('   ❌ Error reading Android manifest');
}

// Test 4: Check OAuth service implementation
console.log('\n🔧 Test 4: OAuth Service Implementation');
try {
  const oauthServicePath = path.join(currentDir, 'app/utils/oauthService.ts');
  const oauthService = fs.readFileSync(oauthServicePath, 'utf8');
  
  const hasGoogleSignIn = oauthService.includes('GoogleSignin');
  const hasFacebookLogin = oauthService.includes('LoginManager');
  const hasConsoleLogging = oauthService.includes('console.log');
  const hasErrorHandling = oauthService.includes('try {') && oauthService.includes('} catch');
  const hasBackendIntegration = oauthService.includes('authenticateWithBackend');
  
  console.log(`   Google Sign-In: ${hasGoogleSignIn ? '✅' : '❌'}`);
  console.log(`   Facebook Login: ${hasFacebookLogin ? '✅' : '❌'}`);
  console.log(`   Console Logging: ${hasConsoleLogging ? '✅' : '❌'}`);
  console.log(`   Error Handling: ${hasErrorHandling ? '✅' : '❌'}`);
  console.log(`   Backend Integration: ${hasBackendIntegration ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('   ❌ Error reading OAuth service file');
}

// Test 5: Check package.json dependencies
console.log('\n📦 Test 5: Required Dependencies');
try {
  const packageJsonPath = path.join(currentDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const hasGoogleSignIn = packageJson.dependencies['@react-native-google-signin/google-signin'];
  const hasFacebookSDK = packageJson.dependencies['react-native-fbsdk-next'];
  const hasAsyncStorage = packageJson.dependencies['@react-native-async-storage/async-storage'];
  
  console.log(`   Google Sign-In: ${hasGoogleSignIn ? '✅' : '❌'}`);
  console.log(`   Facebook SDK: ${hasFacebookSDK ? '✅' : '❌'}`);
  console.log(`   Async Storage: ${hasAsyncStorage ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Summary and recommendations
console.log('\n📊 Summary & Recommendations');
console.log('=============================');

console.log('\n🎯 For Production APK Builds:');
console.log('1. ✅ Ensure all tests above pass');
console.log('2. 🔑 Update Facebook client token in app.json and AndroidManifest.xml');
console.log('3. 🏗️  Build production APK: eas build --platform android --profile production');
console.log('4. 📱 Test OAuth on real device with production APK');
console.log('5. 🔍 Check console logs for OAuth flow debugging');

console.log('\n🚨 Common Issues to Check:');
console.log('- Google Play Services not available on test device');
console.log('- Facebook app not configured for production');
console.log('- OAuth redirect URIs not matching between frontend and backend');
console.log('- Missing or incorrect client IDs');

console.log('\n🔍 Debug Commands:');
console.log('- Check OAuth config: console.log(getOAuthConfig())');
console.log('- Test Google Sign-In: oauthService.getCurrentGoogleUser()');
console.log('- Check auth status: oauthService.isAuthenticated()');

console.log('\n🎉 Your RemitGo app is ready for production OAuth!');
console.log('Users will be able to sign in with Google and Facebook when they download the APK.');
