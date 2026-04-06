import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';
import { useRecipient } from '../context/RecipientContext';

const Recepentdetails = () => {
  const [account, setAccount] = useState('');
  const [activeTab, setActiveTab] = useState('Send');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedBank, country, setRecipientId } = useRecipient();
  const router = useRouter();

  // IBAN/account validation (simple: IBAN starts with 2 letters, 2 digits, then 12-30 alphanum; account: 10-16 digits)
  const validateAccount = (val) => {
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{12,30}$/i;
    const accRegex = /^\d{10,16}$/;
    if (ibanRegex.test(val.replace(/\s+/g, ''))) return true;
    if (accRegex.test(val.replace(/\s+/g, ''))) return true;
    return false;
  };

  const handleInputChange = (val) => {
    setAccount(val);
    setIsValid(validateAccount(val));
  };

  const handleContinue = async () => {
    if (!account.trim() || !validateAccount(account.trim())) {
      setErrorMsg('Enter a valid IBAN or account number');
      setModalVisible(true);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // Use the new endpoint for IBAN/account only
      const payload = {
        iban: account.trim(),
        bank: selectedBank?.name || selectedBank?.code, // Try both name and code
        country: country,         // from context or user selection
      };
      
      console.log('Sending payload to backend:', payload);
      console.log('Selected bank:', selectedBank);
      console.log('Country:', country);
      
      // Show user that bank will be auto-detected if not selected
      if (!selectedBank) {
        console.log('No bank selected - will auto-detect from IBAN');
      }
      
      const res = await apiFetch('/api/v1/recipients/iban-only', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Backend response:', res);
      setRecipientId(res.data?._id || res.data?.id || res.data?.data?._id || res.data?.data?.id);
      router.push('/screens/RecepentName');
    } catch (err) {
      let errorMsg = 'Failed to create recipient. Please try again.';
      if (err instanceof Error) {
        try {
          const errObj = JSON.parse(err.message);
          if (errObj.error && errObj.error.toLowerCase().includes('iban')) {
            errorMsg = 'User with this IBAN already exists';
          }
        } catch {}
      }
      setErrorMsg(errorMsg);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Error Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="error-outline" size={40} color="#e74c3c" style={{ marginBottom: 10 }} />
            <Text style={styles.modalText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => {
          if (router.canGoBack && router.canGoBack()) {
            router.back();
          } else {
            router.push('/screens/RecipientsScreen');
          }
        }}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/screens/RecipientsScreen')}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      {/* <View style={styles.progressBar} /> */}
      {/* Content */}
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Recipient’s bank Details</Text>
        <Text style={styles.subtitle}>Enter your recipient’s National Bank account details.</Text>
        <Text style={styles.label}>IBAN or account number</Text>
        <View style={{ position: 'relative', height: 56 }}>
          <TextInput
            style={[
              styles.input,
              account.length === 0 ? { borderColor: '#e74c3c', borderWidth: 2 } :
              isValid ? { borderColor: '#27ae60', borderWidth: 2 } : { borderColor: '#e74c3c', borderWidth: 2 }
            ]}
            placeholder="e.g, PK23**********************"
            placeholderTextColor="#999"
            value={account}
            onChangeText={handleInputChange}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        {!selectedBank && account && isValid && (
          <View style={styles.infoBox}>
            <Feather name="info" size={16} color="#234881" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Bank will be auto-detected from your IBAN
            </Text>
          </View>
        )}
        <View style={styles.warningRow}>
          <View style={styles.infoCircle}>
            <Feather name="info" size={18} color="#888" />
          </View>
          <Text style={styles.warningText}>
            Please verify your recipient's account information. You can lose the transfer amount if incorrect information is provided.
          </Text>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} disabled={loading}>
          <Text style={styles.continueBtnText}>{loading ? 'Processing...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
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
  progressBar: {
    height: 4,
    backgroundColor: '#234881',
    width: '100%',
    marginBottom: 8,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24, // Increased top padding
    paddingBottom: 32, // Add bottom padding for space above nav
    justifyContent: 'center', // Center content vertically
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold', // Use bold for title
    color: '#222',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24, // More space below subtitle
    textAlign: 'left',
    lineHeight: 20,
    fontWeight: 'normal', // Regular for subtitle
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold', // Bold for label
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
  },
  input: {
    height: 56,
    borderWidth: 1, // Ensure border is visible
    borderColor: '#bdbdbd', // Default color
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    textAlign: 'left',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24, // More space below warning
    marginTop: 2,
  },
  infoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 18,
    textAlign: 'left',
    fontWeight: 'normal', // Regular for warning
  },
  continueBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32, // More space below button
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: 'bold',
  },
  modalBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6fb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#234881',
    fontWeight: '400',
    flex: 1,
  },
});

export default Recepentdetails;
