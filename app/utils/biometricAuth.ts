import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface BiometricConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'none';
  fallbackEnabled: boolean;
  lastUsed: string;
  securityLevel: 'low' | 'medium' | 'high';
  deviceId: string;
  userId: string;
  pinCode?: string;
  setupDate: string;
  isFirstTimeSetup: boolean;
}

export interface BiometricResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresSetup?: boolean;
  setupRequired?: boolean;
}

class BiometricAuthService {
  private static instance: BiometricAuthService;
  private config: BiometricConfig | null = null;
  private isInitialized = false;

  // Singleton pattern
  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if running on web
      if (Platform.OS === 'web') {
        console.log('🌐 Running on web - skipping biometric hardware check');
        this.isInitialized = true;
        return;
      }

      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.log('❌ Biometric hardware not supported');
        this.isInitialized = true;
        return;
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('❌ Biometrics not enrolled on device');
        this.isInitialized = true;
        return;
      }

      // Load existing configuration
      await this.loadBiometricConfig();
      
      this.isInitialized = true;
      console.log('✅ Biometric service initialized successfully');
    } catch (error) {
      console.error('❌ Biometric initialization failed:', error);
      // Don't throw error, just mark as not available
      this.isInitialized = true;
    }
  }

  // Check if biometric authentication is available
  async isBiometricAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      
      // Check if device supports biometrics
      if (Platform.OS === 'web') return false;
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  // Check if biometric is enabled for the current user
  async isBiometricEnabled(): Promise<boolean> {
    try {
      await this.initialize();
      
      // Get current user ID
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      const userId = user._id || user.id;
      
      // Check if this user has biometric enabled
      const config = await this.getBiometricConfig();
      if (!config) return false;
      
      return config.enabled && config.userId === userId;
    } catch (error) {
      console.error('Error checking if biometric enabled:', error);
      return false;
    }
  }

  // Check if user should be prompted for biometric authentication
  async shouldPromptBiometric(): Promise<boolean> {
    try {
      // Check if user is logged in
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;

      // Check if biometric is enabled
      if (!(await this.isBiometricEnabled())) return false;

      // Check if this is a fresh app launch
      const lastLaunch = await AsyncStorage.getItem('lastAppLaunch');
      const currentTime = Date.now();
      
      if (!lastLaunch) {
        // First time launching app, set timestamp
        await AsyncStorage.setItem('lastAppLaunch', currentTime.toString());
        return false;
      }

      // Check if enough time has passed since last launch (e.g., 5 minutes)
      const timeSinceLastLaunch = currentTime - parseInt(lastLaunch);
      const shouldPrompt = timeSinceLastLaunch > 5 * 60 * 1000; // 5 minutes

      if (shouldPrompt) {
        // Update last launch time
        await AsyncStorage.setItem('lastAppLaunch', currentTime.toString());
      }

      return shouldPrompt;
    } catch (error) {
      console.error('Error checking biometric prompt:', error);
      return false;
    }
  }

  // Authenticate user with biometric
  async authenticate(): Promise<BiometricResult> {
    try {
      await this.initialize();

      if (!(await this.isBiometricEnabled())) {
        return { success: false, error: 'Biometric authentication not enabled' };
      }

      // Get supported authentication types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Determine biometric type
      let biometricType: LocalAuthentication.AuthenticationType;
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = LocalAuthentication.AuthenticationType.FINGERPRINT;
      } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = LocalAuthentication.AuthenticationType.IRIS;
      } else {
        return { success: false, error: 'No supported biometric type found' };
      }

      // Attempt biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        authenticationType: biometricType,
      });

      if (result.success) {
        // Update last used timestamp
        await this.updateLastUsed();
        
        // Get user data
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        return { success: true, user };
      } else {
        // Provide haptic feedback for failure
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        if (result.error === 'UserCancel') {
          return { success: false, error: 'Authentication cancelled' };
        } else {
          return { success: false, error: 'Authentication failed' };
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: 'Authentication error occurred' };
    }
  }

  // Setup biometric authentication for first time
  async setupBiometric(): Promise<BiometricResult> {
    try {
      await this.initialize();

      // Check if device supports biometrics
      if (!(await this.isBiometricAvailable())) {
        return { 
          success: false, 
          error: 'Your device does not support biometric authentication or biometrics are not enrolled. Please enable biometrics in your device settings.',
          setupRequired: true
        };
      }

      // Get current user ID
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        return { 
          success: false, 
          error: 'User not authenticated. Please sign in first.',
          setupRequired: true
        };
      }

      const user = JSON.parse(userData);
      const userId = user._id || user.id;

      // Check if this user already has biometric enabled - but allow re-setup
      const existingConfig = await this.getBiometricConfig();
      if (existingConfig && existingConfig.enabled && existingConfig.userId === userId) {
        // User already has biometric enabled, but we'll allow re-setup
        console.log('User already has biometric enabled, allowing re-setup');
        // Don't return error, continue with setup
      }

      // Get supported authentication types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Determine biometric type
      let biometricType: 'fingerprint' | 'face' | 'iris' | 'none' = 'none';
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'face';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      // Attempt biometric authentication for setup
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Generate device ID
        const deviceId = await this.generateDeviceId();
        
        // Create configuration
        const config: BiometricConfig = {
          enabled: true,
          type: biometricType,
          fallbackEnabled: true,
          lastUsed: new Date().toISOString(),
          securityLevel: 'high',
          deviceId: deviceId,
          userId: userId,
          setupDate: new Date().toISOString(),
          isFirstTimeSetup: !existingConfig || !existingConfig.enabled,
        };

        // Save configuration
        await this.saveBiometricConfig(config);
        this.config = config;

        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        console.log('✅ Biometric setup completed successfully');
        return { success: true, user: user };
      } else {
        if (result.error === 'UserCancel') {
          return { success: false, error: 'Setup cancelled' };
        } else {
          return { success: false, error: 'Setup failed. Please try again.' };
        }
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      return { success: false, error: 'Setup error occurred. Please try again.' };
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<void> {
    try {
      // Clear configuration
      await SecureStore.deleteItemAsync('biometricConfig');
      await SecureStore.deleteItemAsync('biometricEnabled');
      await SecureStore.deleteItemAsync('deviceRegistered');
      
      this.config = null;
      console.log('✅ Biometric authentication disabled');
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }

  // Get current biometric configuration
  async getBiometricConfig(): Promise<BiometricConfig | null> {
    try {
      await this.initialize();
      return this.config;
    } catch (error) {
      return null;
    }
  }

  // Check if device is registered for biometric
  async isDeviceRegistered(): Promise<boolean> {
    try {
      const registered = await SecureStore.getItemAsync('deviceRegistered');
      return registered === 'true';
    } catch (error) {
      return false;
    }
  }

  // Check if setup is required
  async isSetupRequired(): Promise<boolean> {
    try {
      const config = await this.getBiometricConfig();
      return !config || !config.enabled;
    } catch (error) {
      return true;
    }
  }

  // Private methods
  private async loadBiometricConfig(): Promise<void> {
    try {
      const config = await SecureStore.getItemAsync('biometricConfig');
      if (config) {
        this.config = JSON.parse(config);
        console.log('📱 Loaded existing biometric config');
      } else {
        console.log('📱 No existing biometric config found');
      }
    } catch (error) {
      console.error('Error loading biometric config:', error);
    }
  }

  private async saveBiometricConfig(config: BiometricConfig): Promise<void> {
    try {
      await SecureStore.setItemAsync('biometricConfig', JSON.stringify(config));
      await SecureStore.setItemAsync('biometricEnabled', 'true');
      await SecureStore.setItemAsync('deviceRegistered', 'true');
      await SecureStore.setItemAsync('lastBiometricAuth', new Date().toISOString());
      console.log('💾 Biometric config saved successfully');
    } catch (error) {
      console.error('Error saving biometric config:', error);
      throw error;
    }
  }

  private async updateLastUsed(): Promise<void> {
    try {
      if (this.config) {
        this.config.lastUsed = new Date().toISOString();
        await this.saveBiometricConfig(this.config);
      }
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }

  private async generateDeviceId(): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    } catch (error) {
      // Fallback to timestamp-based ID
      return `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Get biometric type text for UI
  getBiometricTypeText(): string {
    if (!this.config) return 'biometric';
    
    switch (this.config.type) {
      case 'fingerprint':
        return 'fingerprint';
      case 'face':
        return 'face recognition';
      case 'iris':
        return 'iris scan';
      default:
        return 'biometric';
    }
  }

  // Check if biometric is supported on device
  async isSupported(): Promise<boolean> {
    try {
      // Check if running on web
      if (Platform.OS === 'web') {
        return false; // Biometrics not supported on web
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      return false;
    }
  }

  // Reset biometric configuration (for testing/debugging)
  async resetBiometricConfig(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('biometricConfig');
      await SecureStore.deleteItemAsync('biometricEnabled');
      await SecureStore.deleteItemAsync('deviceRegistered');
      await SecureStore.deleteItemAsync('lastBiometricAuth');
      
      this.config = null;
      console.log('🔄 Biometric configuration reset');
    } catch (error) {
      console.error('Error resetting biometric config:', error);
      throw error;
    }
  }

  // Debug method to check current biometric status
  async debugBiometricStatus(): Promise<{
    isSupported: boolean;
    isEnabled: boolean;
    config: BiometricConfig | null;
    deviceRegistered: boolean;
    hasHardware: boolean;
    isEnrolled: boolean;
  }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isSupported = hasHardware && isEnrolled;
      const isEnabled = await this.isBiometricEnabled();
      const config = await this.getBiometricConfig();
      const deviceRegistered = await this.isDeviceRegistered();

      return {
        isSupported,
        isEnabled,
        config,
        deviceRegistered,
        hasHardware,
        isEnrolled,
      };
    } catch (error) {
      console.error('Error getting debug status:', error);
      return {
        isSupported: false,
        isEnabled: false,
        config: null,
        deviceRegistered: false,
        hasHardware: false,
        isEnrolled: false,
      };
    }
  }
}

export const biometricAuthService = BiometricAuthService.getInstance();
export default biometricAuthService;
