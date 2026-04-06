import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { countryFlags } from '../../assets/images/countryFlags';
import { apiFetch } from '../utils/api';

// Interface for dynamic data
interface Bank {
  id: string;
  name: string;
  code?: string;
  type: string;
  country: string;
  logo?: any;
  supportedMethods: string[];
  isActive: boolean;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  dialCode: string;
}

// Function to get bank logo based on bank name
const getBankLogo = (bankName: string) => {
  const bankLogos: { [key: string]: any } = {
    // Pakistan Banks
    'National Bank of Pakistan': require('../../assets/images/nbp_bank.png'),
    'NBP': require('../../assets/images/nbp_bank.png'),
    'State Bank of Pakistan': require('../../assets/images/state_bank.png'),
    'SBP': require('../../assets/images/state_bank.png'),
    'Habib Bank Limited': require('../../assets/images/hbl_bank.png'),
    'HBL': require('../../assets/images/hbl_bank.png'),
    'Allied Bank Limited': require('../../assets/images/allied_bank.png'),
    'ABL': require('../../assets/images/allied_bank.png'),
    'Metropolitan Bank': require('../../assets/images/metro_bank.png'),
    'Metro': require('../../assets/images/metro_bank.png'),
    'Faysal Bank Limited': require('../../assets/images/faysal_bank.png'),
    'FBL': require('../../assets/images/faysal_bank.png'),
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
    
    // Nigeria Banks
    'Zenith': require('../../assets/images/zenith.png'),
    'Zenith Bank': require('../../assets/images/zenith.png'),
    'GTB': require('../../assets/images/batch.png'),
    'Guaranty Trust Bank': require('../../assets/images/batch.png'),
    'Access': require('../../assets/images/batch.png'),
    'Access Bank': require('../../assets/images/batch.png'),
    'First Bank': require('../../assets/images/batch.png'),
    'First Bank of Nigeria': require('../../assets/images/batch.png'),
    'UBA': require('../../assets/images/batch.png'),
    'United Bank for Africa': require('../../assets/images/batch.png'),
    'Ecobank': require('../../assets/images/batch.png'),
    'Sterling Bank': require('../../assets/images/batch.png'),
    'Fidelity Bank': require('../../assets/images/batch.png'),
    'Union Bank': require('../../assets/images/batch.png'),
    'Stanbic IBTC': require('../../assets/images/batch.png'),
    
    // Kenya Banks
    'KCB': require('../../assets/images/batch.png'),
    'Kenya Commercial Bank': require('../../assets/images/batch.png'),
    'Equity Bank': require('../../assets/images/batch.png'),
    'Cooperative Bank': require('../../assets/images/batch.png'),
    'Standard Chartered Kenya': require('../../assets/images/standard_bank.png'),
    'Barclays Bank Kenya': require('../../assets/images/batch.png'),
    'NCBA Bank': require('../../assets/images/batch.png'),
    'DTB': require('../../assets/images/batch.png'),
    'Diamond Trust Bank': require('../../assets/images/batch.png'),
    
    // Ghana Banks
    'GCB Bank': require('../../assets/images/batch.png'),
    'Ghana Commercial Bank': require('../../assets/images/batch.png'),
    'Ecobank Ghana': require('../../assets/images/batch.png'),
    'Standard Chartered Ghana': require('../../assets/images/standard_bank.png'),
    'Fidelity Bank Ghana': require('../../assets/images/batch.png'),
    'CAL Bank': require('../../assets/images/batch.png'),
    'ADB': require('../../assets/images/batch.png'),
    'Agricultural Development Bank': require('../../assets/images/batch.png'),
    'Zenith Bank Ghana': require('../../assets/images/zenith.png'),
    
    // South Africa Banks
    'Standard Bank': require('../../assets/images/standard_bank.png'),
    'ABSA': require('../../assets/images/batch.png'),
    'FNB': require('../../assets/images/batch.png'),
    'First National Bank': require('../../assets/images/batch.png'),
    'Nedbank': require('../../assets/images/batch.png'),
    'Capitec Bank': require('../../assets/images/batch.png'),
    'African Bank': require('../../assets/images/batch.png'),
    'Discovery Bank': require('../../assets/images/batch.png'),
    'Tyme Bank': require('../../assets/images/batch.png'),
    
    // Egypt Banks
    'National Bank of Egypt': require('../../assets/images/batch.png'),
    'NBE': require('../../assets/images/batch.png'),
    'Banque Misr': require('../../assets/images/batch.png'),
    'Commercial International Bank': require('../../assets/images/batch.png'),
    'CIB': require('../../assets/images/batch.png'),
    'HSBC Egypt': require('../../assets/images/batch.png'),
    'QNB ALAHLI': require('../../assets/images/batch.png'),
    'Arab African International Bank': require('../../assets/images/batch.png'),
    'Bank of Alexandria': require('../../assets/images/batch.png'),
    
    // Morocco Banks
    'Attijariwafa Bank': require('../../assets/images/batch.png'),
    'Banque Populaire': require('../../assets/images/batch.png'),
    'BMCE Bank': require('../../assets/images/batch.png'),
    'Crédit Agricole du Maroc': require('../../assets/images/batch.png'),
    'Société Générale Maroc': require('../../assets/images/batch.png'),
    'BMCI': require('../../assets/images/batch.png'),
    'CDM': require('../../assets/images/batch.png'),
    'Crédit du Maroc': require('../../assets/images/batch.png'),
    
    // Tunisia Banks
    'STB': require('../../assets/images/batch.png'),
    'Société Tunisienne de Banque': require('../../assets/images/batch.png'),
    'BIAT': require('../../assets/images/batch.png'),
    'Banque Internationale Arabe de Tunisie': require('../../assets/images/batch.png'),
    'BNA': require('../../assets/images/batch.png'),
    'Banque Nationale Agricole': require('../../assets/images/batch.png'),
    'UIB': require('../../assets/images/batch.png'),
    'Union Internationale de Banques': require('../../assets/images/batch.png'),
    'Amen Bank': require('../../assets/images/batch.png'),
    'ATB': require('../../assets/images/batch.png'),
    'Arab Tunisian Bank': require('../../assets/images/batch.png'),
    
    // Uganda Banks
    'Stanbic Bank Uganda': require('../../assets/images/batch.png'),
    'Centenary Bank': require('../../assets/images/batch.png'),
    'DFCU Bank': require('../../assets/images/batch.png'),
    'Equity Bank Uganda': require('../../assets/images/batch.png'),
    'Standard Chartered Uganda': require('../../assets/images/standard_bank.png'),
    'Barclays Bank Uganda': require('../../assets/images/batch.png'),
    'KCB Bank Uganda': require('../../assets/images/batch.png'),
    'PostBank Uganda': require('../../assets/images/batch.png'),
    
    // USA Banks
    'Chase': require('../../assets/images/batch.png'),
    'JPMorgan Chase': require('../../assets/images/batch.png'),
    'Bank of America': require('../../assets/images/batch.png'),
    'Wells Fargo': require('../../assets/images/batch.png'),
    'Citibank': require('../../assets/images/batch.png'),
    'US Bank': require('../../assets/images/batch.png'),
    'PNC Bank': require('../../assets/images/batch.png'),
    'Capital One': require('../../assets/images/batch.png'),
    'TD Bank': require('../../assets/images/batch.png'),
    'Truist Bank': require('../../assets/images/batch.png'),
    
    // Default fallback for all other banks
    'default': require('../../assets/images/batch.png')
  };

  // Try to find exact match first
  if (bankLogos[bankName]) {
    return bankLogos[bankName];
  }
  
  // Try to find partial match (for cases where bank names might have slight variations)
  const partialMatch = Object.keys(bankLogos).find(key => 
    bankName.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(bankName.toLowerCase())
  );
  
  if (partialMatch && bankLogos[partialMatch]) {
    return bankLogos[partialMatch];
  }
  
  // Return default logo for all other banks
  return bankLogos['default'];
};

