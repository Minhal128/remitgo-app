import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, ColorUtils } from '../../constants/Colors';
import { useUserAccountDetails } from '../../hooks/useAccountDetails';

const DepositScreen = () => {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const colors = Colors.light;

  // Mock user data - in real app, this would come from authentication context
  const mockUserData = {
    id: 'user_12345',
    email: 'user@example.com',
    phone: '+923001234567',
    name: 'John Doe'
  };

  // Use the custom hook to get account details
  const { accountDetails, isLoading, error, refreshAccountDetails } = useUserAccountDetails(mockUserData);

  const handleBack = () => {
    router.back();
  };

  const handleCopy = (field: string, value: string) => {
    // In a real app, you would use Clipboard API here
    setCopiedField(field);
    
    // Show success message
    Alert.alert('Copied!', `${field} has been copied to clipboard`);
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Show loading state while account details are being generated
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.highlight} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Generating your account details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if account details failed to load
  if (error || !accountDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Unable to load account details
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error || 'Something went wrong while generating your account details.'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.highlight }]}
            onPress={refreshAccountDetails}
          >
            <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshAccountDetails}
          disabled={isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={isLoading ? colors.textSecondary : colors.highlight} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
          Load money
        </Text>

        {/* Account Details Timestamp */}
        <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
          Account details generated on {new Date().toLocaleDateString()}
        </Text>



        {/* International Transfers Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Receive transfers
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              My RemitGo IBAN number
            </Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
              {accountDetails.iban}
            </Text>
            <TouchableOpacity 
              style={[styles.copyButton, { backgroundColor: ColorUtils.withOpacity(colors.highlight, 0.1) }]}
              onPress={() => handleCopy('IBAN Number', accountDetails.iban)}
            >
              <Ionicons name="copy-outline" size={20} color={colors.highlight} />
              <Text style={[styles.copyButtonText, { color: colors.highlight }]}>
                Copy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            How to receive money?
          </Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.textInverse }]}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Share your account number or IBAN with the sender
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.textInverse }]}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Money will be credited to your wallet instantly
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.textInverse }]}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Use it for transfers, payments, or withdrawals
              </Text>
            </View>
          </View>
        </View>



        {/* Support Section */}
        <View style={styles.supportSection}>
          <TouchableOpacity style={[styles.supportButton, { backgroundColor: ColorUtils.withOpacity(colors.primary, 0.1) }]}>
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.supportButtonText, { color: colors.primary }]}>
              Need help? Contact support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1},header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  timestampText: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },infoCard: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
  default: {
        elevation: 2,
      },})},fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },additionalInfo: {
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },stepText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  supportSection: {
    marginBottom: 40,
  },supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },// Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },// Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default DepositScreen;
