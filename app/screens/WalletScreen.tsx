import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/BottomNavBar';
import { useWallet } from '../context/WalletContext';

const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const router = useRouter();
  const { walletData, loading, refreshWallet } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh wallet data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  },[refreshWallet]);

  // Navigate to deposit screen
  const handleDeposit = () => {
    router.push('/screens/DepositScreen');
  };

  // Navigate to send money screen
  const handleSendMoney = () => {
    router.push('/screens/MoneyTransferScreen');
  };

  // Navigate to virtual card screen
  const handleVirtualCard = () => {
    router.push('/screens/VirtualCard');
  };

  // Handle send money from bottom nav
  const handleSendFromNav = () => {
    router.push('/screens/HomePage');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'No Time';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  // Refresh wallet when screen comes into focus (e.g., after completing a transfer)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 WalletScreen focused - refreshing wallet data');
      refreshWallet();
    }, [refreshWallet])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25467D" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(walletData.balance)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleVirtualCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="card" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Virtual Card</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/screens/HomePage')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {walletData.transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {walletData.transactions.slice(0, 5).map((transaction, index) => (
                  <View key={transaction._id || index} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Ionicons 
                        name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
                        size={20} 
                        color={transaction.type === 'credit' ? '#10B981' : '#EF4444'} 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>
                        {transaction.description || 'Transaction'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {transaction.date || transaction.createdAt ? 
                          `${formatDate(transaction.date || transaction.createdAt)} • ${formatTime(transaction.date || transaction.createdAt)}` : 
                          'Just now • Just now'
                        }
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={[
                        styles.amountText,
                        { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
                      ]}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="wallet" onSendPress={handleSendFromNav} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#25467D',
  },scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to the bottom to make space for the bottom bar
  },balanceCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#25467D',
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25467D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#25467D',
    textAlign: 'center',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#25467D',
  },viewAllText: {
    fontSize: 14,
    color: '#25467D',
    fontWeight: '500',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#25467D',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666666',
  },transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },});

export default WalletScreen; 