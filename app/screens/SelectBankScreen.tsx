import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { useRecipient } from '../context/RecipientContext';
import { apiFetch } from '../utils/api';
import { getNextScreenForTransfer } from '../utils/profileUtils';

const { width } = Dimensions.get('window');

// Interface for dynamic bank data
interface Bank {
  id: string;
  name: string;
  code?: string;
  type: string;
  country: string;
  logo?: string;
  supportedMethods: string[];
  isActive: boolean;
}

// Function to get bank logo based on bank name
const getBankLogo = (bankName: string) => {
  const bankLogos: { [key: string]: any } = {
    // Pakistan Banks
    'National Bank of Pakistan': require('../../assets/images/nbp_bank.png'),
    'State Bank of Pakistan': require('../../assets/images/state_bank.png'),
    'Habib Bank Limited': require('../../assets/images/hbl_bank.png'),
    'Allied Bank Limited': require('../../assets/images/allied_bank.png'),
    'Metropolitan Bank': require('../../assets/images/metro_bank.png'),
    'Faysal Bank Limited': require('../../assets/images/faysal_bank.png'),
    'Askari Bank Limited': require('../../assets/images/askari_bank.png'),
    'UBL': require('../../assets/images/ubl_bank.png'),
    'United Bank Limited': require('../../assets/images/ubl_bank.png'),
    'MCB': require('../../assets/images/mcb_bank.png'),
    'MCB Bank Limited': require('../../assets/images/mcb_bank.png'),
    'Punjab Bank': require('../../assets/images/punjab_bank.png'),
    'Bank of Punjab': require('../../assets/images/punjab_bank.png'),
    'Soneri Bank Limited': require('../../assets/images/soneri_bank.png'),
    'Soneri Bank': require('../../assets/images/soneri_bank.png'),
    'Standard Chartered Bank': require('../../assets/images/standard_bank.png'),
    'Standard Chartered': require('../../assets/images/standard_bank.png'),
    'Zenith': require('../../assets/images/zenith.png'),
    'Zarai Taraqiati Bank Limited': require('../../assets/images/batch.png'),
    'ZTBL': require('../../assets/images/batch.png'),
    
    // US Banks
    'Chase Bank': require('../../assets/images/batch.png'),
    'Bank of America': require('../../assets/images/batch.png'),
    'Wells Fargo': require('../../assets/images/batch.png'),
    'Citibank': require('../../assets/images/batch.png'),
    'USAA Bank': require('../../assets/images/batch.png'),
    'PNC Bank': require('../../assets/images/batch.png'),
    
    // Nigeria Banks
                 'Guaranty Trust Bank': require('../../assets/images/first_bank.png'),
    'Zenith Bank': require('../../assets/images/zenith.png'),
    'Access Bank': require('../../assets/images/batch.png'),
    'First Bank of Nigeria': require('../../assets/images/first_bank.png'),
    'United Bank for Africa': require('../../assets/images/batch.png'),
    
    // Mobile Money
    'JazzCash': require('../../assets/images/batch.png'),
    'EasyPaisa': require('../../assets/images/batch.png'),
    'MTN MoMo': require('../../assets/images/batch.png'),
    'Airtel Money': require('../../assets/images/batch.png'),
    'M-Pesa': require('../../assets/images/batch.png'),
    'Vodafone Cash': require('../../assets/images/batch.png'),
    
    // India Banks
    'State Bank of India': require('../../assets/images/batch.png'),
    'HDFC Bank': require('../../assets/images/batch.png'),
    'ICICI Bank': require('../../assets/images/batch.png'),
    'Axis Bank': require('../../assets/images/batch.png'),
    'Paytm': require('../../assets/images/batch.png'),
    'PhonePe': require('../../assets/images/batch.png'),
    
    // Kenya Banks
    'Equity Bank': require('../../assets/images/batch.png'),
    'Kenya Commercial Bank': require('../../assets/images/batch.png'),
    'KCB': require('../../assets/images/batch.png'),
    
    // Ghana Banks
    'GCB Bank': require('../../assets/images/batch.png'),
    
    // Default fallback
    'default': require('../../assets/images/batch.png')
  };

  // Try to find exact match first
  if (bankLogos[bankName]) {
    return bankLogos[bankName];
  }
  
  // Try partial matches for variations
  for (const [key, logo] of Object.entries(bankLogos)) {
    if (bankName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(bankName.toLowerCase())) {
      return logo;
    }
  }
  
  // Return default logo if no match found
  return bankLogos['default'];
};

const SelectBankScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setSelectedBank, selectedBank, setCountry, country } = useRecipient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState('Send');
  const [moreSearch, setMoreSearch] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get transfer parameters from route
  const transferParams = {
    recipientId: params.recipientId as string,
    amount: params.amount as string,
    fromCurrency: params.fromCurrency as string,
    toCurrency: params.toCurrency as string
  };

  console.log('Transfer parameters received:', transferParams);

  // Fetch banks from dLocal API
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      setError('');
      try {
        // Use country from context or default to 'PK'
        const countryCode = country || 'PK';
        const res = await apiFetch(`/api/v1/dlocal/banks/${countryCode}`);
        if (res.success && res.data.banks) {
          setBanks(res.data.banks);
        } else {
          setError('No banks found for this country');
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
        setError('Failed to load banks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, [country]);

  // Filter banks based on search
  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(search.toLowerCase()) ||
    (bank.code && bank.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Get first 5 banks for main display
  const mainBanks = filteredBanks.slice(0, 5);
  
  // Get remaining banks for "More options"
  const moreBanks = filteredBanks.slice(5);

  const handleBankPress = (bank: Bank) => {
    setSelectedBank(bank);
    setShowModal(true);
    setShowMoreModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeMoreModal = () => {
    setShowMoreModal(false);
  };

  const handleContinue = async () => {
    if (!selectedBank) {
      setShowError(true);
      return;
    }
    
    try {
      // Navigate to RecipientBankDetailsScreen to collect bank details first
      console.log('Bank selected, navigating to RecipientBankDetailsScreen');
      router.push({
        pathname: '/screens/Recepentdetails',
        params: {
          ...transferParams,
          selectedBank: selectedBank.name,
          bankCode: selectedBank.code || selectedBank.id
        }
      });
    } catch (error) {
      console.error('Error navigating to recipient bank details:', error);
      // Fallback to default flow
      router.push({
        pathname: '/screens/Recepentdetails',
        params: {
          ...transferParams,
          selectedBank: selectedBank.name,
          bankCode: selectedBank.code || selectedBank.id
        }
      });
    }
  };

  const handlePopupContinue = async () => {
    setShowModal(false);
    if (selectedBank) {
      try {
        // Navigate to RecipientBankDetailsScreen to collect bank details first
        console.log('Bank selected (popup), navigating to RecipientBankDetailsScreen');
        router.push({
          pathname: '/screens/Recepentdetails',
          params: {
            ...transferParams,
            selectedBank: selectedBank.name,
            bankCode: selectedBank.code || selectedBank.id
          }
        });
      } catch (error) {
        console.error('Error navigating to recipient bank details:', error);
        // Fallback to default flow
        router.push({
          pathname: '/screens/Recepentdetails',
          params: {
            ...transferParams,
            selectedBank: selectedBank.name,
            bankCode: selectedBank.code || selectedBank.id
          }
        });
      }
    }
  };

  const closeError = () => {
    setShowError(false);
  };

  const filteredMoreBanks = moreBanks.filter(b => b.name.toLowerCase().includes(moreSearch.toLowerCase()));

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
        <Text style={styles.headerTitle}>Select Bank</Text>
      </View>
      {/* Progress Bar (commented out) */}
      {/* <View style={styles.progressBar} /> */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Title & Subtitle */}
        <Text style={styles.title}>Select your recipient's bank</Text>
        <Text style={styles.subtitle}>Recipients pays no fees.</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {/* Bank List */}
        {loading ? (
          <Text style={{textAlign:'center',marginVertical:20}}>Loading banks...</Text>
        ) : error ? (
          <Text style={{color:'red',textAlign:'center',marginVertical:20}}>{error}</Text>
        ) : (
          <View style={styles.bankList}>
            {mainBanks.map((bank, idx) => (
              <TouchableOpacity key={bank.id} style={[styles.bankItem, idx === mainBanks.length - 1 && styles.lastBankItem]} onPress={() => handleBankPress(bank)}>
                <Image source={getBankLogo(bank.name)} style={styles.bankLogo} resizeMode="contain" />
                <View style={styles.bankNameContainer}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  {selectedBank?.name === bank.name && (
                    <Feather name="check-circle" size={20} color="#27ae60" style={styles.bankCheckIcon} />
                  )}
                </View>
                <Feather name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* More Options */}
        <Text style={styles.moreOptionsTitle}>More options</Text>
        <View style={styles.moreOptionsBox}>
          <View style={styles.bankGrid}>
            {moreBanks.slice(0, 8).map((bank, idx) => (
              <View key={bank.id} style={styles.bankGridItem}>
                <Image source={getBankLogo(bank.name)} style={styles.bankGridLogo} resizeMode="contain" />
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setShowMoreModal(true)}>
            <Text style={styles.moreCount}>{moreBanks.length} more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Continue Button */}
      <View style={styles.continueBtnWrapper}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
      {/* Modal Popup for Bank Selection */}
      {showModal && selectedBank && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
            {/* Centered checkmark and logo */}
            <View style={styles.centeredIconWrap}>
              <Feather name="check-circle" size={40} color="#27ae60" style={styles.centeredCheckIcon} />
              <Image source={getBankLogo(selectedBank.name)} style={styles.selectedBankLogo} resizeMode="contain" />
            </View>
            <Text style={styles.modalTitle}>
              {selectedBank.name} bank has been selected
            </Text>
            <TouchableOpacity style={styles.modalContinueBtn} onPress={handlePopupContinue}>
              <Text style={styles.modalContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Modal for 20+ more banks */}
      {showMoreModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.moreModalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={closeMoreModal}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.moreModalTitle}>Select a bank</Text>
            {/* Search bar for more banks */}
            <View style={styles.moreModalSearchContainer}>
              <Feather name="search" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.moreModalSearchInput}
                placeholder="Search bank"
                placeholderTextColor="#999"
                value={moreSearch}
                onChangeText={setMoreSearch}
              />
            </View>
            <ScrollView contentContainerStyle={styles.moreModalGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.moreModalBankGrid}>
                {filteredMoreBanks.map((bank) => (
                  <TouchableOpacity key={bank.id} style={styles.moreModalBankItem} onPress={() => handleBankPress(bank)}>
                    <Image source={getBankLogo(bank.name)} style={styles.moreModalBankLogo} resizeMode="contain" />
                    {selectedBank?.name === bank.name && (
                      <Feather name="check-circle" size={20} color="#27ae60" style={styles.moreModalCheckIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
      {/* Error Modal */}
      {showError && (
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={closeError}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
            <Feather name="alert-circle" size={40} color="#e67e22" style={styles.errorIcon} />
            <Text style={styles.errorText}>Select a bank first</Text>
          </View>
        </View>
      )}
      {/* Bottom Navigation (Feather icons, professional) */}
      {/* Removed custom bottom navigation bar to prevent overlap with BottomNavBar */}
      <BottomNavBar activeTab="recipients" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },header: {
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
  },headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginLeft: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
  },progressBar: {
    height: 4,
    backgroundColor: '#234881',
    width: '100%',
    marginBottom: 8,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    textAlign: 'left',
  },searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  bankList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 5,
      },
    }),
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastBankItem: {
    borderBottomWidth: 0,
  },bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f5f6fa',
  },
  bankNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    flex: 1,
  },
  bankCheckIcon: {
    marginLeft: 8,
  },moreOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  moreOptionsBox: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankGridItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 12,
  },bankGridLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  moreCount: {
    textAlign: 'center',
    fontSize: 13,
    color: '#234881',
    fontWeight: '600',
  },continueBtnWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#234881',
    borderRadius: 8,
    alignItems: 'center',
  },continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  sendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#234881',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },modalClose: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 32, // increased space below the text
  },modalContinueBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#234881',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8, // add extra space above the button
  },
  modalContinueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },sendButtonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#234881',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },sendLabel: {
    fontSize: 10,
    color: '#999',
  },
  moreModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
    maxHeight: '80%',
  },moreModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  moreModalGrid: {
    width: '100%',
    alignItems: 'center',
  },moreModalBankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  moreModalBankItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },moreModalBankLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  moreModalCheckIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },selectedBankIconWrap: {
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    height: 90, // enough space for icon and logo
    justifyContent: 'flex-start',
  },
  selectedBankCheckIcon: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -20, // half of icon size to center
    zIndex: 2,
  },selectedBankLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 32, // space below check icon
    marginBottom: 12, // space below logo
    backgroundColor: '#fff',
    zIndex: 1,
    alignSelf: 'center',
  },
  modalCheckIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
  },moreModalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
    height: 44,
    width: '100%',
  },
  moreModalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingLeft: 8,
  },  errorModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
    position: 'relative',
    minHeight: 180,
  },errorIcon: {
    marginTop: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },centeredIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  centeredCheckIcon: {
    marginBottom: 8,
  },});

export default SelectBankScreen;