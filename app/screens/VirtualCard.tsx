import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Web-compatible storage solution
const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // For mobile, use AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.log('Storage read error:', error);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      // For mobile, use AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.log('Storage write error:', error);
  }
};

function maskCardNumber(cardNumber: string) {
  return cardNumber.replace(/\d{4}(?=\d{4})/g, '**** ');
}

function generateCard() {
  // Simple random card generator for demo
  const cardNumber = Array(4).fill(0).map(() => Math.floor(1000 + Math.random() * 9000)).join(' ');
  const expiry = `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(new Date().getFullYear() + 3).slice(-2)}`;
  const cvv = String(Math.floor(100 + Math.random() * 900));
  return { cardNumber, expiry, cvv };
}

const VirtualCard = () => {
  const [card, setCard] = useState<{ cardNumber: string; expiry: string; cvv: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserAndCard();
  },[]);

  const loadUserAndCard = async () => {
    try {
      setLoading(true);
      
      // First, get the current user ID
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id || user.userId);
        
        // Create user-specific card key
        const userCardKey = `virtual_card_${user.id || user.userId}`;
        
        // Try to load existing card for this user
        const stored = await getStorageItem(userCardKey);
        if (stored) {
          setCard(JSON.parse(stored));
        } else {
          // No card exists for this user, show empty state
          setCard(null);
        }
      } else {
        // No user data, show empty state
        setCard(null);
      }
    } catch (error) {
      console.log('Error loading user and card:', error);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please sign in again.');
      return;
    }

    try {
      const newCard = generateCard();
      setCard(newCard);
      
      // Save card with user-specific key
      const userCardKey = `virtual_card_${userId}`;
      await setStorageItem(userCardKey, JSON.stringify(newCard));
      
      setShowDetails(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Error generating card:', error);
      Alert.alert('Error', 'Failed to generate card. Please try again.');
    }
  };

  const handleCopy = async (field: 'cardNumber' | 'expiry' | 'cvv') => {
    if (!card) return;
    // In a real app, you would use Clipboard API here
    const fieldName = field === 'cvv' ? 'CVV' : field === 'expiry' ? 'Expiry' : 'Card number';
    Alert.alert('Copied!', `${fieldName} copied to clipboard`);
  };

  const handleBack = () => {
    try {
      // Check if we can go back, if not navigate to wallet screen
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback to wallet screen if no navigation history
        router.push('/screens/WalletScreen');
      }
    } catch (error) {
      console.log('Navigation error:', error);
      // Always fallback to wallet screen on error
      router.push('/screens/WalletScreen');
    }
  };

  const navigateToWallet = () => {
    try {
      router.push('/screens/WalletScreen');
    } catch (error) {
      console.log('Navigation to wallet error:', error);
      // Try to go back as last resort
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading your virtual card...</Text>
            <Text style={styles.loadingSubtext}>Please wait a moment</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Virtual Card</Text>
          <TouchableOpacity style={styles.homeButton} onPress={navigateToWallet}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.homeButtonGradient}
            >
              <Ionicons name="home-outline" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="person-circle-outline" size={60} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>Authentication Required</Text>
            <Text style={styles.emptySubtitle}>Please sign in to access your virtual card features and manage your digital payments securely.</Text>
          </View>
          
          <TouchableOpacity style={styles.generateButton} onPress={() => router.push('/screens/signin')}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.generateButtonGradient}
            >
              <Text style={styles.generateButtonText}>Sign In to Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAuthButton} onPress={navigateToWallet}>
            <View style={styles.secondaryAuthButtonContent}>
              <Ionicons name="wallet-outline" size={20} color="#667eea" />
              <Text style={styles.secondaryAuthButtonText}>Back to Wallet</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Virtual Card</Text>
          <TouchableOpacity style={styles.homeButton} onPress={navigateToWallet}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.homeButtonGradient}
            >
              <Ionicons name="home-outline" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="card-outline" size={60} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>Create Your Virtual Card</Text>
            <Text style={styles.emptySubtitle}>Generate your first virtual debit card to enjoy secure online payments and digital transactions worldwide.</Text>
          </View>
          
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.generateButtonGradient}
            >
              <Text style={styles.generateButtonText}>Generate Virtual Card</Text>
              <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAuthButton} onPress={navigateToWallet}>
            <View style={styles.secondaryAuthButtonContent}>
              <Ionicons name="wallet-outline" size={20} color="#667eea" />
              <Text style={styles.secondaryAuthButtonText}>Back to Wallet</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Card</Text>
        <TouchableOpacity style={styles.homeButton} onPress={navigateToWallet}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.homeButtonGradient}
          >
            <Ionicons name="home-outline" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardLogo}>
                <Ionicons name="card" size={24} color="#667eea" />
              </View>
              <Text style={styles.cardType}>VIRTUAL DEBIT</Text>
            </View>

            {/* Card Number Section */}
            <View style={styles.cardNumberSection}>
              <TouchableOpacity onPress={() => handleCopy('cardNumber')} style={styles.cardNumberTouchable}>
                <Text style={styles.cardNumber}>
                  {showDetails ? card.cardNumber : '**** **** **** ****'}
                </Text>
                <View style={styles.copyHintContainer}>
                  <Ionicons name="copy-outline" size={16} color="#a0a0a0" />
                  <Text style={styles.copyHint}>Tap to copy</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Card Details */}
            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>EXPIRY</Text>
                <TouchableOpacity onPress={() => handleCopy('expiry')} style={styles.detailTouchable}>
                  <Text style={styles.detailValue}>
                    {showDetails ? card.expiry : '**/**'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>CVV</Text>
                <TouchableOpacity onPress={() => handleCopy('cvv')} style={styles.detailTouchable}>
                  <Text style={styles.detailValue}>
                    {showDetails ? card.cvv : '***'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.chipContainer}>
                <View style={styles.chip} />
              </View>
              <View style={styles.cardBrand}>
                <Text style={styles.brandText}>VISA</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleToggleDetails}>
            <LinearGradient
              colors={showDetails ? ['#ff6b6b', '#ee5a24'] : ['#667eea', '#764ba2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons 
                name={showDetails ? "eye-off" : "eye"} 
                size={20} 
                color="white" 
                style={styles.buttonIcon} 
              />
              <Text style={styles.actionButtonText}>
                {showDetails ? 'Hide Details' : 'Reveal Details'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Info', 'Card management features coming soon!')}>
            <View style={styles.secondaryButtonContent}>
              <Ionicons name="settings-outline" size={20} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Manage Card</Text>
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#667eea" />
            <Text style={styles.infoText}>Secure digital payments worldwide</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="globe" size={20} color="#667eea" />
            <Text style={styles.infoText}>Accepted at millions of locations</Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalGradient}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="checkmark-circle" size={60} color="white" />
                </View>
                <Text style={styles.modalTitle}>Card Generated!</Text>
                <Text style={styles.modalMessage}>Your virtual debit card has been successfully created and is ready to use.</Text>
                <TouchableOpacity style={styles.modalButton} onPress={closeSuccessModal}>
                  <Text style={styles.modalButtonText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    marginTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  homeButton: {
    marginLeft: 15,
  },
  homeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(102, 126, 234, 0.3)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardContainer: {
    marginBottom: 30,
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 15,
      },
    }),
  },
  cardGradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 220,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardType: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardNumberSection: {
    marginBottom: 30,
  },
  cardNumberTouchable: {
    alignItems: 'center',
  },
  cardNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  copyHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyHint: {
    color: '#a0a0a0',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#a0a0a0',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  detailTouchable: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipContainer: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    width: 24,
    height: 18,
    borderRadius: 3,
    backgroundColor: '#ffed4e',
  },
  cardBrand: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  brandText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionButtons: {
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 15,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardInfo: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: '#4a5568',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 8,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#667eea',
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    marginBottom: 40,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 12,
      },
    }),
    width: width - 80,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 12,
      },
    }),
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  generateButton: {
    width: width - 80,
    ...Platform.select({
      web: {
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 12,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 20,
  },
  modalGradient: {
    padding: 32,
    minWidth: 300,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAuthButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
    elevation: 4,
    marginTop: 15,
  },
  secondaryAuthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAuthButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VirtualCard; 