import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';
import { useRecipient } from '../context/RecipientContext';

const RecepentName = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [activeTab, setActiveTab] = useState('Send');
  const [focusField, setFocusField] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { recipientId } = useRecipient();

  const handleContinue = async () => {
    if (!firstName.trim()) {
      setErrorMsg('Please fill in the First name');
      setModalVisible(true);
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Please fill in the Last name');
      setModalVisible(true);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      if (!recipientId) throw new Error('Recipient not found');
      const payload = { firstName, middleName, lastName };
      await apiFetch(`/api/v1/recipients/${recipientId}/updaterecipient`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.push('/screens/RecepentNotification');
    } catch (err) {
      setErrorMsg('Failed to update recipient');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldValue, fieldName) => {
    if (focusField === fieldName) {
      return { borderColor: '#e74c3c', borderWidth: 2 };
    }
    if (fieldValue.trim().length > 0) {
      return { borderColor: '#27ae60', borderWidth: 2 };
    }
    return { borderColor: '#bdbdbd', borderWidth: 1 };
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
            <Feather name="alert-circle" size={40} color="#e74c3c" style={{ marginBottom: 10 }} />
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
            router.replace('/screens/WalletScreen');
          }
        }}>
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
      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Transfers to NGOs or charities in Pakistan aren't supported and may be automatically canceled
        </Text>
      </View>
      {/* Content */}
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Recipient name</Text>
        <Text style={styles.subtitle}>
          This information should match the name on your recipient's bank account.
        </Text>
        <Text style={styles.label}>First name</Text>
        <TextInput
          style={[styles.input, getInputStyle(firstName, 'first')]}
          placeholder="e.g, First Name"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={setFirstName}
          onFocus={() => setFocusField('first')}
          onBlur={() => setFocusField('')}
        />
        <Text style={styles.label}>Middle name (optional)</Text>
        <TextInput
          style={[styles.input, getInputStyle(middleName, 'middle')]}
          placeholder="e.g, Middle Name"
          placeholderTextColor="#999"
          value={middleName}
          onChangeText={setMiddleName}
          onFocus={() => setFocusField('middle')}
          onBlur={() => setFocusField('')}
        />
        <Text style={styles.label}>Last name</Text>
        <TextInput
          style={[styles.input, getInputStyle(lastName, 'last')]}
          placeholder="e.g, Last Name"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={setLastName}
          onFocus={() => setFocusField('last')}
          onBlur={() => setFocusField('')}
        />
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} disabled={loading}>
          <Text style={styles.continueBtnText}>{loading ? 'Processing...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
      {/* Bottom Navigation - removed to prevent double nav bar */}
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
    width: '18%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  infoBox: {
    backgroundColor: '#e6f0fa',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 12,
  },
  infoText: {
    color: '#234881',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 18,
    textAlign: 'left',
    lineHeight: 18,
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '700',
    marginBottom: 8, // More space below label
    marginTop: 18, // More space above label
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    textAlign: 'left',
    marginBottom: 12, // Add space below input
  },
  continueBtn: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#234881',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RecepentName; 