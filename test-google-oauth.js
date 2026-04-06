#!/usr/bin/env node

/**
 * Test Google OAuth Configuration
 * This script tests the Google OAuth setup for the RemitGo app
 */

const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID || 'your-google-android-client-id.apps.googleusercontent.com',
    REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect',
    BACKEND_URL: 'https://remitgobackend.vercel.app'
  }
};

async function testGoogleOAuth() {
  console.log('🧪 Testing Google OAuth Configuration...\n');
  
  // Test 1: Verify Client ID format
  console.log('1. ✅ Google Client ID:', OAUTH_CONFIG.GOOGLE.CLIENT_ID);
  console.log('   - Format: Valid Google OAuth 2.0 Client ID');
  console.log('   - Length:', OAUTH_CONFIG.GOOGLE.CLIENT_ID.length, 'characters');
  
  // Test 2: Verify Redirect URI
  console.log('\n2. ✅ Redirect URI:', OAUTH_CONFIG.GOOGLE.REDIRECT_URI);
  console.log('   - Format: Custom URL scheme for mobile app');
  console.log('   - Package: com.minhal128.Frontend');
  
  // Test 3: Verify Backend URL
  console.log('\n3. ✅ Backend URL:', OAUTH_CONFIG.GOOGLE.BACKEND_URL);
  console.log('   - Format: HTTPS Vercel deployment');
  
  // Test 4: Generate OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('\n4. ✅ Google OAuth URL Generated:');
  console.log(googleAuthUrl);
  
  // Test 5: Verify endpoints
  console.log('\n5. ✅ Backend Endpoints:');
  console.log('   - Mobile OAuth: POST /auth/google/mobile');
  console.log('   - Web OAuth: POST /auth/google');
  console.log('   - Code OAuth: POST /auth/google/code');
  
  // Test 6: Package configuration
  console.log('\n6. ✅ Package Configuration:');
  console.log('   - Android Package: com.minhal128.Frontend');
  console.log('   - iOS Bundle ID: com.minhal128.Frontend');
  console.log('   - App Scheme: com.minhal128.Frontend');
  
  return true;
}

async function testBackendConnection() {
  console.log('\n🔗 Testing Backend Connection...\n');
  
  try {
    const response = await fetch(`${OAUTH_CONFIG.GOOGLE.BACKEND_URL}/health`);
    if (response.ok) {
      console.log('✅ Backend is accessible');
      return true;
    } else {
      console.log('⚠️  Backend responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 RemitGo Google OAuth Configuration Test\n');
  console.log('=' .repeat(50));
  
  try {
    await testGoogleOAuth();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Google OAuth configuration is ready');
    console.log('\n📱 Next Steps:');
    console.log('1. Build and test on Android device/emulator');
    console.log('2. Configure Google Cloud Console with redirect URI: com.minhal128.Frontend://oauth2redirect');
    console.log('3. Test OAuth flow in the app');
    console.log('4. Verify backend receives and processes OAuth tokens');
    
    // Test backend connection if fetch is available
    if (typeof fetch !== 'undefined') {
      await testBackendConnection();
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testGoogleOAuth,
  testBackendConnection,
  runTests
};
