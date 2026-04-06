import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import biometricAuthService from '../utils/biometricAuth';

interface BiometricContextType {
  isBiometricEnabled: boolean;
  shouldShowBiometricPrompt: boolean;
  showBiometricPrompt: () => void;
  hideBiometricPrompt: () => void;
  handleBiometricSuccess: () => void;
  handleBiometricCancel: () => void;
  handleBiometricFallback: () => void;
  checkBiometricStatus: () => Promise<void>;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

interface BiometricProviderProps {
  children: ReactNode;
}

export const BiometricProvider: React.FC<BiometricProviderProps> = ({ children }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [shouldShowBiometricPrompt, setShouldShowBiometricPrompt] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  useEffect(() => {
    // Check if we should show biometric prompt when app becomes active
    const checkBiometricPrompt = async () => {
      try {
        if (isBiometricEnabled) {
          const shouldPrompt = await biometricAuthService.shouldPromptBiometric();
          if (shouldPrompt) {
            setShouldShowBiometricPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking biometric prompt:', error);
      }
    };

    // Check when app becomes active
    const handleAppStateChange = () => {
      checkBiometricPrompt();
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isBiometricEnabled]);

  const checkBiometricStatus = async () => {
    try {
      const isEnabled = await biometricAuthService.isBiometricAvailable();
      setIsBiometricEnabled(isEnabled);
    } catch (error) {
      console.error('Error checking biometric status:', error);
      setIsBiometricEnabled(false);
    }
  };

  const showBiometricPrompt = () => {
    setShouldShowBiometricPrompt(true);
  };

  const hideBiometricPrompt = () => {
    setShouldShowBiometricPrompt(false);
  };

  const handleBiometricSuccess = () => {
    // Biometric authentication successful
    hideBiometricPrompt();
    
    // Update last launch time to prevent immediate re-prompting
    AsyncStorage.setItem('lastAppLaunch', Date.now().toString());
  };

  const handleBiometricCancel = () => {
    // User cancelled biometric authentication
    hideBiometricPrompt();
    
    // Update last launch time to prevent immediate re-prompting
    AsyncStorage.setItem('lastAppLaunch', Date.now().toString());
  };

  const handleBiometricFallback = () => {
    // User chose to use passcode instead
    hideBiometricPrompt();
    
    // Update last launch time to prevent immediate re-prompting
    AsyncStorage.setItem('lastAppLaunch', Date.now().toString());
    
    // Navigate to passcode screen or handle fallback
    // This can be customized based on your app's requirements
  };

  const value: BiometricContextType = {
    isBiometricEnabled,
    shouldShowBiometricPrompt,
    showBiometricPrompt,
    hideBiometricPrompt,
    handleBiometricSuccess,
    handleBiometricCancel,
    handleBiometricFallback,
    checkBiometricStatus,
  };

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = (): BiometricContextType => {
  const context = useContext(BiometricContext);
  if (context === undefined) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
};

// Import AppState at the top
import { AppState } from 'react-native';

export default BiometricContext;
