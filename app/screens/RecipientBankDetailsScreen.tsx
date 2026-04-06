import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RecipientBankDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [iban, setIban] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  const transferParams = {
    recipientId: params.recipientId as string,
    amount: params.amount as string,
    fromCurrency: params.fromCurrency as string,
    toCurrency: params.toCurrency as string,
    selectedBank: params.selectedBank as string,
    bankCode: params.bankCode as string
  };

  const handleContinue = () => {
    if (!iban || !accountNumber || !accountHolderName) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Navigate to existing Recepentdetails screen
    router.push({
      pathname: '/screens/Recepentdetails',
      params: {
        ...transferParams,
        iban,
        accountNumber,
        accountHolderName,
        swiftCode
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/screens/MoneyTransferScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={handleClose}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '90%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title and Question */}
        <Text style={styles.title}>Recipient Bank Details</Text>
        <Text style={styles.question}>Enter your recipient's bank account information</Text>

        {/* Selected Bank Display */}
        <View style={styles.selectedBankCard}>
          <Text style={styles.selectedBankLabel}>Selected Bank:</Text>
          <Text style={styles.selectedBankName}>{transferParams.selectedBank}</Text>
        </View>

        {/* IBAN Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>IBAN Number *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter IBAN number"
            value={iban}
            onChangeText={setIban}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Account Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Account Number *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Account Holder Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Account Holder Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter account holder's full name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Swift Code Input (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Swift Code (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter SWIFT/BIC code"
            value={swiftCode}
            onChangeText={setSwiftCode}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Informational Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Please ensure all bank details are accurate. Incorrect information may result in transfer delays or failures.
          </Text>
          <Text style={styles.infoText}>
            IBAN and account number are required for international transfers. Swift code helps ensure faster processing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  selectedBankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedBankLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedBankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  continueButton: {
    backgroundColor: '#234881',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 100,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
});

export default RecipientBankDetailsScreen;
