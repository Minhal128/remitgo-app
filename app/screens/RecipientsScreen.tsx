import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavBar from '../../components/BottomNavBar';
import { useRecipient } from '../context/RecipientContext';
import { apiFetch } from '../utils/api';

const RecipientsScreen = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const { setRecipientId } = useRecipient();

  // Fetch recipients on component mount
  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiFetch('/api/v1/recipients/getallrecipient');
      console.log('Recipients fetched:', response);
      
      if (response.success && response.data) {
        setRecipients(response.data);
      } else {
        setError('Failed to load recipients');
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setError('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    // Set the recipient ID in context and navigate directly to MoneyTransferScreen
    setRecipientId(recipient._id);
    router.push('/screens/MoneyTransferScreen');
  };

  const getRecipientInitials = (recipient) => {
    if (recipient.firstName && recipient.lastName) {
      return (recipient.firstName[0] + recipient.lastName[0]).toUpperCase();
    }
    if (recipient.firstName) {
      return recipient.firstName.substring(0, 2).toUpperCase();
    }
    if (recipient.bankDetails?.accountName) {
      return recipient.bankDetails.accountName.substring(0, 2).toUpperCase();
    }
    return 'RC';
  };

  const getRecipientName = (recipient) => {
    if (recipient.firstName && recipient.lastName) {
      return `${recipient.firstName} ${recipient.lastName}`;
    }
    if (recipient.firstName) {
      return recipient.firstName;
    }
    if (recipient.bankDetails?.accountName) {
      return recipient.bankDetails.accountName;
    }
    return 'Recipient';
  };

  const maskAccountInfo = (recipient) => {
    if (recipient.bankDetails?.iban) {
      return `${recipient.bankDetails.iban.slice(0, 4)}****${recipient.bankDetails.iban.slice(-4)}`;
    }
    if (recipient.bankDetails?.accountNumber) {
      return `${recipient.bankDetails.accountNumber.slice(0, 4)}****${recipient.bankDetails.accountNumber.slice(-4)}`;
    }
    return '****';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipients</Text>
        <TouchableOpacity onPress={() => router.push('/screens/Recepentdetails')}>
          <Text style={styles.headerAdd}>Add</Text>
        </TouchableOpacity>
      </View>
      
      {/* Hint Text */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>Tap on a recipient to send money</Text>
      </View>
      
      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#234881" />
          <Text style={styles.loadingText}>Loading recipients...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipients}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : recipients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipients found</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/screens/Recepentdetails')}>
            <Text style={styles.addButtonText}>Add Recipient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Recipients List */}
          <FlatList
            data={recipients}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => handleRecipientSelect(item)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getRecipientInitials(item)}</Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{getRecipientName(item)}</Text>
                  <Text style={styles.recipientAccount}>{maskAccountInfo(item)}</Text>
                  {item.country && <Text style={styles.recipientCountry}>{item.country}</Text>}
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="recipients" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  headerAdd: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  hintContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    // Add interactive feedback
    transform: [{ scale: 1 }],
    // Add press feedback
    activeOpacity: 0.7,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recipientCountry: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#234881',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  arrowContainer: {
    marginLeft: 'auto',
    paddingLeft: 16,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#234881',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#234881',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

export default RecipientsScreen; 