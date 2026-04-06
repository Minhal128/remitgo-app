import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MethodScreen = () => {
  const [selected, setSelected] = useState('bank');
  const [showPromo, setShowPromo] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(SCREEN_HEIGHT));
  const router = useRouter();

  const showModal = () => {
    setShowPromo(true);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnimation, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setShowPromo(false);
    });
  };

  const hideModalAndNavigate = () => {
    Animated.timing(slideAnimation, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setShowPromo(false);
      router.push('/screens/SelectBankScreen');
    });
  };

  const PromoExchangeRatePopup = () => (
    <Modal
      transparent
      visible={showPromo}
      animationType="none"
      onRequestClose={hideModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackground} 
          activeOpacity={1} 
          onPress={hideModal}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnimation }]},]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Promo exchange rate</Text>
            <TouchableOpacity onPress={hideModalAndNavigate} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              New customer offer applies to this transfer
            </Text>
            
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>Promo rate</Text>
            </View>

            <View style={styles.exchangeRateContainer}>
              <Text style={styles.exchangeRateText}>
                <Text style={styles.currencyAmount}>1 USD</Text>
                <Text style={styles.equals}> = </Text>
                <Text style={styles.exchangeAmount}>272.50 PKR</Text>
              </Text>
              <Text style={styles.exchangeSubtext}>
                Applies to the first 1000 USD
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.exchangeRateContainer}>
              <Text style={styles.exchangeRateText}>
                <Text style={styles.currencyAmount}>1 USD</Text>
                <Text style={styles.equals}> = </Text>
                <Text style={styles.exchangeAmount}>272.50 PKR</Text>
              </Text>
              <Text style={styles.exchangeSubtext}>
                Applies to the rest of your transfer
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => {
          if (router.canGoBack && router.canGoBack()) {
            router.back();
          } else {
            router.replace('/screens/WalletScreen');
          }
        }}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Speed Section */}
        <Text style={styles.sectionTitle}>Delivery speed</Text>
        <Text style={styles.sectionSubtitle}>How would you like the money delivered?</Text>
        <View style={styles.promoBanner}>
          <Text style={styles.promoBannerText}>Get zero fees for recipients</Text>
        </View>

        {/* Delivery Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selected === 'bank' && styles.selectedOptionButton,
            ]}
            onPress={() => setSelected('bank')}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, selected === 'bank' && styles.selectedOptionText]}>
              Bank Deposit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selected === 'cash' && styles.selectedOptionButton,
            ]}
            onPress={() => setSelected('cash')}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, selected === 'cash' && styles.selectedOptionText]}>
              Cash Pickup
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selected === 'mobile' && styles.selectedOptionButton,
            ]}
            onPress={() => setSelected('mobile')}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, selected === 'mobile' && styles.selectedOptionText]}>
              Mobile Money
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fee Summary */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Earliest delivery</Text>
            <Text style={styles.feeValue}>Instant</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Fee</Text>
            <Text style={styles.feeValue}>0.00 USD</Text>
          </View>
          <View style={[styles.feeRow, styles.feeRowTotal]}>
            <Text style={styles.feeLabelTotal}>Total</Text>
            <Text style={styles.feeValueTotal}>2,000 USD</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={showModal}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        {/* Info/Disclaimer */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>New customer offer applied:</Text> zero fees and a promotional exchange rate for the first 1000 USD of this transfer. Standard rate applies to the remainder of this transfer.
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Transfer speed:</Text> is an estimate dependent on payment method, delivery method, transaction review, and system availability of RemitGo and our partners.
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Speed may not be available</Text> on this screen but it's always estimated in the Transfer Summary before you send.
          </Text>
        </View>
      </ScrollView>

      {/* Popup Modal */}
      <PromoExchangeRatePopup />
      <BottomNavBar activeTab="send" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: '#fff' 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerIcon: {
    padding: 4,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 120, // Increased padding to prevent overlap with BottomNavBar
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginTop: 24,
    marginBottom: 2,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  promoBanner: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  promoBannerText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#234881',
    borderColor: '#234881',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#234881',
  },
  selectedOptionText: {
    color: '#fff',
  },
  feeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  feeLabelTotal: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  feeValueTotal: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    textAlign: 'left',
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: '700',
    color: '#222',
  },
  // Remove the custom bottom navigation styles
  bottomNav: {
    // Removed to prevent overlap
  },
  navItem: {
    // Removed to prevent overlap
  },
  navLabel: {
    // Removed to prevent overlap
  },
  sendButtonWrapper: {
    // Removed to prevent overlap
  },
  sendButton: {
    // Removed to prevent overlap
  },
  sendLabel: {
    // Removed to prevent overlap
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoTag: {
    backgroundColor: '#b3e5fc',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 24,
  },
  promoTagText: {
    color: '#0277bd',
    fontSize: 12,
    fontWeight: '600',
  },
  exchangeRateContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  exchangeRateText: {
    fontSize: 24,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '400', // Make normal by default
  },
  currencyAmount: {
    color: '#222',
    fontWeight: '400', // Normal weight for '1 USD'
  },
  equals: {
    color: '#666',
    fontWeight: '400',
  },
  exchangeAmount: {
    color: '#234881',
    fontWeight: '700', // Bold for '272.50 PKR'
  },
  exchangeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  // New styles for bottom sheet
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 28,
    paddingBottom: 40,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 5,
      },
    }),
    minHeight: 340,
  },
  closeIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 2,
    padding: 4,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    marginTop: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  dividerTitle: {
    height: 1,
    backgroundColor: '#e5e5e5',
    width: '110%',
    marginTop: 12,
    marginBottom: 18,
    alignSelf: 'center',
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  promoRateBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 7,
    marginBottom: 10,
    alignSelf: 'center',
  },
  promoRateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  promoRateLine: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    textAlign: 'center',
  },
  promoRateCurrency: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 20,
  },
  promoRateEquals: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 20,
  },
  promoRateValue: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 24,
  },
  promoDesc: {
    fontSize: 13,
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    width: '100%',
    marginVertical: 18,
  },
});

export default MethodScreen;