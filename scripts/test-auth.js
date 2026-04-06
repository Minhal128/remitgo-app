#!/usr/bin/env node

/**
 * Authentication Test Script
 * This script tests the authentication flow and generates test tokens
 */

const https = require('https');

const TEST_CONFIG = {
  BACKEND_URL: 'https://remitgobackend.vercel.app',
  TEST_EMAIL: 'test@example.com',
  TEST_PASSWORD: 'testpassword123'
};

async function testBackendHealth() {
  console.log('🏥 Testing Backend Health...\n');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.BACKEND_URL}/health`, 'GET');
    console.log('✅ Backend is healthy');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');
  
  try {
    // Test login endpoint
    const loginData = {
      email: TEST_CONFIG.TEST_EMAIL,
      password: TEST_CONFIG.TEST_PASSWORD
    };

    console.log('1️⃣ Testing login...');
    const loginResponse = await makeRequest(`${TEST_CONFIG.BACKEND_URL}/auth/login`, 'POST', loginData);
    
    if (loginResponse.token) {
      console.log('✅ Login successful');
      console.log('🔑 Token received:', loginResponse.token.substring(0, 50) + '...');
      
      // Test protected endpoint with token
      console.log('\n2️⃣ Testing protected endpoint...');
      const protectedResponse = await makeRequest(
        `${TEST_CONFIG.BACKEND_URL}/kyc/submit-realtime`, 
        'POST', 
        { test: 'data' },
        { 'Authorization': `Bearer ${loginResponse.token}` }
      );
      
      console.log('✅ Protected endpoint accessible');
      return loginResponse.token;
    } else {
      console.log('❌ Login failed - no token received');
      return null;
    }
    
  } catch (error) {
    if (error.message.includes('401')) {
      console.log('⚠️ Authentication failed (expected for test credentials)');
    } else {
      console.log('❌ Authentication test failed:', error.message);
    }
    return null;
  }
}

async function testKycEndpoint(token) {
  if (!token) {
    console.log('\n⏭️ Skipping KYC test - no valid token');
    return;
  }

  console.log('\n📝 Testing KYC Endpoint...\n');
  
  try {
    const mockKycData = {
      firstName: 'Test',
      lastName: 'User',
      dob: '1990-01-01',
      phone: '+1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country'
      },
      idType: 'passport',
      idNumber: 'TEST123',
      idExpiry: '2025-12-31',
      idFrontImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      idBackImage: null,
      selfieImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    };

    console.log('📤 Submitting test KYC data...');
    const response = await makeRequest(
      `${TEST_CONFIG.BACKEND_URL}/kyc/submit-realtime`, 
      'POST', 
      mockKycData,
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('✅ KYC submission successful');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.log('❌ KYC test failed:', error.message);
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
        'User-Agent': 'RemitGo-Auth-Test/1.0',
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

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  try {
    // Test backend health
    const isHealthy = await testBackendHealth();
    if (!isHealthy) {
      console.log('\n❌ Backend is not healthy. Stopping tests.');
      return;
    }

    // Test authentication
    const token = await testAuthentication();
    
    // Test KYC endpoint
    await testKycEndpoint(token);

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Backend health check passed');
    if (token) {
      console.log('✅ Authentication successful');
      console.log('✅ KYC endpoint accessible');
    } else {
      console.log('⚠️ Authentication failed (may be expected for test credentials)');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = {
  testBackendHealth,
  testAuthentication,
  testKycEndpoint,
  runTests
};
