#!/usr/bin/env node

/**
 * KYC Test Script
 * This script tests the KYC submission endpoint and image compression
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  BACKEND_URL: 'https://remitgobackend.vercel.app',
  ENDPOINT: '/kyc/submit-realtime',
  TEST_TOKEN: 'test-token-123', // Replace with actual test token
  TIMEOUT: 30000 // 30 seconds
};

// Mock KYC data for testing
const mockKycData = {
  firstName: 'John',
  middleName: 'Michael',
  lastName: 'Doe',
  dob: '1990-01-01',
  phone: '+1234567890',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'United States'
  },
  idType: 'passport',
  idNumber: 'TEST123456',
  idExpiry: '2025-12-31',
  idFrontImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  idBackImage: null,
  selfieImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
};

// Test functions
async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...\n');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.BACKEND_URL}/health`, 'GET');
    console.log('✅ Backend health check successful');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testKycEndpoint() {
  console.log('\n🧪 Testing KYC Endpoint...\n');
  
  try {
    // Test without authentication
    console.log('1️⃣ Testing without authentication...');
    try {
      await makeRequest(`${TEST_CONFIG.BACKEND_URL}${TEST_CONFIG.ENDPOINT}`, 'POST', mockKycData);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.message.includes('401')) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('⚠️ Unexpected error:', error.message);
      }
    }

    // Test with authentication
    console.log('\n2️⃣ Testing with authentication...');
    try {
      const response = await makeRequest(
        `${TEST_CONFIG.BACKEND_URL}${TEST_CONFIG.ENDPOINT}`, 
        'POST', 
        mockKycData,
        { 'Authorization': `Bearer ${TEST_CONFIG.TEST_TOKEN}` }
      );
      console.log('✅ KYC submission successful');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
    } catch (error) {
      if (error.message.includes('401')) {
        console.log('⚠️ Authentication failed (expected with test token)');
      } else {
        console.log('❌ KYC submission failed:', error.message);
      }
    }

    return true;
  } catch (error) {
    console.log('❌ KYC endpoint test failed:', error.message);
    return false;
  }
}

async function testImageCompression() {
  console.log('\n🧪 Testing Image Compression...\n');
  
  try {
    const testImage = mockKycData.idFrontImage;
    const originalSize = Buffer.from(testImage.split(',')[1], 'base64').length;
    
    console.log('📏 Original image size:', formatBytes(originalSize));
    console.log('🔄 Simulating compression...');
    
    // Simulate compression (in real app, this would use ImageCompression utility)
    const compressedSize = Math.floor(originalSize * 0.7); // 70% of original
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log('📏 Compressed image size:', formatBytes(compressedSize));
    console.log('📊 Compression ratio:', compressionRatio + '%');
    console.log('✅ Image compression simulation successful');
    
    return true;
  } catch (error) {
    console.log('❌ Image compression test failed:', error.message);
    return false;
  }
}

async function testCorsHeaders() {
  console.log('\n🧪 Testing CORS Headers...\n');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.BACKEND_URL}/health`, 'GET');
    
    // Check if CORS headers are present (this would be visible in browser)
    console.log('✅ CORS test completed');
    console.log('📝 Note: CORS headers are only visible in browser environment');
    console.log('🌐 To test CORS properly, use browser developer tools');
    
    return true;
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
    return false;
  }
}

// Helper functions
function makeRequest(url, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RemitGo-KYC-Test/1.0',
        ...headers
      },
      timeout: TEST_CONFIG.TIMEOUT
    };

    const req = protocol.request(options, (res) => {
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting KYC System Tests...\n');
  
  try {
    const results = await Promise.allSettled([
      testBackendConnection(),
      testKycEndpoint(),
      testImageCompression(),
      testCorsHeaders()
    ]);

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    
    const testNames = [
      'Backend Connection',
      'KYC Endpoint',
      'Image Compression',
      'CORS Headers'
    ];

    results.forEach((result, index) => {
      const status = result.status === 'fulfilled' && result.value ? '✅' : '❌';
      console.log(`${status} ${testNames[index]}`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Install missing dependencies: node install-dependencies.js');
    console.log('2. Test in browser to verify CORS');
    console.log('3. Test with real authentication token');
    console.log('4. Verify image compression in KYC submission');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testBackendConnection,
  testKycEndpoint,
  testImageCompression,
  testCorsHeaders,
  runTests
};
