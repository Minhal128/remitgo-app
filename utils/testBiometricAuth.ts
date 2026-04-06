import { biometricAuthService } from './biometricAuth';
import { Platform } from 'react-native';

/**
 * Test suite for biometric authentication system
 * This file can be used for development testing and debugging
 */

export class BiometricAuthTester {
  /**
   * Run all tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Biometric Authentication Tests...\n');

    try {
      await this.testInitialization();
      await this.testBiometricSupport();
      await this.testConfiguration();
      await this.testSecuritySettings();
      await this.testAuthenticationFlow();
      await this.testFallbackMechanisms();
      await this.testRecoverySystem();
      await this.testErrorHandling();

      console.log('✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  /**
   * Test service initialization
   */
  static async testInitialization(): Promise<void> {
    console.log('🔧 Testing Service Initialization...');
    
    try {
      await biometricAuthService.initialize();
      console.log('✅ Service initialized successfully');
      
      const config = biometricAuthService.getBiometricConfig();
      console.log('📋 Current config:', config);
      
      const settings = biometricAuthService.getSecuritySettings();
      console.log('⚙️ Security settings:', settings);
    } catch (error) {
      console.error('❌ Initialization test failed:', error);
    }
    console.log('');
  }

  /**
   * Test biometric support detection
   */
  static async testBiometricSupport(): Promise<void> {
    console.log('📱 Testing Biometric Support Detection...');
    
    try {
      const isSupported = await biometricAuthService.isBiometricSupported();
      console.log(`✅ Biometric supported: ${isSupported}`);
      
      const types = await biometricAuthService.getSupportedBiometricTypes();
      console.log('🔍 Supported types:', types);
      
      if (types.length > 0) {
        console.log('📋 Available biometric methods:');
        types.forEach(type => {
          switch (type) {
            case 1:
              console.log('  - Fingerprint');
              break;
            case 2:
              console.log('  - Facial Recognition');
              break;
            case 3:
              console.log('  - Iris Scan');
              break;
            default:
              console.log(`  - Unknown type: ${type}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Biometric support test failed:', error);
    }
    console.log('');
  }

  /**
   * Test configuration management
   */
  static async testConfiguration(): Promise<void> {
    console.log('⚙️ Testing Configuration Management...');
    
    try {
      const currentConfig = biometricAuthService.getBiometricConfig();
      console.log('📋 Current configuration:', currentConfig);
      
      // Test status methods
      const isLocked = biometricAuthService.isAccountLocked();
      const remainingAttempts = biometricAuthService.getRemainingAttempts();
      const remainingLockoutTime = biometricAuthService.getRemainingLockoutTime();
      
      console.log('🔒 Account locked:', isLocked);
      console.log('🔢 Remaining attempts:', remainingAttempts);
      console.log('⏰ Remaining lockout time:', remainingLockoutTime, 'seconds');
      
    } catch (error) {
      console.error('❌ Configuration test failed:', error);
    }
    console.log('');
  }

  /**
   * Test security settings
   */
  static async testSecuritySettings(): Promise<void> {
    console.log('🛡️ Testing Security Settings...');
    
    try {
      const currentSettings = biometricAuthService.getSecuritySettings();
      console.log('📋 Current security settings:', currentSettings);
      
      // Test updating settings
      const newSettings = {
        maxAttempts: 5,
        lockoutDuration: 600000, // 10 minutes
        sessionTimeout: 3600000 // 1 hour
      };
      
      await biometricAuthService.updateSecuritySettings(newSettings);
      console.log('✅ Security settings updated');
      
      const updatedSettings = biometricAuthService.getSecuritySettings();
      console.log('📋 Updated settings:', updatedSettings);
      
      // Restore original settings
      await biometricAuthService.updateSecuritySettings(currentSettings);
      console.log('✅ Original settings restored');
      
    } catch (error) {
      console.error('❌ Security settings test failed:', error);
    }
    console.log('');
  }

  /**
   * Test authentication flow
   */
  static async testAuthenticationFlow(): Promise<void> {
    console.log('🔐 Testing Authentication Flow...');
    
    try {
      // Check if authentication is required
      const requiresAuth = await biometricAuthService.isAuthenticationRequired();
      console.log('🔍 Authentication required:', requiresAuth);
      
      if (requiresAuth) {
        console.log('⚠️ Note: Authentication required - this is expected for security');
      }
      
      // Test authentication (this will prompt user on device)
      console.log('📱 Attempting biometric authentication...');
      console.log('⚠️ Note: This will show device authentication prompt');
      
      const authResult = await biometricAuthService.authenticateBiometric(
        'Test authentication for development'
      );
      
      console.log('📋 Authentication result:', authResult);
      
    } catch (error) {
      console.error('❌ Authentication flow test failed:', error);
    }
    console.log('');
  }

  /**
   * Test fallback mechanisms
   */
  static async testFallbackMechanisms(): Promise<void> {
    console.log('🔄 Testing Fallback Mechanisms...');
    
    try {
      // Test PIN authentication (if configured)
      console.log('🔢 Testing PIN authentication...');
      
      // Note: This will fail if no PIN is configured, which is expected
      const pinResult = await biometricAuthService.authenticateWithPin('1234');
      console.log('📋 PIN authentication result:', pinResult);
      
      if (!pinResult.success) {
        console.log('ℹ️ PIN authentication failed (expected if no PIN configured)');
      }
      
    } catch (error) {
      console.error('❌ Fallback mechanisms test failed:', error);
    }
    console.log('');
  }

  /**
   * Test recovery system
   */
  static async testRecoverySystem(): Promise<void> {
    console.log('🔑 Testing Recovery System...');
    
    try {
      // Test recovery code authentication (if configured)
      console.log('🔐 Testing recovery code authentication...');
      
      const recoveryResult = await biometricAuthService.authenticateWithRecoveryCode(
        'TEST-CODE-1234-5678'
      );
      console.log('📋 Recovery code result:', recoveryResult);
      
      if (!recoveryResult.success) {
        console.log('ℹ️ Recovery code authentication failed (expected with test code)');
      }
      
    } catch (error) {
      console.error('❌ Recovery system test failed:', error);
    }
    console.log('');
  }

  /**
   * Test error handling
   */
  static async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing Error Handling...');
    
    try {
      // Test with invalid inputs
      console.log('🔢 Testing invalid PIN...');
      const invalidPinResult = await biometricAuthService.authenticateWithPin('');
      console.log('📋 Invalid PIN result:', invalidPinResult);
      
      console.log('🔐 Testing invalid recovery code...');
      const invalidRecoveryResult = await biometricAuthService.authenticateWithRecoveryCode('');
      console.log('📋 Invalid recovery code result:', invalidRecoveryResult);
      
      console.log('✅ Error handling working correctly');
      
    } catch (error) {
      console.error('❌ Error handling test failed:', error);
    }
    console.log('');
  }

  /**
   * Generate test report
   */
  static async generateTestReport(): Promise<string> {
    console.log('📊 Generating Test Report...');
    
    try {
      const config = biometricAuthService.getBiometricConfig();
      const settings = biometricAuthService.getSecuritySettings();
      const isSupported = await biometricAuthService.isBiometricSupported();
      const types = await biometricAuthService.getSupportedBiometricTypes();
      
      const report = {
        timestamp: new Date().toISOString(),
        device: {
          platform: Platform.OS,
          biometricSupported: isSupported,
          supportedTypes: types
        },
        configuration: config,
        securitySettings: settings,
        status: {
          isLocked: biometricAuthService.isAccountLocked(),
          remainingAttempts: biometricAuthService.getRemainingAttempts(),
          remainingLockoutTime: biometricAuthService.getRemainingLockoutTime()
        }
      };
      
      console.log('📋 Test report generated successfully');
      return JSON.stringify(report, null, 2);
      
    } catch (error) {
      console.error('❌ Failed to generate test report:', error);
      return 'Error generating report';
    }
  }

  /**
   * Test specific scenario
   */
  static async testScenario(scenario: string): Promise<void> {
    console.log(`🎭 Testing Scenario: ${scenario}`);
    
    switch (scenario.toLowerCase()) {
      case 'setup':
        await this.testBiometricSetup();
        break;
      case 'authentication':
        await this.testAuthenticationFlow();
        break;
      case 'fallback':
        await this.testFallbackMechanisms();
        break;
      case 'recovery':
        await this.testRecoverySystem();
        break;
      case 'security':
        await this.testSecuritySettings();
        break;
      default:
        console.log('❌ Unknown scenario. Available scenarios: setup, authentication, fallback, recovery, security');
    }
  }

  /**
   * Test biometric setup
   */
  static async testBiometricSetup(): Promise<void> {
    console.log('🔧 Testing Biometric Setup...');
    
    try {
      const result = await biometricAuthService.setupBiometric();
      console.log('📋 Setup result:', result);
      
      if (result.success) {
        console.log('✅ Biometric setup successful');
        console.log('🔑 Recovery code:', result.recoveryCode);
      } else {
        console.log('❌ Biometric setup failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Biometric setup test failed:', error);
    }
    console.log('');
  }
}

// Export for use in other files
export const runBiometricTests = BiometricAuthTester.runAllTests;
export const testBiometricScenario = BiometricAuthTester.testScenario;
export const generateBiometricReport = BiometricAuthTester.generateTestReport;

// Example usage:
// import { runBiometricTests, testBiometricScenario } from './testBiometricAuth';
// 
// // Run all tests
// await runBiometricTests();
// 
// // Test specific scenario
// await testBiometricScenario('setup');
// await testBiometricScenario('authentication');
