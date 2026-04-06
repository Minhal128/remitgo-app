import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';

export interface BiometricConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'none';
  fallbackEnabled: boolean;
  lastUsed: string;
  securityLevel: 'low' | 'medium' | 'high';
  fallbackPinHash?: string;
  recoveryCode?: string;
}

export interface SecuritySettings {
  maxAttempts: number;
  lockoutDuration: number;
  requireFallback: boolean;
  encryptionEnabled: boolean;
  sessionTimeout: number;
}

export interface AuthenticationResult {
  success: boolean;
  method: 'biometric' | 'pin' | 'recovery' | 'none';
  error?: string;
  biometricType?: string;
}

export class BiometricAuthService {
  private static instance: BiometricAuthService;
  private attempts: number = 0;
  private isLocked: boolean = false;
  private lockoutEndTime: number = 0;
  private securitySettings: SecuritySettings;
  private biometricConfig: BiometricConfig | null = null;

  private constructor() {
    this.securitySettings = {
      maxAttempts: 3,
      lockoutDuration: 300000, // 5 minutes
      requireFallback: true,
      encryptionEnabled: true,
      sessionTimeout: 1800000 // 30 minutes
    };
  }

  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * Initialize the biometric authentication service
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadSecuritySettings();
      await this.loadBiometricConfig();
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
    }
  }

  /**
   * Check if biometric authentication is supported on the device
   */
  public async isBiometricSupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  public async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate using biometrics
   */
  public async authenticateBiometric(promptMessage: string = 'Authenticate to continue'): Promise<AuthenticationResult> {
    if (this.isLocked) {
      const remainingTime = Math.ceil((this.lockoutEndTime - Date.now()) / 1000);
      return {
        success: false,
        method: 'none',
        error: `Account locked. Please wait ${remainingTime} seconds.`
      };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.attempts = 0;
        await this.updateLastUsed();
        
        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        return {
          success: true,
          method: 'biometric',
          biometricType: await this.getBiometricTypeText()
        };
      } else {
        this.handleFailedAttempt();
        return {
          success: false,
          method: 'none',
          error: 'Biometric authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      this.handleFailedAttempt();
      return {
        success: false,
        method: 'none',
        error: 'Authentication error occurred'
      };
    }
  }

  /**
   * Authenticate using fallback PIN
   */
  public async authenticateWithPin(pin: string): Promise<AuthenticationResult> {
    if (this.isLocked) {
      const remainingTime = Math.ceil((this.lockoutEndTime - Date.now()) / 1000);
      return {
        success: false,
        method: 'none',
        error: `Account locked. Please wait ${remainingTime} seconds.`
      };
    }

    try {
      const storedPinHash = await SecureStore.getItemAsync('fallbackPinHash');
      if (!storedPinHash) {
        return {
          success: false,
          method: 'none',
          error: 'No fallback PIN configured'
        };
      }

      const inputPinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin + 'salt',
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      if (inputPinHash === storedPinHash) {
        this.attempts = 0;
        await this.updateLastUsed();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        return {
          success: true,
          method: 'pin'
        };
      } else {
        this.handleFailedAttempt();
        return {
          success: false,
          method: 'none',
          error: 'Invalid PIN'
        };
      }
    } catch (error) {
      console.error('PIN authentication error:', error);
      this.handleFailedAttempt();
      return {
        success: false,
        method: 'none',
        error: 'PIN authentication error'
      };
    }
  }

  /**
   * Authenticate using recovery code
   */
  public async authenticateWithRecoveryCode(code: string): Promise<AuthenticationResult> {
    try {
      const storedCode = await SecureStore.getItemAsync('recoveryCode');
      if (!storedCode) {
        return {
          success: false,
          method: 'none',
          error: 'No recovery code configured'
        };
      }

      if (code.toUpperCase().replace(/-/g, '') === storedCode.replace(/-/g, '')) {
        this.attempts = 0;
        await this.updateLastUsed();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        return {
          success: true,
          method: 'recovery'
        };
      } else {
        return {
          success: false,
          method: 'none',
          error: 'Invalid recovery code'
        };
      }
    } catch (error) {
      console.error('Recovery code authentication error:', error);
      return {
        success: false,
        method: 'none',
        error: 'Recovery code authentication error'
      };
    }
  }

  /**
   * Set up biometric authentication
   */
  public async setupBiometric(): Promise<{ success: boolean; recoveryCode?: string; error?: string }> {
    try {
      const isSupported = await this.isBiometricSupported();
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication not supported or not enrolled'
        };
      }

      // Test authentication
      const authResult = await this.authenticateBiometric('Authenticate to enable biometric login');
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Biometric authentication failed'
        };
      }

      // Generate recovery code
      const recoveryCode = await this.generateRecoveryCode();
      
      // Save configuration
      const config: BiometricConfig = {
        enabled: true,
        type: await this.getBiometricType(),
        fallbackEnabled: this.securitySettings.requireFallback,
        lastUsed: new Date().toISOString(),
        securityLevel: 'high',
        recoveryCode
      };

      await this.saveBiometricConfig(config);
      
      return {
        success: true,
        recoveryCode
      };
    } catch (error) {
      console.error('Error setting up biometric:', error);
      return {
        success: false,
        error: 'Failed to set up biometric authentication'
      };
    }
  }

  /**
   * Set up fallback PIN
   */
  public async setupFallbackPin(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (pin.length < 4) {
        return {
          success: false,
          error: 'PIN must be at least 4 digits long'
        };
      }

      // Hash the PIN
      const hashedPin = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin + 'salt',
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Store hashed PIN
      await SecureStore.setItemAsync('fallbackPinHash', hashedPin);

      // Update configuration
      if (this.biometricConfig) {
        this.biometricConfig.fallbackEnabled = true;
        this.biometricConfig.fallbackPinHash = hashedPin;
        await this.saveBiometricConfig(this.biometricConfig);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up fallback PIN:', error);
      return {
        success: false,
        error: 'Failed to set up fallback PIN'
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  public async disableBiometric(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear all stored data
      await SecureStore.deleteItemAsync('biometricConfig');
      await SecureStore.deleteItemAsync('fallbackPinHash');
      await SecureStore.deleteItemAsync('recoveryCode');
      await SecureStore.deleteItemAsync('biometricEnabled');

      this.biometricConfig = null;
      this.attempts = 0;
      this.isLocked = false;

      return { success: true };
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return {
        success: false,
        error: 'Failed to disable biometric authentication'
      };
    }
  }

  /**
   * Check if authentication is required (session expired)
   */
  public async isAuthenticationRequired(): Promise<boolean> {
    try {
      if (!this.biometricConfig?.enabled) {
        return false;
      }

      const lastUsed = new Date(this.biometricConfig.lastUsed).getTime();
      const now = Date.now();
      const timeSinceLastUse = now - lastUsed;

      return timeSinceLastUse > this.securitySettings.sessionTimeout;
    } catch (error) {
      console.error('Error checking authentication requirement:', error);
      return true; // Default to requiring authentication on error
    }
  }

  /**
   * Get current biometric configuration
   */
  public getBiometricConfig(): BiometricConfig | null {
    return this.biometricConfig;
  }

  /**
   * Get current security settings
   */
  public getSecuritySettings(): SecuritySettings {
    return this.securitySettings;
  }

  /**
   * Update security settings
   */
  public async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings };
    await SecureStore.setItemAsync('securitySettings', JSON.stringify(this.securitySettings));
  }

  // Private helper methods

  private async loadSecuritySettings(): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync('securitySettings');
      if (stored) {
        this.securitySettings = { ...this.securitySettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  }

  private async loadBiometricConfig(): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync('biometricConfig');
      if (stored) {
        this.biometricConfig = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading biometric config:', error);
    }
  }

  private async saveBiometricConfig(config: BiometricConfig): Promise<void> {
    try {
      await SecureStore.setItemAsync('biometricConfig', JSON.stringify(config));
      await SecureStore.setItemAsync('biometricEnabled', 'true');
      this.biometricConfig = config;
    } catch (error) {
      console.error('Error saving biometric config:', error);
      throw error;
    }
  }

  private async updateLastUsed(): Promise<void> {
    if (this.biometricConfig) {
      this.biometricConfig.lastUsed = new Date().toISOString();
      await this.saveBiometricConfig(this.biometricConfig);
    }
  }

  private async getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | 'none'> {
    const types = await this.getSupportedBiometricTypes();
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'face';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'iris';
    }
    return 'none';
  }

  private async getBiometricTypeText(): Promise<string> {
    const type = await this.getBiometricType();
    switch (type) {
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

  private async generateRecoveryCode(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .match(/.{1,4}/g)!
      .join('-');
  }

  private handleFailedAttempt(): void {
    this.attempts++;
    
    if (this.attempts >= this.securitySettings.maxAttempts) {
      this.isLocked = true;
      this.lockoutEndTime = Date.now() + this.securitySettings.lockoutDuration;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  /**
   * Check if account is currently locked
   */
  public isAccountLocked(): boolean {
    if (this.isLocked && Date.now() >= this.lockoutEndTime) {
      this.isLocked = false;
      this.attempts = 0;
      return false;
    }
    return this.isLocked;
  }

  /**
   * Get remaining lockout time in seconds
   */
  public getRemainingLockoutTime(): number {
    if (!this.isLocked) return 0;
    return Math.max(0, Math.ceil((this.lockoutEndTime - Date.now()) / 1000));
  }

  /**
   * Get remaining authentication attempts
   */
  public getRemainingAttempts(): number {
    return Math.max(0, this.securitySettings.maxAttempts - this.attempts);
  }
}

// Export singleton instance
export const biometricAuthService = BiometricAuthService.getInstance();
