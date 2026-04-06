import biometricAuthService from './biometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const testBiometricSetup = async () => {
  console.log('🧪 Testing Biometric Authentication Setup...\n');

  try {
    // 1. Check device support
    console.log('1️⃣ Checking device support...');
    const isSupported = await biometricAuthService.isSupported();
    console.log(`   Device supports biometrics: ${isSupported ? '✅ Yes' : '❌ No'}`);

    // 2. Check current configuration
    console.log('\n2️⃣ Checking current configuration...');
    const config = await biometricAuthService.getBiometricConfig();
    console.log(`   Current config: ${config ? '✅ Found' : '❌ None'}`);
    if (config) {
      console.log(`   - Enabled: ${config.enabled}`);
      console.log(`   - Type: ${config.type}`);
      console.log(`   - User ID: ${config.userId}`);
      console.log(`   - Setup Date: ${config.setupDate}`);
    }

    // 3. Check if setup is required
    console.log('\n3️⃣ Checking if setup is required...');
    const setupRequired = await biometricAuthService.isSetupRequired();
    console.log(`   Setup required: ${setupRequired ? '✅ Yes' : '❌ No'}`);

    // 4. Check device registration
    console.log('\n4️⃣ Checking device registration...');
    const deviceRegistered = await biometricAuthService.isDeviceRegistered();
    console.log(`   Device registered: ${deviceRegistered ? '✅ Yes' : '❌ No'}`);

    // 5. Check user authentication
    console.log('\n5️⃣ Checking user authentication...');
    const userData = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token');
    console.log(`   User data: ${userData ? '✅ Found' : '❌ None'}`);
    console.log(`   Auth token: ${token ? '✅ Found' : '❌ None'}`);

    if (userData) {
      const user = JSON.parse(userData);
      console.log(`   - User ID: ${user._id || user.id}`);
      console.log(`   - Email: ${user.email}`);
    }

    // 6. Get debug status
    console.log('\n6️⃣ Getting comprehensive debug status...');
    const debugStatus = await biometricAuthService.debugBiometricStatus();
    console.log('   Debug Status:', debugStatus);

    // 7. Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   Device Support: ${isSupported ? '✅' : '❌'}`);
    console.log(`   Setup Required: ${setupRequired ? '✅' : '❌'}`);
    console.log(`   User Authenticated: ${userData && token ? '✅' : '❌'}`);
    console.log(`   Ready for Setup: ${isSupported && setupRequired && userData && token ? '✅' : '❌'}`);

    if (isSupported && setupRequired && userData && token) {
      console.log('\n🎉 Device is ready for biometric setup!');
    } else {
      console.log('\n⚠️  Some requirements are not met:');
      if (!isSupported) console.log('   - Device does not support biometrics');
      if (!setupRequired) console.log('   - Biometric already set up');
      if (!userData || !token) console.log('   - User not authenticated');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

export const resetBiometricForTesting = async () => {
  console.log('🔄 Resetting biometric configuration for testing...');
  
  try {
    await biometricAuthService.resetBiometricConfig();
    console.log('✅ Biometric configuration reset successfully');
    console.log('🔄 You can now test the setup flow again');
  } catch (error) {
    console.error('❌ Failed to reset biometric configuration:', error);
  }
};

export const simulateBiometricSetup = async () => {
  console.log('🎭 Simulating biometric setup flow...');
  
  try {
    // Check if setup is possible
    const isSupported = await biometricAuthService.isSupported();
    const setupRequired = await biometricAuthService.isSetupRequired();
    const userData = await AsyncStorage.getItem('user');
    
    if (!isSupported) {
      console.log('❌ Device does not support biometrics');
      return;
    }
    
    if (!setupRequired) {
      console.log('❌ Biometric already set up');
      return;
    }
    
    if (!userData) {
      console.log('❌ User not authenticated');
      return;
    }
    
    console.log('✅ All conditions met, ready to test setup');
    console.log('📱 Navigate to the biometric setup screen to continue');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error);
  }
};

// Add default export to fix expo-router error
export default {
  testBiometricSetup,
  resetBiometricForTesting,
  simulateBiometricSetup
};


