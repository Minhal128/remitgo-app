#!/usr/bin/env node

/**
 * Development User Setup Script
 * This script creates a development user for testing authentication
 */

const https = require('https');

const DEV_CONFIG = {
  BACKEND_URL: 'https://remitgobackend.vercel.app',
  DEV_USER: {
    email: 'dev@remitgo.com',
    password: 'devpassword123',
    firstName: 'Development',
    lastName: 'User',
    phone: '+1234567890'
  }
};

async function setupDevUser() {
  console.log('👤 Setting up Development User...\n');
  
  try {
    // First check if user already exists
    console.log('1️⃣ Checking if user exists...');
    try {
      const loginResponse = await makeRequest(`${DEV_CONFIG.BACKEND_URL}/auth/login`, 'POST', {
        email: DEV_CONFIG.DEV_USER.email,
        password: DEV_CONFIG.DEV_USER.password
      });
      
      if (loginResponse.token) {
        console.log('✅ User already exists and can login');
        console.log('🔑 Token:', loginResponse.token.substring(0, 50) + '...');
        return loginResponse.token;
      }
    } catch (error) {
      if (error.message.includes('401')) {
        console.log('⚠️ User exists but password is wrong, or user not found');
      } else {
        console.log('⚠️ Login check failed:', error.message);
      }
    }

    // Try to create user
    console.log('\n2️⃣ Creating new development user...');
    try {
      const signupResponse = await makeRequest(`${DEV_CONFIG.BACKEND_URL}/auth/signup`, 'POST', {
        email: DEV_CONFIG.DEV_USER.email,
        password: DEV_CONFIG.DEV_USER.password,
        firstName: DEV_CONFIG.DEV_USER.firstName,
        lastName: DEV_CONFIG.DEV_USER.lastName,
        phone: DEV_CONFIG.DEV_USER.phone
      });
      
      if (signupResponse.token) {
        console.log('✅ User created successfully');
        console.log('🔑 Token:', signupResponse.token.substring(0, 50) + '...');
        return signupResponse.token;
      } else {
        console.log('⚠️ User creation response:', signupResponse);
      }
    } catch (error) {
      if (error.message.includes('409')) {
        console.log('⚠️ User already exists, trying to reset password...');
        // Try password reset or admin endpoint
        return await tryPasswordReset();
      } else {
        console.log('❌ User creation failed:', error.message);
        return null;
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return null;
  }
}

async function tryPasswordReset() {
  console.log('\n3️⃣ Attempting password reset...');
  
  try {
    // This would require a password reset endpoint
    console.log('⚠️ Password reset not implemented yet');
    console.log('💡 You may need to manually create the user in the database');
    return null;
  } catch (error) {
    console.log('❌ Password reset failed:', error.message);
    return null;
  }
}

async function testDevUser(token) {
  if (!token) {
    console.log('\n⏭️ Skipping dev user test - no valid token');
    return;
  }

  console.log('\n🧪 Testing Development User...\n');
  
  try {
    // Test user profile
    console.log('1️⃣ Testing user profile access...');
    const profileResponse = await makeRequest(
      `${DEV_CONFIG.BACKEND_URL}/auth/profile`, 
      'GET', 
      null,
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('✅ Profile access successful');
    console.log('👤 User:', profileResponse.user || profileResponse);
    
    // Test KYC endpoint
    console.log('\n2️⃣ Testing KYC endpoint access...');
    const kycResponse = await makeRequest(
      `${DEV_CONFIG.BACKEND_URL}/kyc/submit-realtime`, 
      'POST', 
      { test: 'data' },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('✅ KYC endpoint accessible');
    
  } catch (error) {
    console.log('❌ Dev user test failed:', error.message);
  }
}

function makeRequest(url, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RemitGo-Dev-Setup/1.0',
        ...headers
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsedData.message || responseData}`));
          }
        } catch (error) {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runSetup() {
  console.log('🚀 Starting Development User Setup...\n');
  
  try {
    // Setup development user
    const token = await setupDevUser();
    
    // Test the user
    await testDevUser(token);

    console.log('\n🎉 Setup completed!');
    console.log('\n📋 Summary:');
    if (token) {
      console.log('✅ Development user ready');
      console.log('🔑 Token available for testing');
      console.log('📝 Use these credentials in your app:');
      console.log(`   Email: ${DEV_CONFIG.DEV_USER.email}`);
      console.log(`   Password: ${DEV_CONFIG.DEV_USER.password}`);
    } else {
      console.log('⚠️ Development user setup incomplete');
      console.log('💡 You may need to manually create the user');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

if (require.main === module) {
  runSetup();
}

module.exports = {
  setupDevUser,
  testDevUser,
  runSetup
};