// Function to get country flag based on country code
const getCountryFlag = (countryCode: string) => {
  // Try to find exact match first
  if (countryFlags[countryCode]) {
    return { uri: countryFlags[countryCode] };
  }
  
  // Return default flag for all other countries
  return require('../../assets/images/batch.png');
};

const ChooseBankScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // State for dynamic data
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [originalBanks, setOriginalBanks] = React.useState<Bank[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // State for UI
  const [fromCountry, setFromCountry] = React.useState<Country | null>(null);
  const [toCountry, setToCountry] = React.useState<Country | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [countryModalType, setCountryModalType] = React.useState<'from' | 'to' | null>(null);
  const [countrySearch, setCountrySearch] = React.useState('');
  const [pressedCountry, setPressedCountry] = React.useState<string | null>(null);
  const [showAllBanksModal, setShowAllBanksModal] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);



  // Parse navigation parameters
  React.useEffect(() => {
    try {
      
      
      if (params.fromCountry && params.toCountry) {
        const fromCountryData = JSON.parse(params.fromCountry as string);
        const toCountryData = JSON.parse(params.toCountry as string);
        

        
        setFromCountry(fromCountryData);
        setToCountry(toCountryData);
      }
    } catch (err) {
      // Handle error silently
    }
  }, [params.fromCountry, params.toCountry]);

  // Fetch countries and banks data
  React.useEffect(() => {
    fetchInitialData();
  },[]); // This should only run once on mount

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch countries
      const countriesResponse = await apiFetch('/api/v1/dlocal/countries');
      
      if (countriesResponse.success && countriesResponse.data.countries) {
        const fetchedCountries = countriesResponse.data.countries;
        setCountries(fetchedCountries);
        
        // Set default countries if not already set from navigation params
        if (!fromCountry) {
          const defaultFrom = fetchedCountries.find(c => c.code === 'PK') || fetchedCountries[0];
          setFromCountry(defaultFrom);
          // Fetch banks for default from country
          if (defaultFrom) {
            await fetchBanks(defaultFrom.code);
          }
        } else {
          // Fetch banks for the already selected from country
          await fetchBanks(fromCountry.code);
        }
        
        if (!toCountry) {
          const defaultTo = fetchedCountries.find(c => c.code === 'NG') || fetchedCountries[1];
          setToCountry(defaultTo);
        }
      } else {
        // Enhanced fallback countries with complete list
        const fallbackCountries = [
          { code: 'US', name: 'United States', flag: 'US', currency: 'USD', dialCode: '+1' },
          { code: 'PK', name: 'Pakistan', flag: 'PK', currency: 'PKR', dialCode: '+92' },
          { code: 'NG', name: 'Nigeria', flag: 'NG', currency: 'NGN', dialCode: '+234' },
          { code: 'KE', name: 'Kenya', flag: 'KE', currency: 'KES', dialCode: '+254' },
          { code: 'GH', name: 'Ghana', flag: 'GH', currency: 'GHS', dialCode: '+233' },
          { code: 'ZA', name: 'South Africa', flag: 'ZA', currency: 'ZAR', dialCode: '+27' },
          { code: 'EG', name: 'Egypt', flag: 'EG', currency: 'EGP', dialCode: '+20' },
          { code: 'MA', name: 'Morocco', flag: 'MA', currency: 'MAD', dialCode: '+212' },
          { code: 'TN', name: 'Tunisia', flag: 'TN', currency: 'TND', dialCode: '+216' },
          { code: 'UG', name: 'Uganda', flag: 'UG', currency: 'UGX', dialCode: '+256' },
          { code: 'TR', name: 'Turkey', flag: 'TR', currency: 'TRY', dialCode: '+90' },
          { code: 'NZ', name: 'New Zealand', flag: 'NZ', currency: 'NZD', dialCode: '+64' }
        ];
        
        setCountries(fallbackCountries);
        
        if (!fromCountry) {
          const defaultFrom = fallbackCountries.find(c => c.code === 'PK') || fallbackCountries[0];
          setFromCountry(defaultFrom);
          // Fetch banks for default from country
          if (defaultFrom) {
            await fetchBanks(defaultFrom.code);
          }
        } else {
          // Fetch banks for the already selected from country
          await fetchBanks(fromCountry.code);
        }
        
        if (!toCountry) {
          const defaultTo = fallbackCountries.find(c => c.code === 'NG') || fallbackCountries[1];
          setToCountry(defaultTo);
        }
      }
    } catch (err) {
      // Handle error silently
      
      // Enhanced fallback on error
      const fallbackCountries = [
        { code: 'US', name: 'United States', flag: 'US', currency: 'USD', dialCode: '+1' },
        { code: 'PK', name: 'Pakistan', flag: 'PK', currency: 'PKR', dialCode: '+92' },
        { code: 'NG', name: 'Nigeria', flag: 'NG', currency: 'NGN', dialCode: '+234' },
        { code: 'KE', name: 'Kenya', flag: 'KE', currency: 'KES', dialCode: '+254' },
        { code: 'GH', name: 'Ghana', flag: 'GH', currency: 'GHS', dialCode: '+233' },
        { code: 'ZA', name: 'South Africa', flag: 'ZA', currency: 'ZAR', dialCode: '+27' },
        { code: 'EG', name: 'Egypt', flag: 'EG', currency: 'EGP', dialCode: '+20' },
        { code: 'MA', name: 'Morocco', flag: 'MA', currency: 'MAD', dialCode: '+212' },
        { code: 'TN', name: 'Tunisia', flag: 'TN', currency: 'TND', dialCode: '+216' },
        { code: 'UG', name: 'Uganda', flag: 'UG', currency: 'UGX', dialCode: '+256' }
      ];
      
      setCountries(fallbackCountries);
      
      if (!fromCountry) {
        const defaultFrom = fallbackCountries.find(c => c.code === 'PK') || fallbackCountries[0];
        setFromCountry(defaultFrom);
        // Try to fetch banks for default country
        if (defaultFrom) {
          await fetchBanks(defaultFrom.code);
        }
      }
      if (!toCountry) {
        const defaultTo = fallbackCountries.find(c => c.code === 'NG') || fallbackCountries[1];
        setToCountry(defaultTo);
      }
      
      setError('Using offline mode. Some features may be limited.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async (countryCode: string) => {
    try {
      const response = await apiFetch(`/api/v1/dlocal/banks/${countryCode}`);
      if (response.success && response.data.banks) {
        setBanks(response.data.banks);
        setOriginalBanks(response.data.banks); // Store original banks
      } else {
        // Use fallback banks
        const fallbackBanks = getFallbackBanks(countryCode);
        setBanks(fallbackBanks);
        setOriginalBanks(fallbackBanks);
      }
    } catch (err) {
      // Use fallback banks on error
      const fallbackBanks = getFallbackBanks(countryCode);
      setBanks(fallbackBanks);
      setOriginalBanks(fallbackBanks);
    }
  };

  // Enhanced function to get fallback banks for different countries
  const getFallbackBanks = (countryCode: string) => {
    const fallbackBanks: { [key: string]: Bank[] } = {
      'PK': [
        { id: 'pk1', name: 'NBP', code: 'NBP', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'pk2', name: 'HBL', code: 'HBL', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'pk3', name: 'MCB', code: 'MCB', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'pk4', name: 'UBL', code: 'UBL', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'pk5', name: 'Allied Bank Limited', code: 'ABL', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'pk6', name: 'Standard Chartered Bank', code: 'SC', type: 'bank', country: 'PK', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'NG': [
        { id: 'ng1', name: 'GTB', code: 'GTB', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ng2', name: 'Zenith', code: 'ZENITH', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ng3', name: 'Access', code: 'ACCESS', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ng4', name: 'First Bank', code: 'FIRST', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ng5', name: 'UBA', code: 'UBA', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ng6', name: 'Ecobank', code: 'ECOBANK', type: 'bank', country: 'NG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'KE': [
        { id: 'ke1', name: 'KCB', code: 'KCB', type: 'bank', country: 'KE', logo: null, supportedMethods: ['card', 'bank_transfer', 'mobile_money'], isActive: true },
        { id: 'ke2', name: 'Equity Bank', code: 'EQUITY', type: 'bank', country: 'KE', logo: null, supportedMethods: ['card', 'bank_transfer', 'mobile_money'], isActive: true },
        { id: 'ke3', name: 'Cooperative Bank', code: 'COOP', type: 'bank', country: 'KE', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ke4', name: 'Standard Chartered Kenya', code: 'SC_KE', type: 'bank', country: 'KE', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ke5', name: 'Barclays Bank Kenya', code: 'BARCLAYS_KE', type: 'bank', country: 'KE', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'GH': [
        { id: 'gh1', name: 'GCB Bank', code: 'GCB', type: 'bank', country: 'GH', logo: null, supportedMethods: ['card', 'bank_transfer', 'mobile_money'], isActive: true },
        { id: 'gh2', name: 'Ecobank Ghana', code: 'ECOBANK_GH', type: 'bank', country: 'GH', logo: null, supportedMethods: ['card', 'bank_transfer', 'mobile_money'], isActive: true },
        { id: 'gh3', name: 'Standard Chartered Ghana', code: 'SC_GH', type: 'bank', country: 'GH', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'gh4', name: 'Fidelity Bank Ghana', code: 'FIDELITY_GH', type: 'bank', country: 'GH', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'gh5', name: 'CAL Bank', code: 'CAL', type: 'bank', country: 'GH', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'ZA': [
        { id: 'za1', name: 'Standard Bank', code: 'STANDARD_ZA', type: 'bank', country: 'ZA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'za2', name: 'ABSA', code: 'ABSA', type: 'bank', country: 'ZA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'za3', name: 'FNB', code: 'FNB', type: 'bank', country: 'ZA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'za4', name: 'Nedbank', code: 'NEDBANK', type: 'bank', country: 'ZA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'za5', name: 'Capitec Bank', code: 'CAPITEC', type: 'bank', country: 'ZA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'EG': [
        { id: 'eg1', name: 'National Bank of Egypt', code: 'NBE', type: 'bank', country: 'EG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'eg2', name: 'Banque Misr', code: 'BM', type: 'bank', country: 'EG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'eg3', name: 'Commercial International Bank', code: 'CIB', type: 'bank', country: 'EG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'eg4', name: 'HSBC Egypt', code: 'HSBC_EG', type: 'bank', country: 'EG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'MA': [
        { id: 'ma1', name: 'Attijariwafa Bank', code: 'AWB', type: 'bank', country: 'MA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ma2', name: 'Banque Populaire', code: 'BP', type: 'bank', country: 'MA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ma3', name: 'BMCE Bank', code: 'BMCE', type: 'bank', country: 'MA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ma4', name: 'Crédit Agricole du Maroc', code: 'CAM', type: 'bank', country: 'MA', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'TN': [
        { id: 'tn1', name: 'STB', code: 'STB', type: 'bank', country: 'TN', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'tn2', name: 'BIAT', code: 'BIAT', type: 'bank', country: 'TN', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'tn3', name: 'BNA', code: 'BNA', type: 'bank', country: 'TN', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'tn4', name: 'UIB', code: 'UIB', type: 'bank', country: 'TN', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'tn5', name: 'Amen Bank', code: 'AMEN', type: 'bank', country: 'TN', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'UG': [
        { id: 'ug1', name: 'Stanbic Bank Uganda', code: 'STANBIC_UG', type: 'bank', country: 'UG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ug2', name: 'Centenary Bank', code: 'CENTENARY', type: 'bank', country: 'UG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ug3', name: 'DFCU Bank', code: 'DFCU', type: 'bank', country: 'UG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ug4', name: 'Equity Bank Uganda', code: 'EQUITY_UG', type: 'bank', country: 'UG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'ug5', name: 'Standard Chartered Uganda', code: 'SC_UG', type: 'bank', country: 'UG', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ],
      'US': [
        { id: 'us1', name: 'Chase', code: 'CHASE', type: 'bank', country: 'US', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'us2', name: 'Bank of America', code: 'BOA', type: 'bank', country: 'US', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'us3', name: 'Wells Fargo', code: 'WELLS_FARGO', type: 'bank', country: 'US', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'us4', name: 'Citibank', code: 'CITIBANK', type: 'bank', country: 'US', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true },
        { id: 'us5', name: 'US Bank', code: 'US_BANK', type: 'bank', country: 'US', logo: null, supportedMethods: ['card', 'bank_transfer'], isActive: true }
      ]
    };
    
    return fallbackBanks[countryCode] || fallbackBanks['PK'] || [];
  };

  const handleCountryChange = async (country: Country, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromCountry(country);
      // Fetch banks for the new from country
      await fetchBanks(country.code);
    } else {
      setToCountry(country);
    }
    
    // Close the modal
    setCountryModalType(null);
    
    // Clear the search
    setCountrySearch('');
  };

  const visibleBanks = banks.slice(0, 4);

  // Memoize filtered countries to prevent unnecessary recalculations
  const filteredCountries = React.useMemo(() => 
    countries.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countries, countrySearch]
  );

  const handleBankSelection = (bank: Bank) => {
    setSelectedBank(bank);
    setShowAllBanksModal(false);
    // Reset banks to original list when closing modal
    setBanks(originalBanks);
  };

  const handleNext = () => {
    if (!selectedBank) {
      setError('Please select a bank to continue');
      return;
    }
    router.push('/screens/signup');
  };

  const closeBankModal = () => {
    setShowAllBanksModal(false);
    // Reset banks to original list when closing modal
    setBanks(originalBanks);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#234881" />
          <Text style={styles.loadingText}>Loading banks and countries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInitialData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/screens/WalletScreen');
            }
          }}>
            <MaterialIcons name="arrow-back" size={24} color="#234881" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="help-outline" size={26} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Send bank deposit or mobile money, or to over 10,000 cash pickup locations
          </Text>
        </View>

        {/* From Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>From</Text>
          <TouchableOpacity style={styles.countrySelector} onPress={() => { setCountryModalType('from'); }}>
            <View style={styles.countryContent}>
              <View style={styles.flagContainer}>
                <Image source={fromCountry ? getCountryFlag(fromCountry.code) : require('../../assets/images/batch.png')} style={{ width: 32, height: 20, borderRadius: 3 }} resizeMode="contain" />
              </View>
              <Text style={styles.countryText}>{fromCountry?.name || 'Select Country'}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={28} color="#666" />
          </TouchableOpacity>

        </View>

        {/* To Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>To</Text>
          <TouchableOpacity style={styles.countrySelector} onPress={() => { setCountryModalType('to'); }}>
            <View style={styles.countryContent}>
              <View style={styles.flagContainer}>
                <Image source={toCountry ? getCountryFlag(toCountry.code) : require('../../assets/images/batch.png')} style={{ width: 32, height: 20, borderRadius: 3 }} resizeMode="contain" />
              </View>
              <Text style={styles.countryText}>{toCountry?.name || 'Select Country'}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={28} color="#666" />
          </TouchableOpacity>

        </View>

        {/* Bank Options */}
        <View style={styles.bankContainer}>
          {banks.length > 0 ? (
            visibleBanks.map((bank, idx) => (
              <TouchableOpacity 
                key={bank.id} 
                style={styles.bankButton}
                onPress={() => handleBankSelection(bank)}
              >
                <Image source={getBankLogo(bank.name)} style={styles.bankLogoImg} resizeMode="contain" />
                <Text style={styles.bankName}>{bank.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noBanksContainer}>
              <Text style={styles.noBanksText}>No banks available for this country</Text>
              <Text style={styles.noBanksSubtext}>Please select a different country</Text>
            </View>
          )}
        </View>

        {/* More Link */}
        {banks.length > 4 && (
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowAllBanksModal(true)}>
            <Text style={styles.moreText}>more</Text>
          </TouchableOpacity>
        )}

        {/* Selected Bank Display */}
        {selectedBank && (
          <View style={styles.selectedBankContainer}>
            <Text style={styles.selectedBankLabel}>Selected Bank:</Text>
            <View style={styles.selectedBankCard}>
              <Image source={getBankLogo(selectedBank.name)} style={styles.selectedBankLogo} resizeMode="contain" />
              <Text style={styles.selectedBankName}>{selectedBank.name}</Text>
            </View>
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#234881' }]} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.seafarerButton}>
            <Text style={styles.seafarerIcon}>⚓</Text>
            <Text style={styles.seafarerText}>Signup as a Seafarer</Text>
          </TouchableOpacity>
          
          <View style={styles.signInContainer}>
            <Text style={styles.signInPrompt}>Already have a profile? </Text>
            <TouchableOpacity onPress={() => router.push('/screens/signin')}>
              <Text style={styles.signInText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Country Change Modal */}
        <Modal
          visible={countryModalType !== null}
          animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
          transparent={true}
          onRequestClose={() => setCountryModalType(null)}
        >
          <View style={styles.profModalOverlay}>
            <View style={styles.profModalCard}>
              <View style={styles.profModalHeader}>
                <Text style={styles.profModalTitle}>Select Country</Text>
                <TouchableOpacity onPress={() => setCountryModalType(null)} style={styles.profModalCloseBtn}>
                  <Text style={styles.profModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profModalDivider} />
              <TextInput
                style={styles.profModalSearch}
                placeholder="Search country..."
                placeholderTextColor="#aaa"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
              <ScrollView contentContainerStyle={styles.profModalList} keyboardShouldPersistTaps="handled">
                {filteredCountries.length === 0 ? (
                  <Text style={styles.profModalNoResult}>No countries found.</Text>
                ) : filteredCountries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.profModalCountryRow,
                      pressedCountry === country.code && styles.profModalCountryRowActive,
                    ]}
                    onPressIn={() => setPressedCountry(country.code)}
                    onPressOut={() => setPressedCountry(null)}
                    onPress={() => {
                      handleCountryChange(country, countryModalType === 'from' ? 'from' : 'to');
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={getCountryFlag(country.code)} style={styles.profModalFlag} resizeMode="contain" />
                    <Text style={styles.profModalCountryName}>{country.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal for all banks */}
        <Modal
          visible={showAllBanksModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeBankModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Bank</Text>
                <TouchableOpacity onPress={closeBankModal} style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Bank Search */}
              <View style={styles.bankSearchContainer}>
                <MaterialIcons name="search" size={20} color="#666" style={styles.bankSearchIcon} />
                <TextInput
                  style={styles.bankSearchInput}
                  placeholder="Search banks..."
                  placeholderTextColor="#999"
                  onChangeText={(text) => {
                    // Filter banks based on search
                    const filtered = originalBanks.filter(bank => 
                      bank.name.toLowerCase().includes(text.toLowerCase())
                    );
                    // Update the banks list for display
                    setBanks(filtered);
                  }}
                />
              </View>
              
              <FlatList
                data={banks}
                keyExtractor={item => item.id}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.bankItem}
                    onPress={() => handleBankSelection(item)}
                  >
                    <View style={styles.bankItemContainer}>
                      <Image source={getBankLogo(item.name)} style={styles.bankItemLogo} resizeMode="contain" />
                      <Text style={styles.bankItemName}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
              
              <TouchableOpacity style={styles.closeButton} onPress={closeBankModal}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    paddingTop: 15,
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    marginRight: 16,
  },
  countryText: {
    fontSize: 19,
    color: '#000000',
    fontWeight: '400',
  },
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginVertical: 40,
    alignItems: 'center',
  },
  bankButton: {
    alignItems: 'center',
  },
  bankLogoImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  bankName: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  moreButton: {
    alignItems: 'center',
    marginBottom: 30,
  },
  moreText: {
    fontSize: 18,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  selectedBankContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  selectedBankLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  selectedBankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  selectedBankLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  selectedBankName: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#234881',
    marginHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  seafarerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  seafarerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  seafarerText: {
    fontSize: 19,
    color: '#000000',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: 17,
    color: '#666666',
  },
  signInText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  profModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.18)',
      },
      default: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
    maxHeight: '85%',
  },
  profModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  profModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  profModalCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  profModalClose: {
    fontSize: 26,
    color: '#888',
  },
  profModalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 0,
    marginBottom: 0,
  },
  profModalSearch: {
    margin: 18,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 17,
    backgroundColor: '#f8fafc',
    color: '#222',
  },
  profModalList: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 18,
    minHeight: 120,
  },
  profModalCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 2,
    backgroundColor: '#fff',
  },
  profModalCountryRowActive: {
    backgroundColor: '#e0e7ff',
  },
  profModalFlag: {
    width: 36,
    height: 24,
    borderRadius: 4,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  profModalCountryName: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
  profModalNoResult: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        elevation: 15,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e40af',
  },
  modalCloseButton: {
    padding: 8,
  },
  bankItem: {
    flex: 1,
    margin: 8,
    maxWidth: '30%',
  },
  bankItemContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bankItemLogo: {
    width: 50,
    height: 50,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  bankItemName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    margin: 20,
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#234881',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noBanksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBanksText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  noBanksSubtext: {
    fontSize: 15,
    color: '#666',
  },
  bankSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bankSearchIcon: {
    marginLeft: 15,
  },
  bankSearchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#222',
  },
});

export default ChooseBankScreen;