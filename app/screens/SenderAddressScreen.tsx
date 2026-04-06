import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { apiFetch } from '../utils/api';
import { getNextScreenForTransfer } from '../utils/profileUtils';

// Enhanced interface for address data
interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  dialCode: string;
}

interface StateProvince {
  code: string;
  name: string;
  country: string;
}

const SenderAddressScreen = () => {
  const [activeTab, setActiveTab] = useState('Send');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [zip, setZip] = useState('');
  
  // Selection states
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<StateProvince | null>(null);
  
  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Data states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<StateProvince[]>([]);
  
  // Error state
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch countries on component mount
  useEffect(() => {
    checkProfileCompletion();
    fetchCountries();
  },[]);

  // Check if user already has address information
  const checkProfileCompletion = async () => {
    try {
      console.log('SenderAddressScreen - Checking profile completion...');
      const nextScreen = await getNextScreenForTransfer();
      console.log('SenderAddressScreen - Next screen determined:', nextScreen);
      
      // If next screen is not this one, user can skip this screen
      if (nextScreen !== '/screens/SenderAddressScreen') {
        console.log('User can skip address screen, navigating to:', nextScreen);
        // Only redirect if user has complete address information
        // This prevents infinite redirects
        if (nextScreen === '/screens/senderdetails' || nextScreen === '/screens/SenderPhoneScreen') {
          console.log('Preventing redirect back to previous screens - user should be here');
          return;
        }
        router.replace(nextScreen as any);
        return;
      }
    } catch (error) {
      console.log('Error checking profile completion:', error);
      // Continue with address screen if there's an error
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry.code);
      // Reset state and city when country changes
      setSelectedState(null);
    }
  }, [selectedCountry]);

  // Fetch countries from geographic API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await apiFetch('/api/v1/geographic/countries', {
        method: 'GET',
      });
      setCountries(response.data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
      // Fallback to basic countries if API fails
      setCountries([
        { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', dialCode: '+1' },
        { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', dialCode: '+92' },
        { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', dialCode: '+234' },
        { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', dialCode: '+254' },
        { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', dialCode: '+233' },
        { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', dialCode: '+91' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', dialCode: '+44' },
        { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', dialCode: '+1' },
        { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', dialCode: '+61' },
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states/provinces for a country
  const fetchStates = async (countryCode: string) => {
    setLoadingStates(true);
    try {
      const response = await apiFetch(`/api/v1/geographic/states/${countryCode}`, {
        method: 'GET',
      });
      setStates(response.data || []);
    } catch (err) {
      console.error('Error fetching states:', err);
      // Fallback to mock data if API fails
      const mockStates = getMockStatesForCountry(countryCode);
      setStates(mockStates);
    } finally {
      setLoadingStates(false);
    }
  };

  // Mock states data (replace with real API call)
  const getMockStatesForCountry = (countryCode: string): StateProvince[] => {
    const statesMap: { [key: string]: StateProvince[] } = {
      'US': [
        { code: 'CA', name: 'California', country: 'US' },
        { code: 'TX', name: 'Texas', country: 'US' },
        { code: 'NY', name: 'New York', country: 'US' },
        { code: 'FL', name: 'Florida', country: 'US' },
        { code: 'IL', name: 'Illinois', country: 'US' },
      ],
      'PK': [
        { code: 'PUN', name: 'Punjab', country: 'PK' },
        { code: 'SIN', name: 'Sindh', country: 'PK' },
        { code: 'KPK', name: 'Khyber Pakhtunkhwa', country: 'PK' },
        { code: 'BAL', name: 'Balochistan', country: 'PK' },
        { code: 'GB', name: 'Gilgit-Baltistan', country: 'PK' },
      ],
      'NG': [
        { code: 'LAG', name: 'Lagos', country: 'NG' },
        { code: 'KAN', name: 'Kano', country: 'NG' },
        { code: 'KAD', name: 'Kaduna', country: 'NG' },
        { code: 'RIV', name: 'Rivers', country: 'NG' },
        { code: 'BAU', name: 'Bauchi', country: 'NG' },
        { code: 'BOR', name: 'Borno', country: 'NG' },
      ],
      'KE': [
        { code: 'NAI', name: 'Nairobi', country: 'KE' },
        { code: 'MOM', name: 'Mombasa', country: 'KE' },
        { code: 'KIS', name: 'Kisumu', country: 'KE' },
        { code: 'NAK', name: 'Nakuru', country: 'KE' },
        { code: 'ELD', name: 'Eldoret', country: 'KE' },
      ],
      'IN': [
        { code: 'MH', name: 'Maharashtra', country: 'IN' },
        { code: 'UP', name: 'Uttar Pradesh', country: 'IN' },
        { code: 'KA', name: 'Karnataka', country: 'IN' },
        { code: 'TN', name: 'Tamil Nadu', country: 'IN' },
        { code: 'AP', name: 'Andhra Pradesh', country: 'IN' },
        { code: 'GJ', name: 'Gujarat', country: 'IN' },
      ],
      'GB': [
        { code: 'ENG', name: 'England', country: 'GB' },
        { code: 'SCT', name: 'Scotland', country: 'GB' },
        { code: 'WLS', name: 'Wales', country: 'GB' },
        { code: 'NIR', name: 'Northern Ireland', country: 'GB' },
      ],
      'CA': [
        { code: 'ON', name: 'Ontario', country: 'CA' },
        { code: 'QC', name: 'Quebec', country: 'CA' },
        { code: 'BC', name: 'British Columbia', country: 'CA' },
        { code: 'AB', name: 'Alberta', country: 'CA' },
        { code: 'NS', name: 'Nova Scotia', country: 'CA' },
      ],
    };
    
    return statesMap[countryCode] || [];
  };

  const handleConfirm = async () => {
    if (!selectedCountry || !selectedState || !street || !zip) {
      setError('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    try {
      await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          street,
          apartment,
          state: selectedState.name,
          country: selectedCountry.name,
          zip,
        }),
      });
      
      // Check where to navigate next based on profile completion
      try {
        console.log('Address saved successfully, checking next screen...');
        const nextScreen = await getNextScreenForTransfer();
        console.log('Next screen after address:', nextScreen);
        
        // Ensure we navigate forward, not backward
        if (nextScreen === '/screens/senderdetails' || nextScreen === '/screens/SenderAddressScreen') {
          console.log('Forcing navigation to phone screen instead of backward');
          router.push('/screens/SenderPhoneScreen');
        } else {
          console.log('Navigating to determined next screen:', nextScreen);
          router.push(nextScreen as any);
        }
      } catch (error) {
        console.error('Error checking next screen:', error);
        // Fallback to default flow
        console.log('Falling back to phone screen');
        router.push('/screens/SenderPhoneScreen');
      }
    } catch (err) {
      setError('Failed to save address');
      setShowErrorModal(true);
    }
  };

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
        {/* Content */}
        <Text style={styles.title}>Sender address</Text>
        
        {/* Street address line 1 */}
        <Text style={styles.label}>Street address line 1 *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, Street address line 1"
          placeholderTextColor="#999"
          value={street}
          onChangeText={setStreet}
        />
        
        {/* Apartment, Suite, unit */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={styles.label}>Apartment, Suite, unit</Text>
          <Text style={styles.optional}>(optional)</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="e.g, Apartment, Suite, unit"
          placeholderTextColor="#999"
          value={apartment}
          onChangeText={setApartment}
        />
        
        {/* Country Selection */}
        <Text style={styles.label}>Country *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dropdown]}
          onPress={() => setShowCountryModal(true)}
          activeOpacity={0.8}
        >
          {selectedCountry ? (
            <View style={styles.selectedItem}>
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.dropdownText}>{selectedCountry.name}</Text>
            </View>
          ) : (
            <Text style={[styles.dropdownText, { color: '#999' }]}>Select a country</Text>
          )}
          <Feather name="chevron-down" size={22} color="#999" style={{ position: 'absolute', right: 16, top: 16 }} />
        </TouchableOpacity>
        
        {/* State/Province Selection */}
        <Text style={styles.label}>State/Province *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dropdown, !selectedCountry && styles.disabledInput]}
          onPress={() => selectedCountry && setShowStateModal(true)}
          activeOpacity={selectedCountry ? 0.8 : 1}
          disabled={!selectedCountry}
        >
          {selectedState ? (
            <Text style={styles.dropdownText}>{selectedState.name}</Text>
          ) : (
            <Text style={[styles.dropdownText, { color: '#999' }]}>
              {selectedCountry ? 'Select a state/province' : 'Select country first'}
            </Text>
          )}
          <Feather name="chevron-down" size={22} color="#999" style={{ position: 'absolute', right: 16, top: 16 }} />
        </TouchableOpacity>
        
        {/* Zip/Postal Code */}
        <Text style={styles.label}>Zip/Postal Code *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, Zip code"
          placeholderTextColor="#999"
          value={zip}
          onChangeText={setZip}
          keyboardType="number-pad"
        />
        
        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, (!selectedCountry || !selectedState || !street || !zip) && styles.disabledBtn]}
          onPress={handleConfirm}
          disabled={!selectedCountry || !selectedState || !street || !zip}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a country</Text>
            {loadingCountries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#234881" />
                <Text style={styles.loadingText}>Loading countries...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScrollView}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={styles.flag}>{country.flag}</Text>
                    <Text style={styles.modalItemText}>{country.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setShowCountryModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State/Province Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a state/province</Text>
            {loadingStates ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#234881" />
                <Text style={styles.loadingText}>Loading states...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScrollView}>
                {states.map((state) => (
                  <TouchableOpacity
                    key={state.code}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedState(state);
                      setShowStateModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{state.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setShowStateModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather name="alert-circle" size={40} color="#d32f2f" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setShowErrorModal(false)} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
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
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    flex: 1,
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
    width: '32%',
    height: 4,
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased padding to prevent overlap with BottomNavBar
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
    textAlign: 'left',
    marginTop: 0,
  },
  label: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'left',
  },
  optional: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
    marginLeft: 6,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 0,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontWeight: '400',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 40,
    position: 'relative',
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 8,
    maxHeight: 180,
    width: '100%',
    alignSelf: 'center',
    zIndex: 10,
    elevation: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
  default: {
        elevation: 5,
      },
    }),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#222',
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
        zIndex: 10,
      },
    }),
  },
  sendLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#234881',
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#234881',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#234881',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledInput: {
    opacity: 0.7,
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

export default SenderAddressScreen; 