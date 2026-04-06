import { biometricAuthService, AuthenticationResult } from './biometricAuth';

/**
 * Example: Check if user needs to authenticate before accessing sensitive features
 */
export const checkAuthenticationRequired = async (): Promise<boolean> => {
  try {
    // Check if biometric is enabled
    const config = biometricAuthService.getBiometricConfig();
    if (!config?.enabled) {
      return false; // No authentication required if not enabled
    }

    // Check if session has expired
    return await biometricAuthService.isAuthenticationRequired();
  } catch (error) {
    console.error('Error checking authentication requirement:', error);
    return true; // Default to requiring authentication on error
  }
};

/**
 * Example: Authenticate user before performing sensitive operations
 */
export const authenticateUser = async (
  operation: string,
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    // Check if account is locked
    if (biometricAuthService.isAccountLocked()) {
      const remainingTime = biometricAuthService.getRemainingLockoutTime();
      onFailure(`Account locked. Please wait ${remainingTime} seconds.`);
      return;
    }

    // Try biometric authentication first
    const result = await biometricAuthService.authenticateBiometric(
      `Authenticate to ${operation}`
    );

    if (result.success) {
      onSuccess();
      return;
    }

    // If biometric fails, show fallback options
    onFailure(result.error || 'Authentication failed');
  } catch (error) {
    console.error('Authentication error:', error);
    onFailure('Authentication error occurred');
  }
};

/**
 * Example: Quick authentication check for low-risk operations
 */
export const quickAuthCheck = async (): Promise<boolean> => {
  try {
    const config = biometricAuthService.getBiometricConfig();
    if (!config?.enabled) {
      return true; // No authentication required
    }

    // For quick checks, only verify if session is still valid
    return !(await biometricAuthService.isAuthenticationRequired());
  } catch (error) {
    console.error('Quick auth check error:', error);
    return false; // Default to requiring authentication on error
  }
};

/**
 * Example: Authenticate for high-value transactions
 */
export const authenticateForTransaction = async (
  amount: number,
  currency: string,
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    // Always require authentication for high-value transactions
    const result = await biometricAuthService.authenticateBiometric(
      `Authenticate to send ${currency} ${amount}`
    );

    if (result.success) {
      onSuccess();
    } else {
      onFailure(result.error || 'Authentication failed');
    }
  } catch (error) {
    console.error('Transaction authentication error:', error);
    onFailure('Authentication error occurred');
  }
};

/**
 * Example: Setup biometric authentication for new users
 */
export const setupBiometricForNewUser = async (
  onSuccess: (recoveryCode: string) => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    const result = await biometricAuthService.setupBiometric();
    
    if (result.success && result.recoveryCode) {
      onSuccess(result.recoveryCode);
    } else {
      onFailure(result.error || 'Failed to setup biometric');
    }
  } catch (error) {
    console.error('Biometric setup error:', error);
    onFailure('Failed to setup biometric authentication');
  }
};

/**
 * Example: Setup fallback PIN for existing users
 */
export const setupFallbackPin = async (
  pin: string,
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    const result = await biometricAuthService.setupFallbackPin(pin);
    
    if (result.success) {
      onSuccess();
    } else {
      onFailure(result.error || 'Failed to setup fallback PIN');
    }
  } catch (error) {
    console.error('Fallback PIN setup error:', error);
    onFailure('Failed to setup fallback PIN');
  }
};

/**
 * Example: Disable biometric authentication
 */
export const disableBiometric = async (
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    const result = await biometricAuthService.disableBiometric();
    
    if (result.success) {
      onSuccess();
    } else {
      onFailure(result.error || 'Failed to disable biometric');
    }
  } catch (error) {
    console.error('Biometric disable error:', error);
    onFailure('Failed to disable biometric authentication');
  }
};

/**
 * Example: Get authentication status for UI display
 */
export const getAuthenticationStatus = () => {
  const config = biometricAuthService.getBiometricConfig();
  const isLocked = biometricAuthService.isAccountLocked();
  const remainingAttempts = biometricAuthService.getRemainingAttempts();
  const remainingLockoutTime = biometricAuthService.getRemainingLockoutTime();

  return {
    isEnabled: config?.enabled || false,
    biometricType: config?.type || 'none',
    isLocked,
    remainingAttempts,
    remainingLockoutTime,
    hasFallback: config?.fallbackEnabled || false,
    lastUsed: config?.lastUsed || null,
    securityLevel: config?.securityLevel || 'low'
  };
};

/**
 * Example: Update security settings
 */
export const updateSecuritySettings = async (
  settings: Partial<{
    maxAttempts: number;
    lockoutDuration: number;
    requireFallback: boolean;
    sessionTimeout: number;
  }>,
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    await biometricAuthService.updateSecuritySettings(settings);
    onSuccess();
  } catch (error) {
    console.error('Security settings update error:', error);
    onFailure('Failed to update security settings');
  }
};

/**
 * Example: Handle authentication in React components
 */
export const useBiometricAuth = () => {
  const authenticate = async (
    operation: string,
    requireBiometric: boolean = true
  ): Promise<AuthenticationResult> => {
    try {
      if (requireBiometric) {
        return await biometricAuthService.authenticateBiometric(
          `Authenticate to ${operation}`
        );
      } else {
        // Check if session is still valid
        const requiresAuth = await biometricAuthService.isAuthenticationRequired();
        if (requiresAuth) {
          return await biometricAuthService.authenticateBiometric(
            `Authenticate to ${operation}`
          );
        }
        return { success: true, method: 'none' };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        method: 'none',
        error: 'Authentication error occurred'
      };
    }
  };

  const getStatus = () => getAuthenticationStatus();

  const setup = async (): Promise<{ success: boolean; recoveryCode?: string; error?: string }> => {
    return await biometricAuthService.setupBiometric();
  };

  const setupPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    return await biometricAuthService.setupFallbackPin(pin);
  };

  const disable = async (): Promise<{ success: boolean; error?: string }> => {
    return await biometricAuthService.disableBiometric();
  };

  return {
    authenticate,
    getStatus,
    setup,
    setupPin,
    disable
  };
};

/**
 * Example: Authentication wrapper for sensitive operations
 */
export const withAuthentication = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  requireBiometric: boolean = true
) => {
  return async (...args: T): Promise<R> => {
    const authResult = await biometricAuthService.authenticateBiometric(
      `Authenticate to ${operationName}`
    );

    if (!authResult.success) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    return operation(...args);
  };
};

// Example usage of the wrapper:
export const sendMoney = withAuthentication(
  async (amount: number, recipient: string) => {
    // Perform money transfer operation
    console.log(`Sending ${amount} to ${recipient}`);
    return { success: true, transactionId: 'txn_123' };
  },
  'send money',
  true
);

export const viewBalance = withAuthentication(
  async () => {
    // Perform balance check operation
    console.log('Checking balance');
    return { balance: 1000, currency: 'USD' };
  },
  'view balance',
  false // Lower security requirement
);
