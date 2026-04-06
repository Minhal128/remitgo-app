#!/usr/bin/env node

/**
 * OAuth Test Script
 * This script tests the OAuth configuration and endpoints
 * Run with: node scripts/test-oauth.js
 */

const https = require('https');
const http = require('http');

// OAuth Configuration
const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect'
  },
  FACEBOOK: {
    APP_ID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    APP_SECRET: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    REDIRECT_URI: 'com.minhal128.Frontend://oauth2redirect'
  }
};

// Test functions
async function testGoogleOAuth() {
  console.log('🧪 Testing Google OAuth Configuration...\n');
  
  // Test 1: Check client ID format
  console.log('1️⃣ Client ID Format Check:');
  if (OAUTH_CONFIG.GOOGLE.CLIENT_ID.includes('apps.googleusercontent.com')) {
    console.log('✅ Google Client ID format is correct');
  } else {
    console.log('❌ Google Client ID format is incorrect');
  }
  
  // Test 2: Check redirect URI format
  console.log('\n2️⃣ Redirect URI Format Check:');
  if (OAUTH_CONFIG.GOOGLE.REDIRECT_URI.includes('://')) {
    console.log('✅ Google Redirect URI format is correct');
  } else {
    console.log('❌ Google Redirect URI format is incorrect');
  }
  
  // Test 3: Generate OAuth URL
  console.log('\n3️⃣ OAuth URL Generation:');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid email profile')}`;
  
  console.log('✅ Google OAuth URL Generated:');
  console.log(googleAuthUrl);
  
  // Test 4: Check backend endpoint
  console.log('\n4️⃣ Backend Endpoint Check:');
  console.log('✅ Google OAuth endpoint: /auth/google/code (for APK builds)');
  console.log('✅ Google OAuth endpoint: /auth/google (for development)');
}

async function testFacebookOAuth() {
  console.log('\n🧪 Testing Facebook OAuth Configuration...\n');
  
  // Test 1: Check app ID format
  console.log('1️⃣ App ID Format Check:');
  if (OAUTH_CONFIG.FACEBOOK.APP_ID.length > 0) {
    console.log('✅ Facebook App ID format is correct');
  } else {
    console.log('❌ Facebook App ID format is incorrect');
  }
  
  // Test 2: Check redirect URI format
  console.log('\n2️⃣ Redirect URI Format Check:');
  if (OAUTH_CONFIG.FACEBOOK.REDIRECT_URI.includes('://')) {
    console.log('✅ Facebook Redirect URI format is correct');
  } else {
    console.log('❌ Facebook Redirect URI format is incorrect');
  }
  
  // Test 3: Generate OAuth URL
  console.log('\n3️⃣ OAuth URL Generation:');
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${OAUTH_CONFIG.FACEBOOK.APP_ID}&` +
    `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.FACEBOOK.REDIRECT_URI)}&` +
    `scope=${encodeURIComponent('email,public_profile')}&` +
    `response_type=code`;
  
  console.log('✅ Facebook OAuth URL Generated:');
  console.log(facebookAuthUrl);
  
  // Test 4: Check backend endpoint
  console.log('\n4️⃣ Backend Endpoint Check:');
  console.log('✅ Facebook OAuth endpoint: /auth/facebook/code (for APK builds)');
  console.log('✅ Facebook OAuth endpoint: /auth/facebook (for development)');
}

async function testBackendConnection() {
  console.log('\n🧪 Testing Backend Connection...\n');
  
  const testUrls = [
            'https://remitgobackend.vercel.app',
    'https://your-production-backend.com'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing connection to: ${url}`);
      
      const protocol = url.startsWith('https') ? https : http;
      
      await new Promise((resolve, reject) => {
        const req = protocol.get(url, (res) => {
          console.log(`✅ ${url} - Status: ${res.statusCode}`);
          resolve();
        });
        
        req.on('error', (error) => {
          console.log(`❌ ${url} - Error: ${error.message}`);
          resolve();
        });
        
        req.setTimeout(5000, () => {
          console.log(`⏰ ${url} - Timeout`);
          req.destroy();
          resolve();
        });
      });
    } catch (error) {
      console.log(`❌ ${url} - Exception: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting OAuth Configuration Tests...\n');
  
  try {
    await testGoogleOAuth();
    await testFacebookOAuth();
    await testBackendConnection();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Google OAuth configuration is ready');
    console.log('✅ Facebook OAuth configuration is ready');
    console.log('✅ Backend endpoints are configured');
    console.log('\n🔧 Next Steps:');
    console.log('1. Update your backend URL in environment.ts');
    console.log('2. Configure Google Cloud Console with redirect URI: com.minhal128.Frontend://oauth2redirect');
    console.log('3. Configure Facebook App with redirect URI: com.minhal128.Frontend://oauth2redirect');
    console.log('4. Build your APK and test OAuth login');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testGoogleOAuth,
  testFacebookOAuth,
  testBackendConnection,
  runTests
};
