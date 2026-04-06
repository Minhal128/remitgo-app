#!/usr/bin/env node

/**
 * Test Script for Google Sign-In Configuration
 * Run this to verify your Google Sign-In setup
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Google Sign-In Configuration...\n');

// Test 1: Check if required packages are installed
console.log('📦 Checking required packages...');
try {
  // Check package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredPackages = [
      '@react-native-google-signin/google-signin',
      '@react-native-async-storage/async-storage',
      'react-native-fbsdk-next'
    ];
    
    let allPackagesInstalled = true;
    requiredPackages.forEach(pkg => {
      if (packageJson.dependencies[pkg]) {
        console.log(`✅ ${pkg} - Version: ${packageJson.dependencies[pkg]}`);
      } else {
        console.log(`❌ ${pkg} - NOT INSTALLED`);
        allPackagesInstalled = false;
      }
    });
    
    if (allPackagesInstalled) {
      console.log('\n🎉 All required packages are installed!');
    } else {
      console.log('\n⚠️  Some required packages are missing. Please install them first.');
    }
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n🔧 Checking app configuration...');

// Test 2: Check app.json configuration
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Check Google Sign-In plugin
    const googleSignInPlugin = appJson.expo.plugins?.find(
      plugin => Array.isArray(plugin) && plugin[0] === '@react-native-google-signin/google-signin'
    );
    
    if (googleSignInPlugin) {
      console.log('✅ Google Sign-In plugin configured in app.json');
      console.log('   iOS URL Scheme:', googleSignInPlugin[1]?.iosUrlScheme || 'Not configured');
    } else {
      console.log('❌ Google Sign-In plugin NOT configured in app.json');
    }
    
    // Check Facebook SDK plugin
    const facebookPlugin = appJson.expo.plugins?.find(
      plugin => Array.isArray(plugin) && plugin[0] === 'react-native-fbsdk-next'
    );
    
    if (facebookPlugin) {
      console.log('✅ Facebook SDK plugin configured in app.json');
      console.log('   App ID:', facebookPlugin[1]?.appID || 'Not configured');
    } else {
      console.log('❌ Facebook SDK plugin NOT configured in app.json');
    }
  }
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Test 3: Check if service files exist
console.log('\n📁 Checking service files...');
const serviceFiles = [
  'app/utils/googleSignInService.ts',
  'app/utils/facebookSignInService.ts',
  'app/constants/googleSignInConfig.ts'
];

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 4: Check configuration values
console.log('\n🔑 Checking configuration values...');
try {
  const configPath = path.join(__dirname, 'app/constants/googleSignInConfig.ts');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for client IDs
    const webClientIdMatch = configContent.match(/WEB_CLIENT_ID:\s*'([^']+)'/);
    const iosClientIdMatch = configContent.match(/IOS_CLIENT_ID:\s*'([^']+)'/);
    
    if (webClientIdMatch) {
      console.log('✅ Web Client ID configured:', webClientIdMatch[1]);
    } else {
      console.log('❌ Web Client ID not configured');
    }
    
    if (iosClientIdMatch) {
      console.log('✅ iOS Client ID configured:', iosClientIdMatch[1]);
    } else {
      console.log('❌ iOS Client ID not configured');
    }
  }
} catch (error) {
  console.log('❌ Error reading configuration:', error.message);
}

console.log('\n📋 Summary of what to verify:');
console.log('1. ✅ All required packages are installed');
console.log('2. ✅ Google Sign-In plugin is configured in app.json');
console.log('3. ✅ Facebook SDK plugin is configured in app.json');
console.log('4. ✅ Service files exist');
console.log('5. ✅ Client IDs are configured correctly');
console.log('6. ✅ Google Cloud Console is set up with correct OAuth credentials');
console.log('7. ✅ Facebook Developer Console is configured');

console.log('\n🚀 Next steps:');
console.log('1. Run your app on a real device or emulator');
console.log('2. Test Google Sign-In by tapping "Continue with Google"');
console.log('3. Test Facebook Sign-In by tapping "Continue with Facebook"');
console.log('4. Check console logs for any errors');
console.log('5. Verify user data is received after authentication');

console.log('\n💡 If you encounter issues:');
console.log('- Check the console logs for detailed error messages');
console.log('- Verify your Google Cloud Console configuration');
console.log('- Ensure you have Google Play Services on Android');
console.log('- Test on physical devices, not just emulators');

console.log('\n🎉 Configuration test complete!');
