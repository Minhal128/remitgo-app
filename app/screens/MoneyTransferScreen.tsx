import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { useRecipient } from '../context/RecipientContext';
import { useWallet } from '../context/WalletContext';
import { apiFetch } from '../utils/api';

const MoneyTransferScreen = () => {
  const [activeTab, setActiveTab] = useState('Send');
  const [amount, setAmount] = useState('2000');
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transferLoading, setTransferLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const { recipientId } = useRecipient();
  const { refreshWallet, updateBalance, addTransaction } = useWallet();

  // Fetch recipient details and wallet balance when component mounts or recipientId changes
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 MoneyTransferScreen useEffect triggered');
      console.log('📱 Current recipientId from context:', recipientId);
      
      if (!recipientId) {
        console.log('❌ No recipientId provided - showing select recipient UI');
        setError('No recipient selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Fetch recipient details
        console.log('🔍 Making API call to:', `/api/v1/recipients/${recipientId}/getrecipient`);
        const recipientResponse = await apiFetch(`/api/v1/recipients/${recipientId}/getrecipient`);
        console.log('✅ Recipient details fetched:', recipientResponse);
        
        if (recipientResponse.success && recipientResponse.data) {
          setRecipient(recipientResponse.data);
          console.log('👤 Recipient set successfully:', recipientResponse.data);
        } else {
          console.log('❌ API response not successful:', recipientResponse);
          setError('Failed to load recipient details');
        }

        // Fetch wallet balance
        console.log('💰 Fetching wallet balance');
        const walletResponse = await apiFetch('/wallet/get-by-user');
        console.log('💳 Wallet balance fetched:', walletResponse);
        
        if (walletResponse && walletResponse.balance !== undefined) {
          setWalletBalance(walletResponse.balance);
          console.log('✅ Wallet balance set:', walletResponse.balance);
        } else {
          console.log('❌ Wallet response not successful:', walletResponse);
          setWalletBalance(0);
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load data');
        setWalletBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recipientId]);

  // Debug: Log whenever recipientId changes
  useEffect(() => {
    console.log('🔄 recipientId changed in MoneyTransferScreen:', recipientId);
  },[recipientId]);

  // Manual refresh function
  const refreshRecipientData = async () => {
    if (!recipientId) {
      console.log('❌ No recipientId to refresh');
      return;
    }

    console.log('🔄 Manual refresh triggered for recipientId:', recipientId);
    setLoading(true);
    setError('');

    try {
      // Fetch recipient details
      console.log('🔍 Refreshing recipient details for:', recipientId);
      const recipientResponse = await apiFetch(`/api/v1/recipients/${recipientId}/getrecipient`);
      console.log('✅ Recipient details refreshed:', recipientResponse);
      
      if (recipientResponse.success && recipientResponse.data) {
        setRecipient(recipientResponse.data);
        console.log('👤 Recipient refreshed successfully:', recipientResponse.data);
      } else {
        console.log('❌ Failed to refresh recipient:', recipientResponse);
        setError('Failed to refresh recipient details');
      }
    } catch (err) {
      console.error('❌ Error refreshing recipient:', err);
      setError('Failed to refresh recipient data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get recipient initials
  const getRecipientInitials = (name) => {
    if (!name) return 'RC'; // Default initials
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to mask account number or IBAN
  const maskAccountInfo = (accountNumber, iban) => {
    if (iban) {
      return `${iban.slice(0, 4)}****${iban.slice(-4)}`;
    }
    if (accountNumber) {
      return `${accountNumber.slice(0, 4)}****${accountNumber.slice(-4)}`;
    }
    return '****';
  };

  // Helper function to get recipient name
  const getRecipientName = () => {
    if (recipient?.firstName && recipient?.lastName) {
      return `${recipient.firstName} ${recipient.lastName}`;
    }
    if (recipient?.firstName) {
      return recipient.firstName;
    }
    if (recipient?.bankDetails?.accountName) {
      return recipient.bankDetails.accountName;
    }
    return 'Recipient';
  };

  // Validate wallet balance
  const validateWalletBalance = (transferAmount) => {
    const amount = parseFloat(transferAmount);
    if (amount > walletBalance) {
      Alert.alert(
        'Insufficient Funds',
        'Insufficient funds in your wallet',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return false;
    }
    return true;
  };

  // Execute real-time DLOCAL transfer
  const executeDLocalTransfer = async () => {
    if (!validateWalletBalance(amount)) {
      return;
    }

    setTransferLoading(true);
    try {
      console.log('🚀 Executing DLOCAL transfer:', { recipient, amount, walletBalance });
      
      // Create transfer quote first
      const quoteResponse = await apiFetch('/transfer/quote', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromCurrency: 'USD',
          toCurrency: recipient.currency || 'PKR',
          deliverySpeed: 'express'
        })
      });

      if (!quoteResponse.success) {
        throw new Error(quoteResponse.message || 'Failed to create transfer quote');
      }

      console.log('Transfer quote created:', quoteResponse.data);

      // Execute the transfer using dLocal
      const transferResponse = await apiFetch('/transfer/dlocal', {
        method: 'POST',
        body: JSON.stringify({
          quoteId: quoteResponse.data._id,
          recipientId: recipient._id,
          amount: parseFloat(amount),
          fromCurrency: 'USD',
          toCurrency: recipient.currency || 'PKR',
          cardId: null // Will use wallet balance instead of card
        })
      });
      if (!transferResponse.success) {
        throw new Error(transferResponse.message || 'Failed to execute transfer');
      }

      console.log('Transfer executed successfully:', transferResponse.data);

      // Update wallet balance immediately if returned from backend
      if (transferResponse.data.walletBalance !== undefined) {
        updateBalance(transferResponse.data.walletBalance);
        setWalletBalance(transferResponse.data.walletBalance);
        console.log('💰 Wallet balance updated to:', transferResponse.data.walletBalance);
      } else {
        // Fallback: manually calculate new balance
        const newBalance = walletBalance - parseFloat(amount);
        updateBalance(newBalance);
        setWalletBalance(newBalance);
        console.log('💰 Wallet balance manually updated to:', newBalance);
      }

      // Add transfer as a transaction
      const transferTransaction = {
        _id: transferResponse.data.transferId,
        type: 'debit',
        amount: parseFloat(amount),
        description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
        date: new Date().toISOString(),
        status: transferResponse.data.status || 'completed' // Use actual status from backend
      };
      addTransaction(transferTransaction);
      console.log('📝 Transfer transaction added to wallet');

      // Refresh wallet data to get latest transactions from server
      setTimeout(async () => {
        await refreshWallet();
        console.log('🔄 Wallet data refreshed after transfer');
      }, 1000); // Small delay to ensure backend has processed

      // Navigate to PaymentSuccessScreen with transfer details
      router.push({
        pathname: '/screens/PaymentSuccessScreen',
        params: {
          transferId: transferResponse.data.transferId,
          amount: amount,
          recipientName: recipient.firstName + ' ' + recipient.lastName,
          status: 'success'
        }
      });

    } catch (err) {
      console.error('❌ Error executing DLOCAL transfer:', err);
      
      // Parse error message to provide better user guidance
      let errorMessage = err.message || 'Failed to execute transfer. Please try again.';
      let alertTitle = 'Transfer Failed';
      
      // Check if it's a minimum amount error
      if (errorMessage.includes('Minimum amount for this transfer is')) {
        alertTitle = 'Amount Too Small';
        errorMessage = `${errorMessage}\n\n💡 Tip: Try increasing your transfer amount to at least $10 for better value.`;
      } else if (errorMessage.includes('Transfer fee')) {
        alertTitle = 'Transfer Fee Issue';
        errorMessage = `${errorMessage}\n\n💡 Tip: Larger transfer amounts typically have better fee ratios.`;
      }
      
      Alert.alert(
        alertTitle,
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle send money
  const handleSendMoney = async () => {
    console.log('💰 handleSendMoney called with:', { recipient, amount });
    
    if (!recipient) {
      console.log('❌ No recipient in handleSendMoney');
      setError('No recipient selected');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log('❌ No amount in handleSendMoney');
      setError('Please enter a valid amount');
      return;
    }

    // Check minimum amount to avoid fee issues
    const amountValue = parseFloat(amount);
    if (amountValue < 10) {
      console.log('❌ Amount too small in handleSendMoney');
      setError('Minimum transfer amount is $10. Small amounts have high fee ratios and may not be processed.');
      return;
    }

    // Validate wallet balance before proceeding
    if (!validateWalletBalance(amount)) {
      return;
    }

    // Execute the transfer directly
    await executeDLocalTransfer();
  };

  // Handle send icon press from bottom navigation
  const handleSendIconPress = () => {
    console.log('🚀 Send icon clicked!');
    console.log('📋 Current state:', { recipient, amount, loading, error });
    
    if (!recipient) {
      console.log('❌ No recipient selected, redirecting to RecipientsScreen');
      // If no recipient selected, go to recipients screen first
      router.push('/screens/RecipientsScreen');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log('❌ No amount entered, showing error');
      // If no amount entered, show error and focus on amount input
      setError('Please enter a valid amount');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    console.log('✅ Both recipient and amount valid, proceeding with transfer');
    // If both recipient and amount are valid, proceed with transfer
    handleSendMoney();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/screens/RecipientsScreen')}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Money Transfer</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#234881" />
              <Text style={styles.loadingText}>Loading recipient details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/screens/RecipientsScreen')}>
                <Text style={styles.retryButtonText}>Select Recipient</Text>
              </TouchableOpacity>
            </View>
          ) : recipient ? (
            <View style={styles.recipientRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getRecipientInitials(getRecipientName())}</Text>
                  <Feather name="star" size={14} color="#FFD700" style={styles.starIcon} />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.recipientName}>{getRecipientName()}</Text>
                  <Feather name="home" size={16} color="#234881" style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.recipientAccount}>
                  {maskAccountInfo(recipient.bankDetails?.accountNumber, recipient.bankDetails?.iban)}
                </Text>
                {recipient.bankDetails?.accountName && (
                  <Text style={styles.bankName}>{recipient.bankDetails.accountName}</Text>
                )}
                {recipient.country && (
                  <Text style={styles.countryText}>{recipient.country}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noRecipientContainer}>
              <Text style={styles.noRecipientText}>No recipient selected</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.selectRecipientButton} onPress={() => router.push('/screens/RecipientsScreen')}>
                  <Text style={styles.selectRecipientButtonText}>Select Recipient</Text>
                </TouchableOpacity>
                {recipientId && (
                  <TouchableOpacity style={styles.refreshButton} onPress={refreshRecipientData}>
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recipientId && (
                <Text style={styles.debugText}>Debug: Context has recipientId: {recipientId}</Text>
              )}
            </View>
          )}
          {/* Wallet Balance Display */}
          <View style={styles.walletBalanceContainer}>
            <Text style={styles.walletBalanceLabel}>Available Balance:</Text>
            <Text style={styles.walletBalanceAmount}>${walletBalance.toFixed(2)} USD</Text>
          </View>
          
          <Text style={styles.label}>Enter amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              ref={inputRef}
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              maxLength={10}
              textAlign="center"
              selectionColor="#234881"
            />
            <Text style={styles.usdText}>.USD</Text>
          </View>
          
          {/* Amount Hint */}
          <Text style={styles.amountHint}>
            💡 Minimum amount: $10 for better fee ratios
          </Text>
          
          {/* Insufficient Funds Warning */}
          {parseFloat(amount) > walletBalance && parseFloat(amount) > 0 && (
            <Text style={styles.insufficientFundsText}>
              Insufficient funds in your wallet
            </Text>
          )}
          
          <TouchableOpacity 
            style={[
              styles.sendBtn, 
              (!recipient || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance) && styles.sendBtnDisabled
            ]} 
            onPress={handleSendMoney}
            disabled={!recipient || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance || loading || transferLoading}
          >
            <Text style={[
              styles.sendBtnText,
              (!recipient || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance) && styles.sendBtnTextDisabled
            ]}>
              {transferLoading ? 'Processing Transfer...' : loading ? 'Processing...' : 'Send now'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="recipients" onSendPress={handleSendIconPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '80%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
    textAlign: 'left',
    marginTop: 0,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#234881',
  },
  starIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginRight: 2,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'left',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    width: 120,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  usdText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '400',
    marginLeft: 4,
    marginBottom: 6,
  },
  sendBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  sendBtnTextDisabled: {
    color: '#999',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#234881',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noRecipientContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noRecipientText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  selectRecipientButton: {
    backgroundColor: '#234881',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  selectRecipientButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  bankName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  countryText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  walletBalanceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  walletBalanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  walletBalanceAmount: {
    fontSize: 18,
    color: '#234881',
    fontWeight: '700',
  },
  insufficientFundsText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  amountHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
    zIndex: 10,
  },
  sendLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#234881',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MoneyTransferScreen; 