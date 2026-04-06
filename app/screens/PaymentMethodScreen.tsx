import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';

const PaymentMethodScreen = () => {
  const [activeTab, setActiveTab] = useState('Send');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Payment method</Text>
        <TouchableOpacity style={styles.addCardBtn} onPress={() => setShowAddCardModal(true)}>
          <Feather name="credit-card" size={28} color="#234881" style={{ marginRight: 14 }} />
          <Text style={styles.addCardText}>Add new card</Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          Credit cards and business debit cards may charge a cash advance fee. To avoid extra fees, use a personal debit card.
        </Text>
        <TouchableOpacity onPress={() => router.push('/screens/MoneyTransferScreen')}>
          <Text style={styles.linkText}>Pay with Bank Account instead</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="send" />
      <Modal
        visible={showAddCardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Changing your payment method to bank account will change the delivery speed to economy. This may affect the exchange rate and fees.
            </Text>
            <View style={styles.modalButtonContainer}>
                              <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={() => {
                    setShowAddCardModal(false);
                    router.push('/screens/MoneyTransferScreen');
                  }}
                >
                  <Text style={styles.modalPrimaryButtonText}>Ok</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: '64%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 0,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 24,
    textAlign: 'left',
    marginTop: 0,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  addCardText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '400',
    marginBottom: 32,
    marginTop: 0,
  },
  linkText: {
    color: '#234881',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 0,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    minWidth: 270,
    maxWidth: 340,
    marginHorizontal: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#222',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '400',
    lineHeight: 20,
  },
  modalButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalPrimaryButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '48%',
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondaryButton: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '48%',
  },
  modalSecondaryButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentMethodScreen; 