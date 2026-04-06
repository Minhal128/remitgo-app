import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';
import { useRecipient } from '../context/RecipientContext';

const RecepentNotification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('Send');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { recipientId } = useRecipient();

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      setModalMsg('Please fill in the recipient phone number');
      setModalVisible(true);
      setPendingRedirect(false);
      return;
    }
    setLoading(true);
    setModalMsg('');
    try {
      if (!recipientId) throw new Error('Recipient not found');
      const payload = { phone: phoneNumber.trim(), receiveSMSUpdates: true };
      await apiFetch(`/api/v1/recipients/${recipientId}/updaterecipient`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setModalMsg('Notification enabled');
      setModalVisible(true);
      setPendingRedirect(true);
    } catch (err) {
      setModalMsg('Failed to enable notification');
      setModalVisible(true);
      setPendingRedirect(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/screens/senderdetails');
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (pendingRedirect) {
      setTimeout(() => {
        router.push('/screens/senderdetails');
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Error/Success Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather name={modalMsg === 'Notification enabled' ? 'check-circle' : 'alert-circle'} size={40} color={modalMsg === 'Notification enabled' ? '#27ae60' : '#e74c3c'} style={{ marginBottom: 10 }} />
            <Text style={styles.modalText}>{modalMsg}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleModalClose}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/screens/RecepentName')}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/screens/RecepentName')}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.content}>
          <Text style={styles.title}>Recipient notification</Text>
          <Text style={styles.subtitle}>
            Would you like us to text your recipient with{"\n"}transfer updates?
          </Text>
          <Text style={styles.inputLabel}>
            Recipient phone number <Text style={styles.optional}>(optional)</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                phoneNumber.trim().length > 0 && { borderColor: '#27ae60', borderWidth: 2 }
              ]}
              placeholder="PK (+92) ************"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        {/* Centered Buttons */}
        <View style={styles.centeredButtonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
            <Text style={styles.continueButtonText}>{loading ? 'Processing...' : 'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab="recipients" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '18%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },content: {
    flex: 1, // allow content to take up available space
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'left',
  },subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    textAlign: 'left',
    lineHeight: 18,
    fontWeight: '400',
  },
  inputLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'left',
  },optional: {
    color: '#666',
    fontWeight: '400',
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: 24,
  },input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    textAlign: 'left',
  },
  centeredButtonContainer: {
    alignItems: 'center',
    marginTop: 64, // Push buttons down to center visually
    marginBottom: 160, // Add space above bottom navigation
  },buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '90%',
  },continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },skipButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '400',
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
  },navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },activeNavLabel: {
    color: '#234881',
    fontWeight: '700',
  },
  sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },  sendButton: {
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
  },sendLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#234881',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },modalContent: {
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
      },})},modalText: {
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
  }
});

export default RecepentNotification;