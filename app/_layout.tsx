import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/hooks/useColorScheme';
import BiometricPrompt from './components/BiometricPrompt';
import { BiometricProvider, useBiometric } from './context/BiometricContext';
import { RecipientProvider } from './context/RecipientContext';
import { WalletProvider } from './context/WalletContext';

// Clerk publishable key - using shared credentials
const CLERK_PUBLISHABLE_KEY = 'pk_test_YWRlcXVhdGUtcGFudGhlci02NC5jbGVyay5hY2NvdW50cy5kZXYk';

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#234881" />
      <Text style={{ marginTop: 16, color: '#234881', fontSize: 16 }}>Loading RemitGo...</Text>
    </View>
  );
}

function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#234881', marginBottom: 20, textAlign: 'center' }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
        {error.message}
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#234881', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
        onPress={resetError}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppContent() {
  const { shouldShowBiometricPrompt, handleBiometricSuccess, handleBiometricCancel, handleBiometricFallback } = useBiometric();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="choose-app" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="screens/WalletScreen" />
        <Stack.Screen name="screens/VirtualCard" />
        <Stack.Screen name="screens/signup" />
        <Stack.Screen name="screens/signin" />
        <Stack.Screen name="screens/KYCScreen" />
        <Stack.Screen name="screens/KYCPendingScreen" />
        <Stack.Screen name="screens/KYCStartScreen" />
        <Stack.Screen name="screens/ThumbEnableScreen" />
        <Stack.Screen name="screens/Home" />
        <Stack.Screen name="screens/Recepentdetails" />
        <Stack.Screen name="screens/SettingsScreen" />
        <Stack.Screen name="screens/ManageScreen" />
        <Stack.Screen name="screens/AboutUsScreen" />
        <Stack.Screen name="screens/LegalResourcesScreen" />
        <Stack.Screen name="screens/PrivacyChoicesScreen" />
        <Stack.Screen name="screens/HelpCenterScreen" />
        <Stack.Screen name="screens/ReferFriendsScreen" />
        <Stack.Screen name="screens/RedeemOfferScreen" />
        <Stack.Screen name="screens/RewardsScreen" />
        <Stack.Screen name="screens/ProfileScreen" />
        <Stack.Screen name="screens/ChooseBankScreen" />
        <Stack.Screen name="screens/ChooseCountryScreen" />
        <Stack.Screen name="screens/Features" />
        <Stack.Screen name="screens/MethodScreen" />
        <Stack.Screen name="screens/RecepentName" />
        <Stack.Screen name="screens/SelectBankScreen" />
        <Stack.Screen name="screens/SenderAddressScreen" />
        <Stack.Screen name="screens/senderdetails" />
        <Stack.Screen name="screens/SenderPhoneScreen" />
        <Stack.Screen name="screens/PaymentSuccessScreen" />
        <Stack.Screen name="screens/PaymentMethodScreen" />
        <Stack.Screen name="screens/PayWithCardScreen" />
        <Stack.Screen name="screens/RecipientsScreen" />
        <Stack.Screen name="screens/MoneyTransferScreen" />
        <Stack.Screen name="screens/RecepentNotification" />
        <Stack.Screen name="screens/HomePage" />
        <Stack.Screen name="screens/AddRecipientScreen" />
        <Stack.Screen name="screens/OnboardingScreen" />
      </Stack>
      
      {/* Biometric Prompt Modal */}
      <BiometricPrompt
        visible={shouldShowBiometricPrompt}
        onSuccess={handleBiometricSuccess}
        onCancel={handleBiometricCancel}
        onFallback={handleBiometricFallback}
      />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<Error | null>(null);

  useEffect(() => {
    const defaultHandler = (ErrorUtils as any).getGlobalHandler?.();

    (ErrorUtils as any).setGlobalHandler?.((error: Error, isFatal?: boolean) => {
      console.error("Global Error:", error);
      setErrorDetails(error);
      setHasError(true);
      defaultHandler?.(error, isFatal);
    });
  }, []);

  if (fontError) {
    console.error('Font loading error:', fontError);
  }

  if (hasError && errorDetails) {
    return <ErrorFallback error={errorDetails} resetError={() => setHasError(false)} />;
  }

  if (!loaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RecipientProvider>
          <WalletProvider>
            <BiometricProvider>
              <AppContent />
            </BiometricProvider>
          </WalletProvider>
          <StatusBar style="auto" />
        </RecipientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
