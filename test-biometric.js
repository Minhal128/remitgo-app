// Test script for biometric authentication
const { testBiometricSetup, resetBiometricForTesting, simulateBiometricSetup } = require('./app/utils/testBiometricAuth');

async function runTests() {
  console.log('🚀 Starting Biometric Authentication Tests...\n');
  
  try {
    // Test 1: Check current biometric status
    console.log('='.repeat(50));
    console.log('TEST 1: Current Biometric Status');
    console.log('='.repeat(50));
    await testBiometricSetup();
    
    console.log('\n');
    
    // Test 2: Simulate setup flow
    console.log('='.repeat(50));
    console.log('TEST 2: Setup Flow Simulation');
    console.log('='.repeat(50));
    await simulateBiometricSetup();
    
    console.log('\n');
    
    // Test 3: Reset configuration (optional)
    console.log('='.repeat(50));
    console.log('TEST 3: Configuration Reset (Optional)');
    console.log('='.repeat(50));
    console.log('To reset biometric configuration, uncomment the next line:');
    console.log('// await resetBiometricForTesting();');
    
    // Uncomment the line below if you want to reset the configuration
    // await resetBiometricForTesting();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run the tests
runTests().then(() => {
  console.log('\n✅ All tests completed!');
}).catch((error) => {
  console.error('\n❌ Test execution failed:', error);
});


