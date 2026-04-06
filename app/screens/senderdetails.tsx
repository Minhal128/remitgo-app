import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';

const SenderDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [displayDob, setDisplayDob] = useState('');
  const [activeTab, setActiveTab] = useState('Send');
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Get transfer parameters from route
  const transferParams = {
    recipientId: params.recipientId as string,
    amount: params.amount as string,
    fromCurrency: params.fromCurrency as string,
    toCurrency: params.toCurrency as string
  };

  console.log('SenderDetails - Transfer parameters received:', transferParams);

  // Check if user already has sender details saved
  useEffect(() => {
    checkExistingSenderDetails();
  },[]);

  const checkExistingSenderDetails = async () => {
    try {
      setLoading(true);
      
      // First check if we have a token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if user profile already has sender details
      const response = await apiFetch('/user/profile');
      if (response.success && response.data) {
        const userProfile = response.data;
        
        // Only skip if user has ALL required fields AND they're not currently editing
        // Don't skip if user is in the middle of entering information
        if (userProfile.firstName && userProfile.lastName && userProfile.dob && 
            firstName === '' && lastName === '' && dob === '') {
          console.log('User already has complete sender details, skipping to address screen');
          router.replace('/screens/SenderAddressScreen');
          return;
        }
        
        // If user has partial information, pre-fill the fields
        if (userProfile.firstName && !firstName) setFirstName(userProfile.firstName);
        if (userProfile.lastName && !lastName) setLastName(userProfile.lastName);
        if (userProfile.dob && !dob) {
          // Convert YYYY-MM-DD to MM/DD/YYYY format
          const dateParts = userProfile.dob.split('-');
          if (dateParts.length === 3) {
            const month = dateParts[1];
            const day = dateParts[2];
            const year = dateParts[0];
            setDob(month + day + year);
            setDisplayDob(`${month} / ${day} / ${year}`);
          }
        }
      }
    } catch (err) {
      console.log('Error checking existing sender details:', err);
      // Continue with empty form if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Masked input handler
  const handleDobChange = (text: string) => {
    // Only allow digits
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let formatted = '';
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)} / ${cleaned.slice(4)}`;
    }
    setDob(cleaned);
    setDisplayDob(formatted);
  };

  // Helper to validate date
  const validateDOB = (dobString: string) => {
    if (dobString.length !== 8) return false;
    const mm = parseInt(dobString.slice(0, 2), 10);
    const dd = parseInt(dobString.slice(2, 4), 10);
    const yyyy = parseInt(dobString.slice(4, 8), 10);
    if (mm < 1 || mm > 12) return false;
    if (yyyy > currentYear) return false;
    // Days in month
    const daysInMonth = [31, (yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd < 1 || dd > daysInMonth[mm - 1]) return false;
    return true;
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setLoading(true); // Show loading state
    
    try {
      // Save the sender details
      const response = await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName,
          lastName,
          dob: `${dob.slice(4,8)}-${dob.slice(0,2)}-${dob.slice(2,4)}` // Format as YYYY-MM-DD
        }),
      });
      
      console.log('API Response received:', response);
      
      // Check if response is successful (either 'success: true' or 'user' object is present)
      if (response && (response.success === true || response.user)) {
        console.log('Sender details saved successfully');
        // Navigate directly to the next screen
        router.push({
          pathname: '/screens/SenderAddressScreen',
          params: transferParams
        });
      } else {
        console.log('Response indicates failure:', response);
        throw new Error(response?.message || 'Failed to save sender details');
      }
    } catch (err) {
      console.error('Error saving sender details:', err);
      setError('Failed to save sender details. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Only show completion screen if user has complete profile from database AND is not actively editing
  // This prevents the screen from showing while user is entering DOB
  const [hasCompleteProfileFromDB, setHasCompleteProfileFromDB] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  // Check if user has complete profile from database
  useEffect(() => {
    const checkDBProfile = async () => {
      try {
        setIsCheckingProfile(true);
        const response = await apiFetch('/user/profile');
        if (response.success && response.data) {
          const userProfile = response.data;
          const isComplete = userProfile.firstName && userProfile.lastName && userProfile.dob;
          setHasCompleteProfileFromDB(isComplete);
          
          // If user has complete profile, pre-fill the fields
          if (isComplete && !firstName && !lastName && !dob) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            if (userProfile.dob) {
              // Convert YYYY-MM-DD to MM/DD/YYYY format
              const dateParts = userProfile.dob.split('-');
              if (dateParts.length === 3) {
                const month = dateParts[1];
                const day = dateParts[2];
                const year = dateParts[0];
                setDob(month + day + year);
                setDisplayDob(`${month} / ${day} / ${year}`);
              }
            }
          }
        }
      } catch (err) {
        console.log('Error checking DB profile:', err);
        setHasCompleteProfileFromDB(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };
    checkDBProfile();
  }, []);
  
  // Show completion screen only if user has complete profile from DB and is not editing
  if (hasCompleteProfileFromDB && !isCheckingProfile && !loading && firstName === '' && lastName === '' && dob === '') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 }}>
          <Feather name="check-circle" size={80} color="#27ae60" style={{ marginBottom: 24 }} />
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 12, textAlign: 'center' }}>
            Sender Details Complete
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 10 }}>
            Your sender information is already saved and verified. You can proceed directly to sending money or edit your details if needed.
          </Text>
          
          <View style={{ width: '100%', marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.continueBtn, { marginBottom: 16 }]}
              onPress={() => router.push({
                pathname: '/screens/SenderAddressScreen',
                params: transferParams
              })}
            >
              <Text style={styles.continueBtnText}>Continue to Address</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.continueBtn, { 
                backgroundColor: 'transparent', 
                borderWidth: 2, 
                borderColor: '#234881',
                paddingVertical: 14
              }]}
              onPress={() => {
                // Clear the fields to allow editing
                setFirstName('');
                setLastName('');
                setDob('');
                setDisplayDob('');
                setHasCompleteProfileFromDB(false);
                // Force re-render by setting loading briefly
                setLoading(true);
                setTimeout(() => setLoading(false), 100);
              }}
            >
              <Text style={[styles.continueBtnText, { color: '#234881' }]}>Edit Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <Feather name="info" size={16} color="#666" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              Your information is securely stored and encrypted
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 40 }}>
            <ActivityIndicator size="large" color="#234881" />
            <Text style={{ marginTop: 20, fontSize: 18, color: '#234881', fontWeight: '600', textAlign: 'center' }}>
              Loading your profile...
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }}>
              Please wait while we retrieve your information
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.headerCenter}>
          <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
          <Text style={styles.headerTitle}>RemitGo</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Feather name="help-circle" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>Step 1 of 4</Text>
      </View>
      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Sender Details</Text>
          <Text style={styles.subtitle}>
            Please provide your personal information as it appears on your official ID
          </Text>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={[styles.input, styles.dobInput]}
              placeholder="MM / DD / YYYY"
              placeholderTextColor="#999"
              value={displayDob}
              onChangeText={handleDobChange}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'number-pad'}
              maxLength={22}
            />
            <Text style={styles.helpText}>
              Format: Month/Day/Year (e.g., 12/25/1990)
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.continueBtn, { marginTop: 32 }]}
          onPress={() => {
            if (!firstName || !lastName || !dob) {
              setError('Please fill in all required fields.');
              setShowErrorModal(true);
              return;
            }
            if (!validateDOB(dob)) {
              setError('Please enter a valid date of birth (MM/DD/YYYY).');
              setShowErrorModal(true);
              return;
            }
            setShowConfirmModal(true);
          }}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.continueBtnText}>Loading...</Text>
            </View>
          ) : (
            <Text style={styles.continueBtnText}>Continue</Text>
          )}
        </TouchableOpacity>
        
        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="shield" size={20} color="#234881" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Your Information is Secure</Text>
            <Text style={styles.infoText}>
              We use bank-level encryption to protect your personal data. Your information is only used for verification purposes and is never shared with third parties.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Modals */}
      <Modal
          visible={showErrorModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModal}>
              <View style={styles.errorIconContainer}>
                <Feather name="alert-circle" size={48} color="#d32f2f" />
              </View>
              <Text style={styles.errorModalTitle}>Error</Text>
              <Text style={styles.errorModalText}>{error}</Text>
              <TouchableOpacity 
                style={styles.errorModalButton} 
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.errorModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Confirm Info Bottom Sheet Modal */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.confirmModalOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmModalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.confirmModalContent}>
                <Feather name="check-circle" size={48} color="#27ae60" style={{ marginBottom: 16 }} />
                <Text style={styles.confirmModalTitle}>Confirm Your Information</Text>
                <Text style={styles.confirmModalSubtitle}>
                  Please verify that your information matches your official ID. Incorrect information may delay your transfer.
                </Text>
                
                <View style={styles.confirmInfoContainer}>
                  <View style={styles.confirmInfoRow}>
                    <Text style={styles.confirmInfoLabel}>Full Name:</Text>
                    <Text style={styles.confirmInfoValue}>{firstName.trim()} {lastName.trim()}</Text>
                  </View>
                  <View style={styles.confirmInfoRow}>
                    <Text style={styles.confirmInfoLabel}>Date of Birth:</Text>
                    <Text style={styles.confirmInfoValue}>
                      {dob.length === 8 ? `${dob.slice(2,4)}/${dob.slice(0,2)}/${dob.slice(4,8)}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.confirmModalActions}>
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.confirmButton]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.confirmModalButtonText}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.confirmModalButtonText}>Confirm & Continue</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmModalButton, styles.editButton]}
                  onPress={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  <Text style={[styles.confirmModalButtonText, { color: '#666' }]}>Edit Information</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
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
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
    width: '100%', // Prevent horizontal overflow
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    width: '100%', // Prevent horizontal overflow
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400', // Unbold labels
    marginBottom: 6,
    marginTop: 18,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 10, // Slightly reduced
    paddingHorizontal: 12, // Slightly reduced
    fontSize: 15, // Slightly reduced
    color: '#222',
    marginBottom: 0,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontWeight: '400', // Unbold input text
  },
  dobInput: {
    paddingLeft: 0,
    letterSpacing: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'left',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '400', // Unbold info text
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
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorModalButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  errorModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  confirmModalHeader: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  confirmModalContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmModalSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  confirmInfoContainer: {
    width: '100%',
  },
  confirmInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  confirmInfoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  confirmModalActions: {
    width: '100%',
  },
  confirmModalButton: {
    backgroundColor: '#234881',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmButton: {
    backgroundColor: '#234881',
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#222',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SenderDetails; 